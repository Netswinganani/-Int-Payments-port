import express from 'express';
import cors from 'cors';
import { poolPromise } from './db/index.js';
import apiRoutes from './routes/api.js';
import authRoutes from './routes/auth.js';
//import paymentRoutes from './routes/payment.js';
import authMiddleware from './middleware/auth.js';
import sql from 'mssql';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
//const router = express.Router();
const PORT = process.env.PORT || 3000;

// ✅ Check DB connection
const checkDbConnection = async () => {
  try {
    const pool = await poolPromise;
    await pool.request().query('SELECT 1');
    return true;
  } catch (err) {
    console.error('❌ DB connection failed:', err);
    return false;
  }
};

// ✅ Middleware
//app.use(cors());
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ Routes
app.use('/api', apiRoutes);
app.use('/api/auth', authRoutes);
//app.use('/api/payments',authMiddleware, paymentRoutes);

// ✅ Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// ✅ DB connection test
app.get('/api/test-connection', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT GETDATE() as currentTime');
    res.json({ success: true, data: result.recordset[0], message: 'Database connection successful' });
  } catch (err) {
    console.error('Database connection test failed:', err);
    res.status(500).json({ success: false, error: 'Database connection failed', message: err.message });
  }
});

// ✅ Protected user route
//--
// Payment history route
//router.get('/payments/history', authMiddleware, getPaymentHistory);

// ✅ Public financial data route
//--
// ✅ Register API router
//app.use('/api', router);

// ✅ Start server ONLY after DB is verified
checkDbConnection().then((isConnected) => {
  if (isConnected) {
    app.listen(PORT, () => {
      console.log(`🚀 Server started on port ${PORT}`);
    });
  } else {
    console.log('❌ Database connection failed, server will not start');
  }
});
