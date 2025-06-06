const { Wallet, Transaction, BillPayment } = require('../models');
const { purchaseAirtime, payElectricityBill, payCableBill } = require('../utils/paystackUtils');
const { successResponse, errorResponse, validationErrorResponse, notFoundResponse } = require('../utils/responseUtils');
const crypto = require('crypto');

/**
 * Purchase airtime
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const buyAirtime = async (req, res) => {
  try {
    const { phone, amount, provider } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!phone || !amount || !provider) {
      return validationErrorResponse(res, {
        message: 'Please provide phone, amount, and provider'
      });
    }

    // Validate amount
    if (isNaN(amount) || amount <= 0) {
      return validationErrorResponse(res, {
        message: 'Amount must be greater than 0'
      });
    }

    // Validate provider
    const validProviders = ['MTN', 'GLO', 'AIRTEL', '9MOBILE'];
    if (!validProviders.includes(provider.toUpperCase())) {
      return validationErrorResponse(res, {
        message: `Provider must be one of: ${validProviders.join(', ')}`
      });
    }

    // Find user's wallet
    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      return notFoundResponse(res, 'Wallet not found');
    }

    // Check if wallet has sufficient funds
    if (!wallet.hasSufficientFunds(amount)) {
      return errorResponse(res, 400, 'Insufficient funds in wallet');
    }

    // Generate reference
    const reference = `airtime_${crypto.randomBytes(8).toString('hex')}_${Date.now()}`;

    // Create transaction
    const transaction = await Transaction.create({
      user: userId,
      type: 'airtime',
      amount,
      status: 'pending',
      paystackReference: reference
    });

    try {
      // Deduct from wallet
      await wallet.deductFunds(amount);

      // Call Paystack API to purchase airtime
      const paystackResponse = await purchaseAirtime({
        phone,
        amount,
        provider: provider.toUpperCase()
      });

      // Create bill payment record
      const billPayment = await BillPayment.create({
        transaction: transaction._id,
        user: userId,
        type: 'airtime',
        customerId: phone,
        provider: provider.toUpperCase(),
        amount,
        status: 'successful',
        reference: paystackResponse.data.reference || reference,
        responseData: paystackResponse.data
      });

      // Update transaction
      transaction.status = 'successful';
      transaction.metadata = {
        billPaymentId: billPayment._id,
        paystackResponse: paystackResponse.data
      };
      await transaction.save();

      return successResponse(res, 200, 'Airtime purchase successful', {
        transaction: {
          _id: transaction._id,
          amount,
          status: transaction.status
        },
        billPayment: {
          _id: billPayment._id,
          type: billPayment.type,
          provider: billPayment.provider,
          customerId: billPayment.customerId,
          amount: billPayment.amount,
          status: billPayment.status
        }
      });
    } catch (error) {
      // If Paystack API call fails, refund the wallet
      await wallet.addFunds(amount);

      // Update transaction as failed
      transaction.status = 'failed';
      transaction.metadata = {
        error: error.message
      };
      await transaction.save();

      // Create failed bill payment record
      await BillPayment.create({
        transaction: transaction._id,
        user: userId,
        type: 'airtime',
        customerId: phone,
        provider: provider.toUpperCase(),
        amount,
        status: 'failed',
        reference,
        responseData: {
          error: error.message
        }
      });

      throw error;
    }
  } catch (error) {
    console.error('Airtime purchase error:', error);
    return errorResponse(res, 500, 'Failed to purchase airtime', { error: error.message });
  }
};

/**
 * Pay electricity bill
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const payElectricity = async (req, res) => {
  try {
    const { meterNumber, amount, provider, meterType } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!meterNumber || !amount || !provider || !meterType) {
      return validationErrorResponse(res, {
        message: 'Please provide meterNumber, amount, provider, and meterType'
      });
    }

    // Validate amount
    if (isNaN(amount) || amount <= 0) {
      return validationErrorResponse(res, {
        message: 'Amount must be greater than 0'
      });
    }

    // Validate meter type
    if (!['prepaid', 'postpaid'].includes(meterType.toLowerCase())) {
      return validationErrorResponse(res, {
        message: 'Meter type must be either prepaid or postpaid'
      });
    }

    // Find user's wallet
    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      return notFoundResponse(res, 'Wallet not found');
    }

    // Check if wallet has sufficient funds
    if (!wallet.hasSufficientFunds(amount)) {
      return errorResponse(res, 400, 'Insufficient funds in wallet');
    }

    // Generate reference
    const reference = `electricity_${crypto.randomBytes(8).toString('hex')}_${Date.now()}`;

    // Create transaction
    const transaction = await Transaction.create({
      user: userId,
      type: 'electricity',
      amount,
      status: 'pending',
      paystackReference: reference
    });

    try {
      // Deduct from wallet
      await wallet.deductFunds(amount);

      // Call Paystack API to pay electricity bill
      const paystackResponse = await payElectricityBill({
        meterNumber,
        amount,
        provider,
        meterType: meterType.toLowerCase()
      });

      // Create bill payment record
      const billPayment = await BillPayment.create({
        transaction: transaction._id,
        user: userId,
        type: 'electricity',
        customerId: meterNumber,
        provider,
        amount,
        status: 'successful',
        reference: paystackResponse.data.reference || reference,
        responseData: paystackResponse.data
      });

      // Update transaction
      transaction.status = 'successful';
      transaction.metadata = {
        billPaymentId: billPayment._id,
        paystackResponse: paystackResponse.data
      };
      await transaction.save();

      return successResponse(res, 200, 'Electricity bill payment successful', {
        transaction: {
          _id: transaction._id,
          amount,
          status: transaction.status
        },
        billPayment: {
          _id: billPayment._id,
          type: billPayment.type,
          provider: billPayment.provider,
          customerId: billPayment.customerId,
          amount: billPayment.amount,
          status: billPayment.status,
          token: paystackResponse.data.token || null
        }
      });
    } catch (error) {
      // If Paystack API call fails, refund the wallet
      await wallet.addFunds(amount);

      // Update transaction as failed
      transaction.status = 'failed';
      transaction.metadata = {
        error: error.message
      };
      await transaction.save();

      // Create failed bill payment record
      await BillPayment.create({
        transaction: transaction._id,
        user: userId,
        type: 'electricity',
        customerId: meterNumber,
        provider,
        amount,
        status: 'failed',
        reference,
        responseData: {
          error: error.message
        }
      });

      throw error;
    }
  } catch (error) {
    console.error('Electricity bill payment error:', error);
    return errorResponse(res, 500, 'Failed to pay electricity bill', { error: error.message });
  }
};

/**
 * Pay cable TV bill
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const payCable = async (req, res) => {
  try {
    const { smartcardNumber, provider, packageCode } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!smartcardNumber || !provider || !packageCode) {
      return validationErrorResponse(res, {
        message: 'Please provide smartcardNumber, provider, and packageCode'
      });
    }

    // Find package amount from packageCode (in a real app, this would be fetched from a database or API)
    // For this example, we'll use a simple mapping
    const packageAmounts = {
      'DSTV-PADI': 2500,
      'DSTV-YANGA': 3500,
      'DSTV-CONFAM': 6200,
      'GOTV-JINJA': 2250,
      'GOTV-JOLLI': 3300,
      'GOTV-MAX': 4850,
      'STARTIMES-NOVA': 1200,
      'STARTIMES-BASIC': 1850,
      'STARTIMES-SMART': 2600
    };

    const amount = packageAmounts[packageCode];
    if (!amount) {
      return validationErrorResponse(res, {
        message: 'Invalid package code'
      });
    }

    // Find user's wallet
    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      return notFoundResponse(res, 'Wallet not found');
    }

    // Check if wallet has sufficient funds
    if (!wallet.hasSufficientFunds(amount)) {
      return errorResponse(res, 400, 'Insufficient funds in wallet');
    }

    // Generate reference
    const reference = `cable_${crypto.randomBytes(8).toString('hex')}_${Date.now()}`;

    // Create transaction
    const transaction = await Transaction.create({
      user: userId,
      type: 'cable',
      amount,
      status: 'pending',
      paystackReference: reference
    });

    try {
      // Deduct from wallet
      await wallet.deductFunds(amount);

      // Call Paystack API to pay cable bill
      const paystackResponse = await payCableBill({
        smartcardNumber,
        provider,
        packageCode
      });

      // Create bill payment record
      const billPayment = await BillPayment.create({
        transaction: transaction._id,
        user: userId,
        type: 'cable',
        customerId: smartcardNumber,
        provider,
        amount,
        status: 'successful',
        reference: paystackResponse.data.reference || reference,
        responseData: paystackResponse.data
      });

      // Update transaction
      transaction.status = 'successful';
      transaction.metadata = {
        billPaymentId: billPayment._id,
        paystackResponse: paystackResponse.data
      };
      await transaction.save();

      return successResponse(res, 200, 'Cable TV bill payment successful', {
        transaction: {
          _id: transaction._id,
          amount,
          status: transaction.status
        },
        billPayment: {
          _id: billPayment._id,
          type: billPayment.type,
          provider: billPayment.provider,
          customerId: billPayment.customerId,
          amount: billPayment.amount,
          status: billPayment.status
        }
      });
    } catch (error) {
      // If Paystack API call fails, refund the wallet
      await wallet.addFunds(amount);

      // Update transaction as failed
      transaction.status = 'failed';
      transaction.metadata = {
        error: error.message
      };
      await transaction.save();

      // Create failed bill payment record
      await BillPayment.create({
        transaction: transaction._id,
        user: userId,
        type: 'cable',
        customerId: smartcardNumber,
        provider,
        amount,
        status: 'failed',
        reference,
        responseData: {
          error: error.message
        }
      });

      throw error;
    }
  } catch (error) {
    console.error('Cable TV bill payment error:', error);
    return errorResponse(res, 500, 'Failed to pay cable TV bill', { error: error.message });
  }
};

/**
 * Get bill payment history
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getBillPaymentHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, type } = req.query;

    // Build query
    const query = { user: userId };
    if (type && ['airtime', 'electricity', 'cable'].includes(type)) {
      query.type = type;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get bill payments
    const billPayments = await BillPayment.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await BillPayment.countDocuments(query);

    return successResponse(res, 200, 'Bill payment history retrieved successfully', {
      billPayments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get bill payment history error:', error);
    return errorResponse(res, 500, 'Failed to retrieve bill payment history', { error: error.message });
  }
};

module.exports = {
  buyAirtime,
  payElectricity,
  payCable,
  getBillPaymentHistory
};
