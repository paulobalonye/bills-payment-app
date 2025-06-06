import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { walletAPI, billsAPI } from '../services/api';

const AirtimePurchase = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    phoneNumber: '',
    amount: '',
    network: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);

  // Network providers
  const networks = [
    { id: 'mtn', name: 'MTN', logo: '📱', color: 'yellow' },
    { id: 'airtel', name: 'Airtel', logo: '📱', color: 'red' },
    { id: 'glo', name: 'Glo', logo: '📱', color: 'green' },
    { id: '9mobile', name: '9Mobile', logo: '📱', color: 'green' },
  ];

  // Predefined amounts
  const predefinedAmounts = [100, 200, 500, 1000, 2000, 5000];

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

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'amount' && !/^\d*$/.test(value)) {
      return; // Only allow numbers for amount
    }
    
    if (name === 'phoneNumber' && !/^\d*$/.test(value)) {
      return; // Only allow numbers for phone number
    }
    
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  // Handle network selection
  const handleNetworkSelect = (networkId) => {
    setFormData({
      ...formData,
      network: networkId,
    });
    
    // Clear error when user selects
    if (errors.network) {
      setErrors({
        ...errors,
        network: '',
      });
    }
  };

  // Handle predefined amount selection
  const handlePredefinedAmount = (value) => {
    setFormData({
      ...formData,
      amount: value.toString(),
    });
    
    // Clear error when user selects
    if (errors.amount) {
      setErrors({
        ...errors,
        amount: '',
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{11}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must be 11 digits';
    }
    
    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else if (parseInt(formData.amount) < 50) {
      newErrors.amount = 'Minimum amount is ₦50';
    } else if (parseInt(formData.amount) > walletBalance) {
      newErrors.amount = 'Amount exceeds wallet balance';
    }
    
    if (!formData.network) {
      newErrors.network = 'Please select a network provider';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await billsAPI.buyAirtime({
        phoneNumber: formData.phoneNumber,
        amount: parseInt(formData.amount),
        network: formData.network,
      });
      
      if (response.data.success) {
        toast.success('Airtime purchase successful!');
        navigate('/payment/status', { 
          state: { 
            success: true,
            type: 'airtime',
            amount: formData.amount,
            recipient: formData.phoneNumber,
            network: networks.find(n => n.id === formData.network)?.name,
            transactionId: response.data.data.transactionId,
          } 
        });
      } else {
        toast.error(response.data.message || 'Airtime purchase failed. Please try again.');
      }
    } catch (error) {
      console.error('Airtime purchase error:', error);
      const message = error.response?.data?.message || 'Airtime purchase failed. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Buy Airtime</h1>
        <p className="text-gray-600">Purchase airtime for any Nigerian network</p>
      </div>

      {/* Wallet balance card */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-sm font-medium text-gray-500">Wallet Balance</h2>
            <div className="text-xl font-bold text-gray-900">
              {formatCurrency(walletBalance)}
            </div>
          </div>
          <button
            onClick={() => navigate('/wallet/fund')}
            className="btn btn-primary text-sm py-1"
          >
            Fund Wallet
          </button>
        </div>
      </div>

      {/* Airtime purchase form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          {/* Network selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Network
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {networks.map((network) => (
                <button
                  key={network.id}
                  type="button"
                  onClick={() => handleNetworkSelect(network.id)}
                  className={`flex flex-col items-center justify-center p-3 border rounded-lg transition-colors ${
                    formData.network === network.id
                      ? `bg-${network.color}-50 border-${network.color}-500 text-${network.color}-700`
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-2xl mb-1">{network.logo}</span>
                  <span className="text-sm font-medium">{network.name}</span>
                </button>
              ))}
            </div>
            {errors.network && (
              <p className="mt-1 text-sm text-red-600">{errors.network}</p>
            )}
          </div>

          {/* Phone number */}
          <div className="mb-6">
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className={`input ${errors.phoneNumber ? 'border-red-500' : ''}`}
              placeholder="Enter 11-digit phone number"
              maxLength={11}
            />
            {errors.phoneNumber ? (
              <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
            ) : (
              <p className="mt-1 text-sm text-gray-500">Enter the recipient's phone number</p>
            )}
          </div>

          {/* Amount */}
          <div className="mb-6">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Amount (NGN)
            </label>
            <input
              type="text"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className={`input ${errors.amount ? 'border-red-500' : ''}`}
              placeholder="Enter amount"
            />
            {errors.amount ? (
              <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
            ) : (
              <p className="mt-1 text-sm text-gray-500">Minimum amount: ₦50</p>
            )}
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

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn btn-primary py-2 px-4"
          >
            {isLoading ? 'Processing...' : 'Buy Airtime'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AirtimePurchase;
