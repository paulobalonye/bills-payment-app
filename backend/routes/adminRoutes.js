const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const isAdmin = require('../middleware/isAdmin');

// Public routes
router.post('/login', adminController.login);

// Protected routes (admin only)
router.get('/me', isAdmin, adminController.getProfile);
router.get('/users', isAdmin, adminController.getUsers);
router.get('/fundings', isAdmin, adminController.getFundings);
router.get('/bills', isAdmin, adminController.getBills);
router.get('/transactions/:id', isAdmin, adminController.getTransaction);
router.post('/transactions/:id/retry', isAdmin, adminController.retryTransaction);
router.get('/stats', isAdmin, adminController.getStats);

module.exports = router;
