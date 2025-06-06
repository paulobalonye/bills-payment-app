const { Wallet, Transaction } = require('../models');
const { initializeTransaction, verifyTransaction } = require('../utils/paystackUtils');
const { successResponse, errorResponse, validationErrorResponse, notFoundResponse } = require('../utils/responseUtils');
const crypto = require('crypto');

/**
 * Get wallet balance
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getBalance = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find user's wallet
    const wallet = await Wallet.findOne({ user: userId });

    if (!wallet) {
      return notFoundResponse(res, 'Wallet not found');
    }

    return successResponse(res, 200, 'Wallet balance retrieved successfully', {
      balance: wallet.balance
    });
  } catch (error) {
    console.error('Get wallet balance error:', error);
    return errorResponse(res, 500, 'Failed to retrieve wallet balance', { error: error.message });
  }
};

/**
 * Initialize wallet funding
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const initializeFunding = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user._id;

    // Validate amount
    if (!amount || isNaN(amount) || amount <= 0) {
      return validationErrorResponse(res, {
        message: 'Please provide a valid amount greater than 0'
      });
    }

    // Find user's wallet
    const wallet = await Wallet.findOne({ user: userId });

    if (!wallet) {
      return notFoundResponse(res, 'Wallet not found');
    }

    // Generate unique reference
    const reference = `fund_${crypto.randomBytes(8).toString('hex')}_${Date.now()}`;

    // Create a pending transaction
    const transaction = await Transaction.create({
      user: userId,
      type: 'funding',
      amount,
      status: 'pending',
      paystackReference: reference
    });

    // Initialize Paystack transaction
    const paystackData = {
      email: req.user.email,
      amount: amount * 100, // Convert to kobo (Naira * 100)
      reference,
      callback_url: `${process.env.FRONTEND_URL}/wallet/verify-payment`,
      metadata: {
        userId: userId.toString(),
        transactionId: transaction._id.toString()
      }
    };

    const paystackResponse = await initializeTransaction(paystackData);

    // Update transaction with Paystack reference
    transaction.paystackReference = paystackResponse.data.reference;
    transaction.metadata = {
      paystackResponse: paystackResponse.data
    };
    await transaction.save();

    return successResponse(res, 200, 'Wallet funding initialized successfully', {
      transaction: {
        _id: transaction._id,
        amount,
        reference: transaction.paystackReference,
        status: transaction.status
      },
      authorizationUrl: paystackResponse.data.authorization_url
    });
  } catch (error) {
    console.error('Initialize wallet funding error:', error);
    return errorResponse(res, 500, 'Failed to initialize wallet funding', { error: error.message });
  }
};

/**
 * Verify wallet funding
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const verifyFunding = async (req, res) => {
  try {
    const { reference } = req.params;
    const userId = req.user._id;

    if (!reference) {
      return validationErrorResponse(res, {
        message: 'Transaction reference is required'
      });
    }

    // Find the transaction
    const transaction = await Transaction.findOne({
      paystackReference: reference,
      user: userId,
      type: 'funding'
    });

    if (!transaction) {
      return notFoundResponse(res, 'Transaction not found');
    }

    // If transaction is already verified and successful, return success
    if (transaction.status === 'successful') {
      return successResponse(res, 200, 'Transaction already verified and successful', {
        transaction: {
          _id: transaction._id,
          amount: transaction.amount,
          reference: transaction.paystackReference,
          status: transaction.status
        }
      });
    }

    // Verify transaction with Paystack
    const paystackResponse = await verifyTransaction(reference);

    // Update transaction based on Paystack response
    if (paystackResponse.data.status === 'success') {
      // Update transaction status
      transaction.status = 'successful';
      transaction.metadata = {
        ...transaction.metadata,
        paystackVerification: paystackResponse.data
      };
      await transaction.save();

      // Update wallet balance
      const wallet = await Wallet.findOne({ user: userId });
      if (wallet) {
        await wallet.addFunds(transaction.amount);
      }

      return successResponse(res, 200, 'Wallet funding successful', {
        transaction: {
          _id: transaction._id,
          amount: transaction.amount,
          reference: transaction.paystackReference,
          status: transaction.status
        }
      });
    } else {
      // Update transaction as failed
      transaction.status = 'failed';
      transaction.metadata = {
        ...transaction.metadata,
        paystackVerification: paystackResponse.data
      };
      await transaction.save();

      return errorResponse(res, 400, 'Wallet funding failed', {
        transaction: {
          _id: transaction._id,
          amount: transaction.amount,
          reference: transaction.paystackReference,
          status: transaction.status
        }
      });
    }
  } catch (error) {
    console.error('Verify wallet funding error:', error);
    return errorResponse(res, 500, 'Failed to verify wallet funding', { error: error.message });
  }
};

/**
 * Get wallet transaction history
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, type } = req.query;

    // Build query
    const query = { user: userId };
    if (type && ['funding', 'airtime', 'electricity', 'cable'].includes(type)) {
      query.type = type;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get transactions
    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Transaction.countDocuments(query);

    return successResponse(res, 200, 'Transaction history retrieved successfully', {
      transactions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get transaction history error:', error);
    return errorResponse(res, 500, 'Failed to retrieve transaction history', { error: error.message });
  }
};

module.exports = {
  getBalance,
  initializeFunding,
  verifyFunding,
  getTransactionHistory
};
