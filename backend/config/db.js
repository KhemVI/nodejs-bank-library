import 'dotenv/config';
import mysql from 'mysql2';

const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "4or_!nterview_0nly",
  database: process.env.DB_DATABASE || "bank_library",
  waitForConnections: true,
  connectionLimit: process.env.DB_CONNECTION_LIMIT || 100,
  maxIdle: process.env.DB_MAX_IDLE || 100, // max idle connections, the default value is the same as `connectionLimit`
  idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  timezone: '+00:00'
});

const promisePool = pool.promise();

export default promisePool;