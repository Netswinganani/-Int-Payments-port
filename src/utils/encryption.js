// src/utils/encryption.js
import crypto from 'crypto';

const SECRET_KEY = Buffer.from(process.env.ENCRYPTION_SECRET_KEY, 'hex');
const IV = Buffer.from(process.env.IV, 'hex');

export const encryptData = (data) => {
    const cipher = crypto.createCipheriv('aes-256-cbc', SECRET_KEY, IV);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
};

export const decryptData = (encryptedData) => {
    const decipher = crypto.createDecipheriv('aes-256-cbc', SECRET_KEY, IV);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};