import { attachDatabasePool } from '@vercel/functions';
import dotenv from 'dotenv';
import type { PoolOptions } from 'mysql2';
import { createPool } from 'mysql2';
import fs from 'node:fs';

dotenv.config();

const DEFAULT_CONNECTION_LIMIT = 100;

const config: PoolOptions = {
  charset: process.env.DB2_CHARSET,
  connectionLimit: typeof process.env.DB2_CONNECTION_LIMIT === 'undefined' ? DEFAULT_CONNECTION_LIMIT : parseInt(process.env.DB2_CONNECTION_LIMIT, 10),
  database: process.env.DB2_DATABASE,
  debug: process.env.DB2_DEBUG === 'TRUE',
  password: process.env.DB2_PASSWORD,
  user: process.env.DB2_USERNAME,
  idleTimeout: 5000, // five seconds as per https://vercel.com/kb/guide/connection-pooling-with-functions
  maxIdle: 0, // how many connections to keep regardless of the timeout
};

if (typeof process.env.DB2_SOCKET_PATH !== 'undefined') {
  config.socketPath = process.env.DB2_SOCKET_PATH;
} else if (typeof process.env.DB2_HOST !== 'undefined') {
  config.host = process.env.DB2_HOST;
}

if (typeof process.env.DB2_SSL !== 'undefined' && process.env.DB2_SSL === 'true') {
  config.ssl = {};
  if (typeof process.env.DB2_CLIENT_CERT !== 'undefined') {
    config.ssl.cert = fs.readFileSync(process.env.DB2_CLIENT_CERT);
  }
  if (typeof process.env.DB2_CLIENT_KEY !== 'undefined') {
    config.ssl.key = fs.readFileSync(process.env.DB2_CLIENT_KEY);
  }
  if (typeof process.env.DB2_SERVER_CA !== 'undefined') {
    config.ssl.ca = fs.readFileSync(process.env.DB2_SERVER_CA);
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
