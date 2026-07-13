import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors, { type CorsOptions } from 'cors';
import express from 'express';
import helmet from 'helmet';

import { globalErrorHandler } from './handlers/globalErrorHandler.mjs';
import { cacheHeadersMiddleware } from './middleware/cacheHeaders.mjs';
import { checkValidationMiddleware } from './middleware/checkValidation.mjs';
import { router } from './router.mjs';

const corsOptions: CorsOptions = {
  origin: 'https://secure.qccareerschool.com',
  credentials: true,
};

const app = express();

app.use(cors(corsOptions));
app.use(helmet());
app.use(compression());
app.use(cookieParser());
app.use(express.json());

if (process.env.NODE_ENV === 'production') {
  app.use(cacheHeadersMiddleware);
  app.use(checkValidationMiddleware);
}

app.use(router);

app.use(globalErrorHandler);

if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT ?? 8080;
  app.listen(port, () => {
    console.log(`listening on port ${port}`);
  });
}

export default app;
