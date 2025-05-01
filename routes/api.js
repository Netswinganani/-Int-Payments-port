// routes/api.js
import express from 'express';
import { register, login, getMe  } from './controllers/authController.js';
import { executeQuery } from '../db/index.js';
import paymentController from './controllers/paymentController.js';
import authMiddleware from '../middleware/auth.js';
import sql from 'mssql';
import { poolPromise } from '../db/index.js'; 

//const { makePayment, getPaymentHistory } = paymentController;
const router = express.Router();

// User registration route
router.post('/auth/register', register);  // Use the imported `register` function from the controller

router.get('/me', getMe);  // Get user info route
// User login route
router.post('/auth/login', login);  // Use the imported `login` function from the controller
// ✅ Protected user route
router.get('/user', authMiddleware, async (req, res) => {
    console.log('🔒 User API hit');
    try {
      const userId = req.user.userId; // from JWT payload
      const pool = await poolPromise;
  
      const result = await pool.request()
        .input('id', sql.Int, userId)
        .query('SELECT id, username, email, balance FROM Users WHERE id = @id');
  
      if (result.recordset.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      const user = result.recordset[0];
      res.json(user);
    } catch (err) {
      console.error('Error fetching user:', err);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  });
  // ✅ Verify recipient route
  router.post('/payments/verify-recipient', authMiddleware, async (req, res) => {
    try {
      const { accountNumber } = req.body;
      const pool = await poolPromise;
      
      const result = await pool.request()
        .input('accountNumber', sql.NVarChar, accountNumber.trim())
        .query('SELECT id, accountHolderName FROM Users WHERE accountNumber = @accountNumber');
  
      if (!result.recordset[0]) {
        return res.status(404).json({ valid: false, error: 'Account not found' });
      }
  
      res.json({
        valid: true,
        accountHolder: result.recordset[0].accountHolderName
      });
    } catch (error) {
      console.error('Recipient verification error:', error);
      res.status(500).json({ valid: false, error: 'Verification failed' });
    }
  });

// ✅ Public financial data route
router.get('/financial-data', authMiddleware, async (req, res) => {
    try {
      const userId = req.user.userId;
      const pool = await poolPromise;
  
      // Get user balance
      const userResult = await pool.request()
        .input('userId', sql.Int, userId)
        .query('SELECT balance FROM Users WHERE id = @userId');
  
      // Corrected column name in Payments query
      const paymentsResult = await pool.request()
        .input('userId', sql.Int, userId)
        .query('SELECT SUM(amount) as totalPayments FROM Payments WHERE userId = @userId');
  
      res.json({
        balance: userResult.recordset[0].balance,
        totalPayments: paymentsResult.recordset[0].totalPayments || 0,
        globalLimit: 2000
      });
    } catch (error) {
      console.error('Error fetching financial data:', error);
      res.status(500).json({ error: 'Failed to fetch financial data' });
    }
  });

// Process payment route
router.get('/payments/history', authMiddleware, paymentController.getPaymentHistory);
router.post('/payments/make-payment', authMiddleware, paymentController.makePayment);

// Get payment history route
//router.get('/payments/history', getPaymentHistory);
// Get saved recipients route
router.get('/recipients', async (req, res) => {
    try {
        const query = 'SELECT * FROM Recipients';
        const recipients = await executeQuery(query);
        res.json({ success: true, data: recipients });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});



export default router;
