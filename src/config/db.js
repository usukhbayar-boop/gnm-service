const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Neon Tech connections
  },
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