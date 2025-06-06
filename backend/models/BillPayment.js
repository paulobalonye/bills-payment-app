const mongoose = require('mongoose');

const billPaymentSchema = new mongoose.Schema({
  transaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['airtime', 'electricity', 'cable'],
    required: true
  },
  customerId: {
    type: String,
    required: true,
    trim: true,
    comment: 'Phone number for airtime, meter number for electricity, smartcard number for cable'
  },
  provider: {
    type: String,
    required: true,
    trim: true,
    comment: 'Network provider for airtime, electricity company, or cable TV provider'
  },
  amount: {
    type: Number,
    required: true,
    min: [1, 'Amount must be at least 1']
  },
  status: {
    type: String,
    enum: ['pending', 'successful', 'failed'],
    default: 'pending'
  },
  reference: {
    type: String,
    trim: true
  },
  responseData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
billPaymentSchema.index({ user: 1, createdAt: -1 });
billPaymentSchema.index({ transaction: 1 }, { unique: true });
billPaymentSchema.index({ reference: 1 }, { unique: true, sparse: true });

const BillPayment = mongoose.model('BillPayment', billPaymentSchema);

module.exports = BillPayment;
