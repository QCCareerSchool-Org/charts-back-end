import * as HttpStatus from '@qccareerschool/http-status';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

import { asyncWrapper } from './asyncWrapper';

dotenv.config();

const issuer = 'https://www.qccareerschool.com';

const secret = process.env.JWT_SECRET;
if (typeof secret === 'undefined') {
  throw Error('JWT_SECRET environment variable is required');
}

const verify = (token: string): Promise<any> => {
  return new Promise((res, rej) => {
    jwt.verify(token, secret, { issuer }, (err, decoded) => {
      if (err) {
        return rej(err);
      }
      res(decoded);
    });
  });
};

export const checkValidation = asyncWrapper(async (req, res, next) => {
  // check for access token
  const accessToken = req.cookies.get('access');
  if (typeof accessToken === 'undefined') {
    throw new HttpStatus.Unauthorized('No access token detected');
  }

  // decode the access token
  let payload: any;
  try {
    payload = await verify(accessToken);
  } catch (err) {
    throw new HttpStatus.Unauthorized('Invalid access token');
  }

  if (!(req.method === 'HEAD' || req.method === 'GET')) {
    // check for X-XSRF-TOKEN header
    const xsrfToken = req.headers['x-xsrf-token'];
    if (typeof xsrfToken === 'undefined') {
      throw new HttpStatus.Unauthorized('XSRF token missing');
    }

    // check that the XSRF token matches what's stored the access token's payload
    if (typeof payload.xsrf === 'undefined' || payload.xsrf !== xsrfToken) {
      throw new HttpStatus.Unauthorized('Invalid XSRF token');
    }
  }

  res.locals.payload = payload;

  next();
});
