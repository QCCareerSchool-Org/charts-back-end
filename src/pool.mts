import { attachDatabasePool } from '@vercel/functions';
import type { PoolOptions } from 'mysql2';
import { createPool } from 'mysql2';

import config from '#src/config.mjs';

const options: PoolOptions = {
  host: config.db.host,
  charset: config.db.charset,
  connectionLimit: config.db.connectionLimit,
  database: config.db.database,
  password: config.db.password,
  user: config.db.user,
  ssl: { ca: config.db.serverCA },
  decimalNumbers: true,
  idleTimeout: 5000, // five seconds as per https://vercel.com/kb/guide/connection-pooling-with-functions
  maxIdle: 0, // how many connections to keep regardless of the timeout
};

const rawPool = createPool(options);

rawPool.on('connection', connection => {
  // Sets the session context immediately when a connection is grabbed or created
  connection.query("SET time_zone = 'America/Toronto';");
});

if (config.env === 'production') {
  attachDatabasePool(rawPool);
}

export const pool = rawPool.promise();

export async function closePool(): Promise<void> {
  await rawPool.promise().end();
};
