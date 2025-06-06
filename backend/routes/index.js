const express = require('express');
const authRoutes = require('./authRoutes');
const walletRoutes = require('./walletRoutes');
const billsRoutes = require('./billsRoutes');
const paystackRoutes = require('./paystackRoutes');
const adminRoutes = require('./adminRoutes');

const router = express.Router();

// Register routes
router.use('/auth', authRoutes);
router.use('/wallet', walletRoutes);
router.use('/bills', billsRoutes);
router.use('/paystack', paystackRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
