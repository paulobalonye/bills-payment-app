const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['funding', 'airtime', 'electricity', 'cable'],
    required: true
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
  paystackReference: {
    type: String,
    trim: true
  },
  metadata: {
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
transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ paystackReference: 1 }, { unique: true, sparse: true });

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
