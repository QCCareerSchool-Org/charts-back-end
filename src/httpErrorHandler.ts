import * as HttpStatus from '@qccareerschool/http-status';
import { NextFunction, Request, Response } from 'express';
import { logger } from './logger';

export const httpErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  if (!res.headersSent) {
    if (err instanceof HttpStatus.HttpResponse) {
      // only log server errors, not client errors
      if (err.isServerError()) {
        logger.error(err);
      }
      res.status(err.statusCode).send(err.message);
      return;
    }
  }
  next(err);
};
