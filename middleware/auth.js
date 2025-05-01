import jwt from 'jsonwebtoken';
import sql from 'mssql';
import { poolPromise } from '../db/index.js';

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check for token in the authorization header
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication token is required' });
  }

  // Extract token from header
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Authentication token is required' });
  }

  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not defined');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    // Verify the token and decode it
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify user exists in database
    const pool = await poolPromise;
    const userResult = await pool.request()
      .input('userId', sql.Int, decoded.userId)
      .query('SELECT id, email, accountNumber FROM Users WHERE id = @userId');

    if (!userResult.recordset[0]) {
      return res.status(401).json({ error: 'User no longer exists' });
    }

    // Attach fresh user data to request
    req.user = {
      userId: userResult.recordset[0].id,
      email: userResult.recordset[0].email,
      accountNumber: userResult.recordset[0].accountNumber
    };

    console.log(`✅ Authenticated user ${req.user.userId}`);
    next();
  } catch (error) {
    console.error('Authentication error:', error);

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Token expired, please log in again' });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid authentication token' });
    }
    return res.status(500).json({ error: 'Authentication processing error' });
  }
};

export default authMiddleware;