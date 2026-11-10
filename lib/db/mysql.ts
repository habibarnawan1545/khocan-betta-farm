import mysql from 'mysql2/promise';

let pool: mysql.Pool | null = null;

export function getMySqlPool(): mysql.Pool | null {
  const host = process.env.MYSQL_HOST || 'localhost';
  const user = process.env.MYSQL_USER || 'u404886323_admin';
  const password = process.env.MYSQL_PASSWORD || 'Sandi1203';
  const database = process.env.MYSQL_DATABASE || 'u404886323_khocan';
  const port = parseInt(process.env.MYSQL_PORT || '3306', 10);

  if (!pool) {
    pool = mysql.createPool({
      host,
      user,
      password,
      database,
      port,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
    });
  }

  return pool;
}
