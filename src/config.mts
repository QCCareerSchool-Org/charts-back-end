import dotenv from 'dotenv';

dotenv.config();

const DEFAULT_CONNECTION_LIMIT = 5;

const secret = process.env.JWT_SECRET;
if (typeof secret === 'undefined') {
  throw Error('JWT_SECRET environment variable is required');
}

const dbConnectionLimitString = process.env.DB_CONNECTION_LIMIT;
const dbConnectionLimit = typeof dbConnectionLimitString === 'undefined'
  ? DEFAULT_CONNECTION_LIMIT
  : parseInt(dbConnectionLimitString, 10);
if (isNaN(dbConnectionLimit)) {
  throw Error('Unparsable DB_CONNECTION_LIMIT');
}

const db2ConnectionLimitString = process.env.DB2_CONNECTION_LIMIT;
const db2ConnectionLimit = typeof db2ConnectionLimitString === 'undefined'
  ? DEFAULT_CONNECTION_LIMIT
  : parseInt(db2ConnectionLimitString, 10);
if (isNaN(db2ConnectionLimit)) {
  throw Error('Unparsable DB2_CONNECTION_LIMIT');
}

const dbServerCABase64 = process.env.DB_SERVER_CA;
if (!dbServerCABase64) {
  throw Error('DB_SERVER_CA environment variable is required');
}

const db2ServerCABase64 = process.env.DB2_SERVER_CA;
if (!db2ServerCABase64) {
  throw Error('DB2_SERVER_CA environment variable is required');
}

const config = {
  env: process.env.NODE_ENV as 'production' | 'development' | 'testing',
  port: process.env.PORT,
  jwt: {
    secret,
    issuer: 'https://www.qccareerschool.com',
  },
  db: {
    host: process.env.DB_HOST,
    charset: process.env.DB_CHARSET,
    connectionLimit: dbConnectionLimit,
    database: process.env.DB_DATABASE,
    debug: process.env.DB_DEBUG === 'TRUE',
    password: process.env.DB_PASSWORD,
    user: process.env.DB_USERNAME,
    serverCA: Buffer.from(dbServerCABase64, 'base64').toString('utf8'),
  },
  db2: {
    host: process.env.DB2_HOST,
    charset: process.env.DB2_CHARSET,
    connectionLimit: db2ConnectionLimit,
    database: process.env.DB_DATABASE,
    debug: process.env.DB2_DEBUG === 'TRUE',
    password: process.env.DB2_PASSWORD,
    user: process.env.DB2_USERNAME,
    serverCA: Buffer.from(db2ServerCABase64, 'base64').toString('utf8'),
  },
} as const;

export default config;
