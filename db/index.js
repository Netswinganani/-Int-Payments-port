// db/index.js
import sql from 'mssql';
import config from '../config/database.js';

// Declare the poolPromise at module level
let poolPromise;

/**
 * Attempts to connect to the SQL database with retries.
 * @param {number} retries - Number of retry attempts
 * @returns {Promise<sql.ConnectionPool>}
 */
const connectWithRetry = async (retries = 5) => {
  while (retries) {
    try {
      const pool = await new sql.ConnectionPool(config).connect();
      console.log('✅ DB Connected');
      return pool;
    } catch (err) {
      console.error(`Retrying DB connection (${6 - retries}/5)...`, err.message);
      retries--;
      if (!retries) throw err;
      await new Promise(res => setTimeout(res, 2000)); // Wait before retrying
    }
  }
};

// Initialize the connection
poolPromise = connectWithRetry();

/**
 * Executes a SQL query with optional parameters
 * @param {string} query - The SQL query to run
 * @param {Array} params - Array of parameters to bind (optional)
 * @returns {Promise<any[]>} - The query result recordset
 */
const executeQuery = async (query, params = []) => {
  try {
    const pool = await poolPromise;
    const request = pool.request();

    // Add parameters with default naming
    params.forEach((param, index) => {
      request.input(`param${index}`, param);
    });

    const result = await request.query(query);
    return result.recordset;
  } catch (error) {
    console.error('❌ Database query error:', error);
    throw error;
  }
};

/**
 * Simple check to confirm database connection is live
 * @returns {Promise<boolean>}
 */
const checkDbConnection = async () => {
  try {
    const pool = await poolPromise;
    await pool.query('SELECT 1');
    return true;
  } catch {
    return false;
  }
};

// Export everything
export { sql, poolPromise, executeQuery, checkDbConnection };
