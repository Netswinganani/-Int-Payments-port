import express from 'express';
import { register, login, getMe } from './controllers/authController.js';

const router = express.Router();

// Validation middleware
const validateRegister = (req, res, next) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    next();
};

// Routes
router.post('/register', validateRegister, register);
router.post('/login', login);
router.get('/me', getMe); // <-- Add this line

export default router;
