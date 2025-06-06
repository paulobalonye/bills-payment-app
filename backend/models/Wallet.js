const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  balance: {
    type: Number,
    default: 0,
    min: [0, 'Wallet balance cannot be negative']
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

// Method to add funds to wallet
walletSchema.methods.addFunds = async function(amount) {
  if (amount <= 0) {
    throw new Error('Amount must be greater than zero');
  }
  
  this.balance += amount;
  return this.save();
};

// Method to deduct funds from wallet
walletSchema.methods.deductFunds = async function(amount) {
  if (amount <= 0) {
    throw new Error('Amount must be greater than zero');
  }
  
  if (this.balance < amount) {
    throw new Error('Insufficient funds');
  }
  
  this.balance -= amount;
  return this.save();
};

// Method to check if wallet has sufficient funds
walletSchema.methods.hasSufficientFunds = function(amount) {
  return this.balance >= amount;
};

const Wallet = mongoose.model('Wallet', walletSchema);

module.exports = Wallet;
