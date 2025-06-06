import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { walletAPI } from '../services/api';

const FundWallet = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);

  // Predefined amounts
  const predefinedAmounts = [1000, 2000, 5000, 10000, 20000];

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  // Fetch wallet balance
  useEffect(() => {
    const fetchWalletBalance = async () => {
      try {
        const response = await walletAPI.getBalance();
        setWalletBalance(response.data.data.balance);
      } catch (error) {
        console.error('Error fetching wallet balance:', error);
        toast.error('Failed to load wallet balance. Please try again.');
      }
    };

    fetchWalletBalance();
  }, []);

  // Check for reference in URL (for Paystack redirect)
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const reference = query.get('reference');
    
    if (reference) {
      verifyPayment(reference);
    }
  }, [location.search]);

  // Verify payment after Paystack redirect
  const verifyPayment = async (reference) => {
    try {
      setIsVerifying(true);
      const response = await walletAPI.verifyFunding(reference);
      
      if (response.data.success) {
        toast.success('Wallet funded successfully!');
        navigate('/');
      } else {
        toast.error('Payment verification failed. Please contact support.');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      toast.error('Failed to verify payment. Please contact support.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle amount change
  const handleAmountChange = (e) => {
    const value = e.target.value;
    // Allow only numbers
    if (/^\d*$/.test(value)) {
      setAmount(value);
    }
  };

  // Handle predefined amount selection
  const handlePredefinedAmount = (value) => {
    setAmount(value.toString());
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!amount || parseInt(amount) < 100) {
      toast.error('Please enter a valid amount (minimum ₦100)');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await walletAPI.fundWallet(parseInt(amount));
      
      // Redirect to Paystack checkout
      if (response.data.success && response.data.data.authorizationUrl) {
        window.location.href = response.data.data.authorizationUrl;
      } else {
        toast.error('Failed to initialize payment. Please try again.');
      }
    } catch (error) {
      console.error('Payment initialization error:', error);
      toast.error('Failed to initialize payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Verifying your payment</h2>
        <p className="text-gray-600">Please wait while we confirm your transaction...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Fund Your Wallet</h1>
        <p className="text-gray-600">Add money to your wallet using Paystack</p>
      </div>

      {/* Wallet balance card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Current Balance</h2>
        <div className="text-3xl font-bold text-gray-900 mb-2">
          {formatCurrency(walletBalance)}
        </div>
      </div>

      {/* Fund wallet form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Enter Amount (NGN)
            </label>
            <input
              type="text"
              id="amount"
              value={amount}
              onChange={handleAmountChange}
              className="input"
              placeholder="Enter amount in Naira"
              required
            />
            <p className="mt-1 text-sm text-gray-500">Minimum amount: ₦100</p>
          </div>

          {/* Predefined amounts */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Select
            </label>
            <div className="grid grid-cols-3 gap-2">
              {predefinedAmounts.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handlePredefinedAmount(value)}
                  className="py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {formatCurrency(value)}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn btn-primary py-2 px-4"
          >
            {isLoading ? 'Processing...' : 'Proceed to Payment'}
          </button>
        </form>

        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Payment Information</h3>
          <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
            <li>Your payment is securely processed by Paystack</li>
            <li>You can pay using card, bank transfer, or USSD</li>
            <li>Your wallet will be credited immediately after successful payment</li>
            <li>For any issues, please contact our support team</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FundWallet;
