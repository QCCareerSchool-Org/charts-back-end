import dotenv from 'dotenv';
import type { RequestHandler } from 'express';
import type { Result } from 'generic-result-type';
import { failure, success } from 'generic-result-type';
import jwt from 'jsonwebtoken';

import type { Payload } from '#src/domain/payload.mjs';
import { isPayload } from '#src/domain/payload.mjs';

dotenv.config();

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Locals {
      payload?: Payload;
    }
  }
}

const issuer = 'https://www.qccareerschool.com';

const secret = process.env.JWT_SECRET;
if (typeof secret === 'undefined') {
  throw Error('JWT_SECRET environment variable is required');
}

export const checkValidationMiddleware: RequestHandler = async (req, res, next) => {
  const cookies = req.cookies as Record<string, string | undefined>;

  console.log(cookies);

  const accessToken = cookies.access;
  if (typeof accessToken === 'undefined') {
    res.status(401).send('Access token missing');
    return;
  }

  const payloadResult = await decode(accessToken);
  if (!payloadResult.success) {
    res.status(401).send('Invalid access token');
    return;
  }

  if (!(req.method === 'HEAD' || req.method === 'GET' || req.method === 'OPTIONS')) {
    // check for X-XSRF-TOKEN header
    const xsrfToken = req.headers['x-xsrf-token'];
    if (typeof xsrfToken === 'undefined') {
      res.status(401).send('XSRF token missing');
      return;
    }

    // check that the XSRF token matches what's stored the access token's payload
    if (typeof payloadResult.value.xsrf === 'undefined' || payloadResult.value.xsrf !== xsrfToken) {
      res.status(401).send('Invalid XSRF token');
      return;
    }
  }

  res.locals.payload = payloadResult.value;

  next();
};

const decode = async (token: string): Promise<Result<Payload>> => {
  return new Promise(resolve => {
    jwt.verify(token, secret, { issuer }, (err, result) => {
      if (err) {
        resolve(failure(err instanceof Error ? err : Error(String(err))));
        return;
      }
      if (!isPayload(result)) {
        resolve(failure(Error('Invalid payload')));
        return;
      }
      resolve(success(result));
    });
  });
};
