// nodekey.js

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Required to simulate __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generate secrets
const jwtSecret = crypto.randomBytes(64).toString('hex');
const encryptionKey = crypto.randomBytes(32).toString('hex');
const iv = crypto.randomBytes(16).toString('hex');

// Build .env content
const envContent = 
`JWT_SECRET=${jwtSecret}
ENCRYPTION_SECRET_KEY=${encryptionKey}
IV=${iv}
`;

// Save .env file
const envPath = path.join(__dirname, '.env');
fs.writeFileSync(envPath, envContent);

console.log('.env file created:\n');
console.log(envContent);
