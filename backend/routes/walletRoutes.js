const express = require('express');
const { walletController } = require('../controllers');
const { authenticate } = require('../utils/authMiddleware');

const router = express.Router();

// All wallet routes are protected
router.use(authenticate);

// Wallet routes
router.get('/balance', walletController.getBalance);
router.post('/fund', walletController.initializeFunding);
router.get('/verify/:reference', walletController.verifyFunding);
router.get('/transactions', walletController.getTransactionHistory);

module.exports = router;
