import fs from 'fs';
import dotenv from 'dotenv';
import mysql from 'promise-mysql';
import { logger } from './logger';

dotenv.config();

const DEFAULT_CONNECTION_LIMIT = 100;

const options: mysql.PoolConfig = {
  charset: process.env.DB2_CHARSET,
  connectionLimit: typeof process.env.DB2_CONNECTION_LIMIT === 'undefined' ? DEFAULT_CONNECTION_LIMIT : parseInt(process.env.DB2_CONNECTION_LIMIT, 10),
  database: process.env.DB2_DATABASE,
  debug: process.env.DB2_DEBUG === 'TRUE',
  password: process.env.DB2_PASSWORD,
  user: process.env.DB2_USERNAME,
};

if (typeof process.env.DB2_SOCKET_PATH !== 'undefined') {
  options.socketPath = process.env.DB2_SOCKET_PATH;
} else if (typeof process.env.DB2_HOST !== 'undefined') {
  options.host = process.env.DB2_HOST;
}

if (typeof process.env.DB2_SSL !== 'undefined' && process.env.DB2_SSL === 'true') {
  options.ssl = {};
  if (typeof process.env.DB2_CLIENT_CERT !== 'undefined') {
    options.ssl.cert = fs.readFileSync(process.env.DB2_CLIENT_CERT);
  }
  if (typeof process.env.DB2_CLIENT_KEY !== 'undefined') {
    options.ssl.key = fs.readFileSync(process.env.DB2_CLIENT_KEY);
  }
  if (typeof process.env.DB2_SERVER_CA !== 'undefined') {
    options.ssl.ca = fs.readFileSync(process.env.DB2_SERVER_CA);
  }
}

logger.info(options);

export const pool2: PromiseLike<mysql.Pool> = mysql.createPool(options);
