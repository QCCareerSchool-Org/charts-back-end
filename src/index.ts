import bodyParser from 'body-parser';
import compression from 'compression';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';

import { checkValidation } from './checkValidation';
import { errorHandler } from './errorHandler';
import { httpErrorHandler } from './httpErrorHandler';
import { logger } from './logger';
import { router } from './router';

dotenv.config();

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;

const app = express();
app.use(cors({
  origin: 'https://secure.qccareerschool.com',
  credentials: true,
}));
app.use(helmet());
app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(checkValidation);
app.use(router);
app.use(httpErrorHandler);
app.use(errorHandler);
app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});
