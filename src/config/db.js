const { Pool } = require('pg');
require('dotenv').config();

// Then in your code
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false }
});

pool.connect()
  .then(() => console.log('Connected to PostgreSQL successfully'))
  .catch(err => console.error('Database connection error:', err));

  /**
 * Executes an INSERT query with parameters
 * @param {string} text - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise} - Resolves with query result
 */
const insertQuery = async (text, params) => {
    try {
      const result = await pool.query(text, params);
      return result;
    } catch (error) {
      console.error('Error executing insert query:', error);
      throw error;
    }
  };

  const simpleQuery = async (text, params) => {
    try {
      const result = await pool.query(text, params);
      return result;
    } catch (error) {
      console.error('Error executing simple query:', error);
      throw error;
    }
  };


module.exports = { pool, insertQuery };