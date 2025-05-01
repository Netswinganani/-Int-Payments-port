// controllers/payment.js
import { poolPromise } from '../db/index.js';
import sql from 'mssql';

const makePayment = async (req, res) => {
    const { amount, paymentMethod, recipientInfo } = req.body;
    const userId = req.user.userId;
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();

        // 1. Verify sender balance first
        const checkBalance = await new sql.Request(transaction)
            .input('userId', sql.Int, userId)
            .query('SELECT balance FROM Users WHERE id = @userId');
        
        if (checkBalance.recordset[0].balance < amount) {
            await transaction.rollback();
            return res.status(400).json({ error: 'Insufficient funds' });
        }

        // 2. Update sender balance
        await new sql.Request(transaction)
            .input('userId', sql.Int, userId)
            .input('amount', sql.Decimal, amount)
            .query('UPDATE Users SET balance = balance - @amount WHERE id = @userId');

        // 3. Find and update recipient (if internal)
        const recipientResult = await new sql.Request(transaction)
            .input('accountNumber',  sql.NVarChar, encryptedAccountNumber)
            .execute('FindUserByAccountNumber');

        if (recipientResult.recordset.length > 0) {
            await new sql.Request(transaction)
                .input('recipientId', sql.Int, recipientResult.recordset[0].id)
                .input('amount', sql.Decimal, amount)
                .query('UPDATE Users SET balance = balance + @amount WHERE id = @recipientId');
        }

        // 4. Record payment with correct column names
        await new sql.Request(transaction)
            .input('userId', sql.Int, userId)
            .input('amount', sql.Decimal, amount)
            .input('paymentMethod', sql.NVarChar, paymentMethod)
            .input('recipientName', sql.NVarChar, recipientInfo.name)
            .input('recipientAccount', sql.NVarChar, recipientInfo.account)
            .input('recipientBank', sql.NVarChar, recipientInfo.bank)
            .query(`
                INSERT INTO Payments (
                    userId, 
                    amount, 
                    payment_method, 
                    recipient_name, 
                    recipientAccount, 
                    recipient_bank
                ) VALUES (
                    @userId, 
                    @amount, 
                    @paymentMethod, 
                    @recipientName, 
                    @recipientAccount, 
                    @recipientBank
                )`);

        await transaction.commit();
        res.status(200).json({ 
            message: 'Payment processed successfully',
            newBalance: checkBalance.recordset[0].balance - amount
        });
        
    } catch (err) {
        await transaction.rollback();
        console.error('Payment error:', err);
        res.status(500).json({ 
            error: 'Payment failed',
            details: err.message
        });
    }
};

const getPaymentHistory = async (req, res) => {
    const userId = req.user.userId;
    
    try {
        const pool = await poolPromise;
        
        // Get sent payments
        const sentResult = await pool.request()
            .input('userId', sql.Int, userId)
            .query('SELECT * FROM Payments  WHERE userId = @userId ORDER BY created_at DESC');

        // Get received payments with correct join
        const receivedResult = await pool.request()
            .input('accountNumber', sql.NVarChar, req.user.accountNumber)
            .query(`
                SELECT p.* 
                FROM Payments p
                WHERE p.recipientAccount = @accountNumber
                ORDER BY created_at DESC
            `);

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

export default { makePayment, getPaymentHistory };