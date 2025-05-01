// path: routes/controllers/paymentController.js
// Payment Controller
import sql from 'mssql';
import { poolPromise } from '../../db/index.js'; // DB connection
import { encryptData } from '../../src/utils/encryption.js';
// Payment Processing Handler (SWIFT only)
const processPayment = async (req, res) => {
    console.log('req.user in processPayment:', req.user);

    const { currency, amount, recipientInfo, reference, isInstant } = req.body;
    const userId = req.user?.userId;
    const paymentMethod = 'swift_transfer'; // Force payment method to SWIFT

    console.log('User ID:', userId);
    if (!userId) {
        return res.status(400).json({ error: 'Missing user ID' });
    }
    console.log('Currency received:', currency);
    if (!currency) {
        return res.status(400).json({ error: 'Currency is required' });
      }
    // Validate amount
    if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Invalid payment amount' });
    }

    // Validate required SWIFT recipient information
    if (
        !recipientInfo ||
        !recipientInfo.accountNumber ||
        !recipientInfo.swiftCode ||
        !recipientInfo.recipientName ||
        !recipientInfo.bankName
    ) {
        return res.status(400).json({ error: 'Missing SWIFT recipient information' });
    }

    // Calculate fee and total amount
    const fee = isInstant ? amount * 0.005 : 0;
    const totalAmount = amount + fee;

    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();

        // Check user balance
        const balanceQuery = `SELECT balance FROM Users WHERE id = @userId`;
        const balanceResult = await transaction.request()
            .input('userId', sql.Int, userId)
            .query(balanceQuery);

        const currentBalance = balanceResult.recordset[0]?.balance;
        if (currentBalance === undefined || currentBalance < totalAmount) {
            return res.status(400).json({ error: 'Insufficient funds' });
        }

        const paymentStatus = isInstant ? 'pending' : 'completed';

        // Debug: Check if currency is being passed properly
        console.log('currency:', currency);

        // If no currency is provided, set a default
        const finalCurrency = currency || 'USD';
        
        // Debug: Check the final currency value before proceeding with the insert
        console.log('Final currency:', finalCurrency);
        const { recipientInfo } = req.body;
    
    // Encrypt the received account number for database comparison
    const encryptedAccountNumber = encryptData(recipientInfo.accountNumber.trim());

// Find recipient in database
const recipientResult = await transaction.request()
.input('accountNumber', sql.NVarChar, encryptedAccountNumber)
.query('SELECT id FROM Users WHERE accountNumber = @accountNumber COLLATE SQL_Latin1_General_CP1_CI_AI');

// Validate recipient exists
if (!recipientResult.recordset[0]) {
await transaction.rollback();
console.log('Recipient search details:', {
    searchedAccount: recipientInfo.accountNumber,
    exists: await checkAccountExists(recipientInfo.accountNumber)
  });
  return res.status(400).json({ 
    error: 'Recipient account not found',
    suggestion: 'Please verify account number and bank details' 
  });
}


        // Explicitly set the payment mode (should always be swift_transfer)
        const paymentMode = 'swift_transfer';

        // Insert payment record
        const paymentQuery = `
        INSERT INTO Payments (
            userId, recipient_id, amount, currency, payment_method, recipientName, recipientAccount,
            swiftCode, bankName, status, reference, fee
        )
        VALUES (
             @userId, @recipientId, @amount, @currency, @paymentMethod, @recipientName, @recipientAccount,
            @swiftCode, @bankName, @status, @reference, @fee
        );
        SELECT SCOPE_IDENTITY() AS transactionId;
        `;
        const recipientId = recipientResult.recordset[0].id;
        const paymentResult = await transaction.request()
            .input('userId', sql.Int, req.user.userId)  // Sender's user ID
            .input('recipientId', sql.Int, req.user.userId)  // recipient_id should not be null
            .input('amount', sql.Decimal, amount)
            .input('currency', sql.VarChar, finalCurrency)  // Ensure currency is passed or defaulted
            .input('paymentMethod', sql.VarChar, paymentMode)  // Explicitly set the payment mode
            .input('recipientName', sql.VarChar, recipientInfo.recipientName)
            .input('recipientAccount', sql.VarChar, recipientInfo.accountNumber)
            .input('swiftCode', sql.VarChar, recipientInfo.swiftCode)
            .input('bankName', sql.VarChar, recipientInfo.bankName)
            .input('status', sql.VarChar, paymentStatus)
            .input('reference', sql.VarChar, reference)
            .input('fee', sql.Decimal, fee)
            .query(paymentQuery);

        if (!paymentResult.recordset[0]) {
            return res.status(500).json({ error: 'Payment transaction failed to insert' });
        }

        const transactionId = paymentResult.recordset[0].transactionId;

        // Update user's balance
        const updateBalanceQuery = `
            UPDATE Users
            SET balance = balance - @totalAmount
            WHERE id = @userId
        `;

        await transaction.request()
            .input('userId', sql.Int, userId)
            .input('totalAmount', sql.Decimal(18, 2), totalAmount)
            .query(updateBalanceQuery);

        await transaction.commit();

        return res.status(200).json({
            success: true,
            message: 'SWIFT payment processed successfully',
            transaction: {
                id: transactionId,
                amount,
                paymentMethod,
                status: paymentStatus,
                fee,
                totalAmount,
                reference,
                recipientInfo,
                timestamp: new Date().toISOString(),
            }
        });

    } catch (error) {
        await transaction.rollback();
        console.error('Payment processing error:', error.message, error.stack);
        return res.status(500).json({ error: 'Error processing payment' });
    }
};

// Payment History
const getPaymentHistory = async (req, res) => {
    try {
        // Get user ID from authenticated request
        const userId = req.user.userId;
        const accountNumber = req.user.accountNumber;

        const pool = await poolPromise;
        
        // Get sent payments
        const sentResult = await pool.request()
            .input('userId', sql.Int, userId)
            .query('SELECT * FROM Payments WHERE userId = @userId');

        // Get received payments using account number
        const receivedResult = await pool.request()
            .input('accountNumber', sql.NVarChar, accountNumber)
            .query('SELECT * FROM Payments WHERE recipientAccount = @accountNumber');

        res.status(200).json({
            sentPayments: sentResult.recordset,
            receivedPayments: receivedResult.recordset
        });
    } catch (err) {
        console.error('History error:', err);
        res.status(500).json({ 
            error: 'Failed to get history',
            details: err.message
        });
    }
};

export default {
    makePayment: processPayment,
    getPaymentHistory
};
