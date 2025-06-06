const express = require('express');
const { billsController } = require('../controllers');
const { authenticate } = require('../utils/authMiddleware');

const router = express.Router();

// All bills routes are protected
router.use(authenticate);

// Bills routes
router.post('/airtime', billsController.buyAirtime);
router.post('/electricity', billsController.payElectricity);
router.post('/cable', billsController.payCable);
router.get('/history', billsController.getBillPaymentHistory);

module.exports = router;
