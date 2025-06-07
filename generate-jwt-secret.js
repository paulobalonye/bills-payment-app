/**
 * JWT Secret Generator for Nigerian Bill Payment Application
 * This script generates secure random strings suitable for JWT_SECRET
 */

const crypto = require('crypto');

console.log('\x1b[34m%s\x1b[0m', '=== JWT Secret Generator ===');
console.log('This script will generate secure random strings suitable for JWT_SECRET');
console.log('Choose the method that works best for your needs\n');

// Method 1: Using crypto.randomBytes (most secure)
console.log('\x1b[33m%s\x1b[0m', 'Method 1: Using crypto.randomBytes (recommended)');
const jwtSecret1 = crypto.randomBytes(64).toString('base64');
console.log('\x1b[32m%s\x1b[0m', `JWT_SECRET=${jwtSecret1}`);
console.log();

// Method 2: Using crypto.randomBytes with hex encoding
console.log('\x1b[33m%s\x1b[0m', 'Method 2: Using crypto.randomBytes with hex encoding');
const jwtSecret2 = crypto.randomBytes(48).toString('hex');
console.log('\x1b[32m%s\x1b[0m', `JWT_SECRET=${jwtSecret2}`);
console.log();

// Method 3: Using UUID v4 (less secure but simple)
console.log('\x1b[33m%s\x1b[0m', 'Method 3: Using UUID v4 (simple but less secure)');
const jwtSecret3 = crypto.randomUUID();
console.log('\x1b[32m%s\x1b[0m', `JWT_SECRET=${jwtSecret3}`);
console.log();

// Method 4: Using a combination of timestamp and random bytes
console.log('\x1b[33m%s\x1b[0m', 'Method 4: Using timestamp + random bytes');
const timestamp = new Date().getTime().toString();
const randomBytes = crypto.randomBytes(32).toString('hex');
const jwtSecret4 = `${timestamp}_${randomBytes}`;
console.log('\x1b[32m%s\x1b[0m', `JWT_SECRET=${jwtSecret4}`);
console.log();

console.log('\x1b[34m%s\x1b[0m', '=== How to Use ===');
console.log('1. Copy one of the generated secrets above');
console.log('2. Add it to your .env file:');
console.log('   JWT_SECRET=your_copied_secret');
console.log('3. Make sure to keep this secret secure and don\'t share it');

console.log('\n\x1b[34m%s\x1b[0m', '=== Security Note ===');
console.log('Method 1 (crypto.randomBytes with base64 encoding) is recommended for production use.');
console.log('For maximum security, generate this secret directly on your production server,');
console.log('not on your development machine.');

console.log('\n\x1b[34m%s\x1b[0m', '=== Usage ===');
console.log('Run this script with:');
console.log('node generate-jwt-secret.js');
