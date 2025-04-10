const mysql = require('mysql2/promise'); // Use mysql2 for async/await support

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST2,
  user: process.env.DB_USER2,
  password: process.env.DB_PASSWORD2,
  database: process.env.DB_NAME2,
  waitForConnections: true,
  connectionLimit: 1000000,
  port : process.env.DB_PORT2,
  queueLimit: 0,
});

module.exports = pool;