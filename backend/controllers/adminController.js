const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const BillPayment = require('../models/BillPayment');
const { successResponse, errorResponse } = require('../utils/responseUtils');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

/**
 * @desc    Admin login
 * @route   POST /api/admin/login
 * @access  Public
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return errorResponse(res, 400, 'Please provide email and password');
    }

    // Find user by email
    const user = await User.findOne({ email });

    // Check if user exists and is an admin
    if (!user || user.role !== 'admin') {
      return errorResponse(res, 401, 'Invalid credentials or not authorized as admin');
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, 401, 'Invalid credentials');
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Return token and user data (excluding password)
    const userData = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role
    };

    return successResponse(res, 200, 'Admin login successful', { token, user: userData });
  } catch (error) {
    console.error('Admin login error:', error);
    return errorResponse(res, 500, 'Server error');
  }
};

/**
 * @desc    Get admin profile
 * @route   GET /api/admin/me
 * @access  Private (Admin only)
 */
exports.getProfile = async (req, res) => {
  try {
    // User is already available from middleware
    const user = req.user;

    // Return user data (excluding password)
    const userData = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt
    };

    return successResponse(res, 200, 'Admin profile retrieved', { user: userData });
  } catch (error) {
    console.error('Get admin profile error:', error);
    return errorResponse(res, 500, 'Server error');
  }
};

/**
 * @desc    Get all users
 * @route   GET /api/admin/users
 * @access  Private (Admin only)
 */
exports.getUsers = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    let query = {};
    if (search) {
      query = {
        $or: [
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
          { fullName: { $regex: search, $options: 'i' } }
        ]
      };
    }

    // Get users with pagination
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await User.countDocuments(query);

    // Get wallet balances for each user
    const usersWithWallets = await Promise.all(
      users.map(async (user) => {
        const wallet = await Wallet.findOne({ userId: user._id });
        return {
          ...user.toObject(),
          walletBalance: wallet ? wallet.balance : 0
        };
      })
    );

    return successResponse(res, 200, 'Users retrieved successfully', {
      users: usersWithWallets,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    return errorResponse(res, 500, 'Server error');
  }
};

/**
 * @desc    Get all wallet fundings
 * @route   GET /api/admin/fundings
 * @access  Private (Admin only)
 */
exports.getFundings = async (req, res) => {
  try {
    const { 
      userId, 
      status, 
      startDate, 
      endDate, 
      page = 1, 
      limit = 10 
    } = req.query;
    
    const skip = (page - 1) * limit;

    // Build query
    let query = { type: 'funding' };
    
    if (userId) query.userId = userId;
    if (status) query.status = status;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Get fundings with pagination
    const fundings = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userId', 'fullName email phone');

    // Get total count
    const total = await Transaction.countDocuments(query);

    return successResponse(res, 200, 'Fundings retrieved successfully', {
      fundings,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get fundings error:', error);
    return errorResponse(res, 500, 'Server error');
  }
};

/**
 * @desc    Get all bill payments
 * @route   GET /api/admin/bills
 * @access  Private (Admin only)
 */
exports.getBills = async (req, res) => {
  try {
    const { 
      userId, 
      type, 
      status, 
      provider,
      startDate, 
      endDate, 
      page = 1, 
      limit = 10 
    } = req.query;
    
    const skip = (page - 1) * limit;

    // Build query
    let query = {};
    
    if (userId) query.userId = userId;
    if (type) query.type = type;
    if (status) query.status = status;
    if (provider) query.provider = provider;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Get bill payments with pagination
    const bills = await BillPayment.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userId', 'fullName email phone')
      .populate('transactionId');

    // Get total count
    const total = await BillPayment.countDocuments(query);

    return successResponse(res, 200, 'Bill payments retrieved successfully', {
      bills,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get bills error:', error);
    return errorResponse(res, 500, 'Server error');
  }
};

/**
 * @desc    Get transaction details
 * @route   GET /api/admin/transactions/:id
 * @access  Private (Admin only)
 */
exports.getTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    // Find transaction
    const transaction = await Transaction.findById(id)
      .populate('userId', 'fullName email phone');

    if (!transaction) {
      return errorResponse(res, 404, 'Transaction not found');
    }

    // If it's a bill payment, get the bill details
    let billPayment = null;
    if (transaction.type !== 'funding') {
      billPayment = await BillPayment.findOne({ transactionId: transaction._id });
    }

    return successResponse(res, 200, 'Transaction retrieved successfully', {
      transaction,
      billPayment
    });
  } catch (error) {
    console.error('Get transaction error:', error);
    return errorResponse(res, 500, 'Server error');
  }
};

/**
 * @desc    Retry failed transaction
 * @route   POST /api/admin/transactions/:id/retry
 * @access  Private (Admin only)
 */
exports.retryTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    // Find transaction
    const transaction = await Transaction.findById(id);

    if (!transaction) {
      return errorResponse(res, 404, 'Transaction not found');
    }

    if (transaction.status !== 'failed') {
      return errorResponse(res, 400, 'Only failed transactions can be retried');
    }

    // Update transaction status to pending
    transaction.status = 'pending';
    await transaction.save();

    // If it's a bill payment, update the bill payment status too
    if (transaction.type !== 'funding') {
      const billPayment = await BillPayment.findOne({ transactionId: transaction._id });
      if (billPayment) {
        billPayment.status = 'pending';
        await billPayment.save();
      }
    }

    // In a real application, you would call the appropriate service to retry the transaction
    // For example, if it's a funding transaction, you would call the Paystack API
    // If it's a bill payment, you would call the appropriate bill payment API

    return successResponse(res, 200, 'Transaction retry initiated', { transaction });
  } catch (error) {
    console.error('Retry transaction error:', error);
    return errorResponse(res, 500, 'Server error');
  }
};

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/admin/stats
 * @access  Private (Admin only)
 */
exports.getStats = async (req, res) => {
  try {
    // Get total users
    const totalUsers = await User.countDocuments();

    // Get total wallet balance
    const wallets = await Wallet.find();
    const totalWalletBalance = wallets.reduce((total, wallet) => total + wallet.balance, 0);

    // Get total transactions
    const totalTransactions = await Transaction.countDocuments();

    // Get success/fail rates
    const successTransactions = await Transaction.countDocuments({ status: 'success' });
    const failedTransactions = await Transaction.countDocuments({ status: 'failed' });
    const pendingTransactions = await Transaction.countDocuments({ status: 'pending' });

    // Calculate success rate
    const successRate = totalTransactions > 0 
      ? (successTransactions / totalTransactions) * 100 
      : 0;

    // Calculate fail rate
    const failRate = totalTransactions > 0 
      ? (failedTransactions / totalTransactions) * 100 
      : 0;

    // Get recent transactions
    const recentTransactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'fullName email phone');

    return successResponse(res, 200, 'Dashboard statistics retrieved successfully', {
      stats: {
        totalUsers,
        totalWalletBalance,
        totalTransactions,
        successTransactions,
        failedTransactions,
        pendingTransactions,
        successRate,
        failRate
      },
      recentTransactions
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return errorResponse(res, 500, 'Server error');
  }
};
