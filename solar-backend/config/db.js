const mysql = require('mysql2/promise'); // Use mysql2 for async/await support

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 1000000,
  port : process.env.DB_PORT,
  queueLimit: 0,
});

module.exports = pool;