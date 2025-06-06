const express = require('express');
const { paystackController } = require('../controllers');

const router = express.Router();

// Webhook route (no authentication required as it's called by Paystack)
router.post('/webhook', paystackController.handleWebhook);

module.exports = router;
