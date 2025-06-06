const { Wallet, Transaction } = require('../models');
const { verifyWebhookSignature } = require('../utils/paystackUtils');
const { successResponse, errorResponse } = require('../utils/responseUtils');

/**
 * Handle Paystack webhook events
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const handleWebhook = async (req, res) => {
  try {
    // Get signature from headers
    const signature = req.headers['x-paystack-signature'];
    
    // Verify webhook signature
    if (!verifyWebhookSignature(signature, req.body)) {
      return errorResponse(res, 401, 'Invalid signature');
    }
    
    // Get event data
    const event = req.body;
    
    // Handle different event types
    switch (event.event) {
      case 'charge.success':
        await handleChargeSuccess(event.data);
        break;
        
      case 'transfer.success':
        await handleTransferSuccess(event.data);
        break;
        
      case 'transfer.failed':
        await handleTransferFailed(event.data);
        break;
        
      // Add more event handlers as needed
    }
    
    // Always return 200 to acknowledge receipt of webhook
    return successResponse(res, 200, 'Webhook received');
  } catch (error) {
    console.error('Webhook error:', error);
    // Still return 200 to acknowledge receipt (Paystack will retry if we return an error)
    return successResponse(res, 200, 'Webhook received with errors');
  }
};

/**
 * Handle successful charge event
 * @param {Object} data - Paystack event data
 */
const handleChargeSuccess = async (data) => {
  try {
    // Find transaction by reference
    const transaction = await Transaction.findOne({
      paystackReference: data.reference,
      type: 'funding',
      status: 'pending'
    });
    
    if (!transaction) {
      console.log('Transaction not found for reference:', data.reference);
      return;
    }
    
    // Update transaction status
    transaction.status = 'successful';
    transaction.metadata = {
      ...transaction.metadata,
      paystackWebhook: data
    };
    await transaction.save();
    
    // Update wallet balance
    const wallet = await Wallet.findOne({ user: transaction.user });
    if (wallet) {
      await wallet.addFunds(transaction.amount);
      console.log(`Wallet ${wallet._id} credited with ${transaction.amount}`);
    }
  } catch (error) {
    console.error('Error handling charge.success:', error);
  }
};

/**
 * Handle successful transfer event
 * @param {Object} data - Paystack event data
 */
const handleTransferSuccess = async (data) => {
  try {
    // Find transaction by reference
    const transaction = await Transaction.findOne({
      paystackReference: data.reference
    });
    
    if (!transaction) {
      console.log('Transaction not found for reference:', data.reference);
      return;
    }
    
    // Update transaction status
    transaction.status = 'successful';
    transaction.metadata = {
      ...transaction.metadata,
      paystackWebhook: data
    };
    await transaction.save();
    
    console.log(`Transaction ${transaction._id} marked as successful`);
  } catch (error) {
    console.error('Error handling transfer.success:', error);
  }
};

/**
 * Handle failed transfer event
 * @param {Object} data - Paystack event data
 */
const handleTransferFailed = async (data) => {
  try {
    // Find transaction by reference
    const transaction = await Transaction.findOne({
      paystackReference: data.reference
    });
    
    if (!transaction) {
      console.log('Transaction not found for reference:', data.reference);
      return;
    }
    
    // Update transaction status
    transaction.status = 'failed';
    transaction.metadata = {
      ...transaction.metadata,
      paystackWebhook: data
    };
    await transaction.save();
    
    // If this was a bill payment, refund the wallet
    if (['airtime', 'electricity', 'cable'].includes(transaction.type)) {
      const wallet = await Wallet.findOne({ user: transaction.user });
      if (wallet) {
        await wallet.addFunds(transaction.amount);
        console.log(`Wallet ${wallet._id} refunded with ${transaction.amount}`);
      }
    }
    
    console.log(`Transaction ${transaction._id} marked as failed`);
  } catch (error) {
    console.error('Error handling transfer.failed:', error);
  }
};

module.exports = {
  handleWebhook
};
