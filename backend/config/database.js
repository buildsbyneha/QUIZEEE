// backend/config/database.js
const { Pool } = require('pg');

// For Neon, use DATABASE_URL if available
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Fallback to individual parameters if DATABASE_URL not available
if (!process.env.DATABASE_URL) {
  pool.options.host = process.env.DB_HOST || 'localhost';
  pool.options.port = process.env.DB_PORT || 5432;
  pool.options.database = process.env.DB_NAME || 'quizee_db';
  pool.options.user = process.env.DB_USER || 'postgres';
  pool.options.password = process.env.DB_PASSWORD;
}

pool.on('connect', () => {
  console.log('✅ Database connected successfully');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
});

// Test connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection test failed:', err);
  } else {
    console.log('✅ Database connection test successful:', res.rows[0].now);
  }
});

module.exports = pool;