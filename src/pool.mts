import { attachDatabasePool } from '@vercel/functions';
import type { PoolOptions } from 'mysql2';
import { createPool } from 'mysql2';

const DEFAULT_CONNECTION_LIMIT = 5;

const config: PoolOptions = {
  charset: process.env.DB_CHARSET,
  connectionLimit: typeof process.env.DB_CONNECTION_LIMIT === 'undefined' ? DEFAULT_CONNECTION_LIMIT : parseInt(process.env.DB_CONNECTION_LIMIT, 10),
  database: process.env.DB_DATABASE,
  debug: process.env.DB_DEBUG === 'TRUE',
  password: process.env.DB_PASSWORD,
  user: process.env.DB_USERNAME,
  idleTimeout: 5000, // five seconds as per https://vercel.com/kb/guide/connection-pooling-with-functions
  maxIdle: 0, // how many connections to keep regardless of the timeout
};

if (typeof process.env.DB_SOCKET_PATH !== 'undefined') {
  config.socketPath = process.env.DB_SOCKET_PATH;
} else if (typeof process.env.DB_HOST !== 'undefined') {
  config.host = process.env.DB_HOST;
}

if (typeof process.env.DB_SSL !== 'undefined' && process.env.DB_SSL === 'true') {
  config.ssl = {};
  if (typeof process.env.DB_SERVER_CA !== 'undefined') {
    config.ssl.ca = Buffer.from(process.env.DB_SERVER_CA, 'base64').toString('utf8');
  }
}

const rawPool = createPool(config);

if (process.env.NODE_ENV === 'production') {
  attachDatabasePool(rawPool);
}

export const pool = rawPool.promise();

export async function closePool(): Promise<void> {
  await rawPool.promise().end();
};
