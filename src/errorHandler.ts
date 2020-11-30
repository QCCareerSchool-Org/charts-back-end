import { NextFunction, Request, Response } from 'express';
import { logger } from './logger';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  logger.error(err);
  if (!res.headersSent) {
    res.status(500).send(err.message);
  } else {
    next(err);
  }
};
