const express = require('express');
const { authController } = require('../controllers');
const { authenticate } = require('../utils/authMiddleware');

const router = express.Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/profile', authenticate, authController.getProfile);

module.exports = router;
