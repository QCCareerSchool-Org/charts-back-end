import { attachDatabasePool } from '@vercel/functions';
import type { PoolOptions } from 'mysql2';
import { createPool } from 'mysql2';

import config from '#src/config.mjs';

const options: PoolOptions = {
  host: config.db2.host,
  charset: config.db2.charset,
  connectionLimit: config.db2.connectionLimit,
  database: config.db2.database,
  password: config.db2.password,
  user: config.db2.user,
  ssl: { ca: config.db2.serverCA },
  decimalNumbers: true,
  idleTimeout: 5000, // five seconds as per https://vercel.com/kb/guide/connection-pooling-with-functions
  maxIdle: 0, // how many connections to keep regardless of the timeout
};

const rawPool = createPool(options);

if (config.env === 'production') {
  attachDatabasePool(rawPool);
}

export const pool = rawPool.promise();

export async function closePool(): Promise<void> {
  await rawPool.promise().end();
};
