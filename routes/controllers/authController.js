// This file contains API functions for authentication and payment processing.
// src/routes/controllers/authController.js
import dotenv from 'dotenv';
import sql from 'mssql';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto'; // For encryption and decryption
import { encryptData, decryptData } from '../../src/utils/encryption.js';// Import encryption functions
dotenv.config();

// Database connection setup
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
      encrypt: true,
      trustServerCertificate: false,
      enableArithAbort: true,
    }
};

const poolPromise = sql.connect(dbConfig);

// Encryption and Decryption
const SECRET_KEY = Buffer.from(process.env.ENCRYPTION_SECRET_KEY, 'hex');
const IV = Buffer.from(process.env.IV, 'hex');



// Registration
const register = async (req, res) => {
    try {
        const { username, email, password, idNumber, accountNumber } = req.body;

        // Validate inputs (you may want to add more validation here)
        if (!username || !email || !password || !idNumber || !accountNumber) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check if email already exists
        const pool = await poolPromise;
        const result = await pool.request()
            .input('email', sql.VarChar, email)
            .query('SELECT email FROM Users WHERE email = @email');

        if (result.recordset.length > 0) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Encrypt sensitive data
        const encryptedIdNumber = encryptData(idNumber);
        const encryptedAccountNumber = encryptData(accountNumber);

         // Insert user into the database
    const insertResult = await pool.request()
    .input('username', sql.VarChar, username)
    .input('email', sql.VarChar, email)
    .input('password', sql.VarChar, hashedPassword)
    .input('idNumber', sql.VarChar, encryptedIdNumber)
    .input('accountNumber', sql.VarChar, encryptedAccountNumber)
    .query('INSERT INTO Users (username, email, password, idNumber, accountNumber) OUTPUT INSERTED.id VALUES (@username, @email, @password, @idNumber, @accountNumber)');

// Get the newly inserted user's ID
const userId = insertResult.recordset[0].id;

// Assign a default balance of 1000 ZAR to the new user
await pool.request()
    .input('userId', sql.Int, userId)
    .input('balance', sql.Decimal, 1000)  // Set balance to 1000 ZAR
    .query('UPDATE Users SET balance = @balance WHERE id = @userId');

res.status(201).json({ message: 'User registered successfully' });
} catch (error) {
console.error('Error during registration:', error);  // Log the full error for debugging
res.status(500).json({ error: 'Error registering user', details: error.message });  // Send detailed error
}
};

// Login
const login = async (req, res) => {
    try {
        console.log('--- LOGIN ATTEMPT ---');
        console.log('Request URL:', req.originalUrl);
        console.log('Request Method:', req.method);
        console.log('Request Body:', req.body);
        const { email, password } = req.body;
        console.log(`Received login attempt for email: ${email}`);  // Log the email being attempted

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Retrieve user from database
        const pool = await poolPromise;
        const result = await pool.request()
            .input('email', sql.VarChar, email)
            .query('SELECT * FROM Users WHERE email = @email');

        const user = result.recordset[0];

        if (!user) {
            console.log('User not found for email:', email);  // Log when user is not found
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if password matches
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const balanceResult = await pool.request()
        .input('userId', sql.Int, user.id)
        .query('SELECT balance FROM Users WHERE id = @userId');
        const userBalance = balanceResult.recordset[0]?.balance || 0;

        // Optionally decrypt sensitive fields (if necessary)
        const decryptedIdNumber = decryptData(user.idNumber);
        const decryptedAccountNumber = decryptData(user.accountNumber);

        // Generate JWT token
        const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' });

        // Send token and user info (avoid sending sensitive data unless necessary)
        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                balance: userBalance,
                // Optionally include decrypted data
                idNumber: decryptedIdNumber,  // Decrypted data, only if needed
                accountNumber: decryptedAccountNumber,
            }
        });
        // In client-side login handling
const login = (token, userData) => {
  localStorage.setItem('authToken', token);
  setAuthToken(token); // Update state
  setUser(userData);
};
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Error logging in' });
    }
};
 const getMe = async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
  
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
      }
  
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
      const pool = await poolPromise;
      const result = await pool.request()
        .input('id', sql.Int, decoded.userId)
        .query('SELECT * FROM Users WHERE id = @id');
  
      const user = result.recordset[0];
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      let decryptedAccountNumber;
      try {
        decryptedAccountNumber = decryptData(user.accountNumber);
      } catch (decryptError) {
        console.error('Decryption failed:', decryptError);
        return res.status(500).json({ error: 'Failed to decrypt account details' });
      }
   const decryptedIdNumber = decryptData(user.idNumber);
  
      res.json({
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          balance: user.balance,
          accountNumber: decryptedAccountNumber,
          idNumber: decryptedIdNumber,
          globalLimit: user.globalLimit || 1000, // in case it's in the table
          totalPayments: user.totalPayments || 0, // if tracked
        }
      });
    } catch (error) {
      console.error('Error in getMe:', error);
      res.status(500).json({ error: 'Failed to fetch user data' });
    }
  };
  const verifyEncryptionConsistency = async () => {
    const testAccount = "test-account-123";
    const encrypted = encryptData(testAccount);
    const decrypted = decryptData(encrypted);
    
    console.log('Encryption consistency check:', {
      testAccount,
      encrypted,
      decrypted,
      match: testAccount === decrypted
    });
  };
  
  // Call this on server startup
  verifyEncryptionConsistency();
 // ... PART 2 ADMIN...
  const changePassword = async (req, res) => {
    try {
      // ... password change logic ...
      
      // Invalidate all existing tokens
      await pool.request()
        .input('userId', sql.Int, req.user.userId)
        .query('UPDATE Users SET tokenVersion = tokenVersion + 1 WHERE id = @userId');
  
      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      // ... error handling ...
    }
  };
export { register, login ,getMe};
