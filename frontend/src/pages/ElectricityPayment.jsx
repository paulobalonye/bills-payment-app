import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { walletAPI, billsAPI } from '../services/api';

const ElectricityPayment = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    meterNumber: '',
    amount: '',
    provider: '',
    meterType: 'prepaid',
    customerName: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [customerVerified, setCustomerVerified] = useState(false);

  // Electricity providers
  const providers = [
    { id: 'eko', name: 'Eko Electric', logo: '⚡', color: 'blue' },
    { id: 'ikeja', name: 'Ikeja Electric', logo: '⚡', color: 'red' },
    { id: 'ibadan', name: 'Ibadan Electric', logo: '⚡', color: 'yellow' },
    { id: 'abuja', name: 'Abuja Electric', logo: '⚡', color: 'green' },
    { id: 'kano', name: 'Kano Electric', logo: '⚡', color: 'purple' },
    { id: 'portharcourt', name: 'Port Harcourt Electric', logo: '⚡', color: 'indigo' },
  ];

  // Meter types
  const meterTypes = [
    { id: 'prepaid', name: 'Prepaid' },
    { id: 'postpaid', name: 'Postpaid' },
  ];

  // Predefined amounts
  const predefinedAmounts = [1000, 2000, 5000, 10000, 15000, 20000];

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
    
    if (name === 'meterNumber' && !/^\d*$/.test(value)) {
      return; // Only allow numbers for meter number
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
    
    // Reset verification when meter number or provider changes
    if (name === 'meterNumber' || name === 'provider' || name === 'meterType') {
      setCustomerVerified(false);
      setFormData(prev => ({
        ...prev,
        customerName: '',
        [name]: value,
      }));
    }
  };

  // Handle provider selection
  const handleProviderSelect = (providerId) => {
    setFormData({
      ...formData,
      provider: providerId,
    });
    
    // Clear error when user selects
    if (errors.provider) {
      setErrors({
        ...errors,
        provider: '',
      });
    }
    
    // Reset verification
    setCustomerVerified(false);
    setFormData(prev => ({
      ...prev,
      provider: providerId,
      customerName: '',
    }));
  };

  // Handle meter type selection
  const handleMeterTypeSelect = (typeId) => {
    setFormData({
      ...formData,
      meterType: typeId,
    });
    
    // Reset verification
    setCustomerVerified(false);
    setFormData(prev => ({
      ...prev,
      meterType: typeId,
      customerName: '',
    }));
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

  // Verify meter number
  const verifyMeter = async () => {
    if (!formData.meterNumber || !formData.provider || !formData.meterType) {
      setErrors({
        ...errors,
        meterNumber: !formData.meterNumber ? 'Meter number is required' : '',
        provider: !formData.provider ? 'Please select a provider' : '',
      });
      return;
    }
    
    setIsVerifying(true);
    
    try {
      // This would be a real API call in production
      // const response = await billsAPI.verifyMeter({
      //   meterNumber: formData.meterNumber,
      //   provider: formData.provider,
      //   meterType: formData.meterType,
      // });
      
      // Simulate API response for demo
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock customer data
      const customerName = 'John Doe';
      
      setFormData({
        ...formData,
        customerName,
      });
      
      setCustomerVerified(true);
      toast.success('Meter verified successfully!');
    } catch (error) {
      console.error('Meter verification error:', error);
      const message = error.response?.data?.message || 'Failed to verify meter. Please check the details and try again.';
      toast.error(message);
      setCustomerVerified(false);
    } finally {
      setIsVerifying(false);
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.meterNumber) {
      newErrors.meterNumber = 'Meter number is required';
    }
    
    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else if (parseInt(formData.amount) < 500) {
      newErrors.amount = 'Minimum amount is ₦500';
    } else if (parseInt(formData.amount) > walletBalance) {
      newErrors.amount = 'Amount exceeds wallet balance';
    }
    
    if (!formData.provider) {
      newErrors.provider = 'Please select a provider';
    }
    
    if (!customerVerified) {
      newErrors.meterNumber = 'Please verify meter number first';
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
      const response = await billsAPI.payElectricity({
        meterNumber: formData.meterNumber,
        amount: parseInt(formData.amount),
        provider: formData.provider,
        meterType: formData.meterType,
      });
      
      if (response.data.success) {
        toast.success('Electricity payment successful!');
        navigate('/payment/status', { 
          state: { 
            success: true,
            type: 'electricity',
            amount: formData.amount,
            recipient: formData.meterNumber,
            customerName: formData.customerName,
            provider: providers.find(p => p.id === formData.provider)?.name,
            meterType: formData.meterType,
            transactionId: response.data.data.transactionId,
            token: response.data.data.token, // For prepaid meters
          } 
        });
      } else {
        toast.error(response.data.message || 'Electricity payment failed. Please try again.');
      }
    } catch (error) {
      console.error('Electricity payment error:', error);
      const message = error.response?.data?.message || 'Electricity payment failed. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pay Electricity Bill</h1>
        <p className="text-gray-600">Pay for prepaid or postpaid electricity</p>
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

      {/* Electricity payment form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          {/* Provider selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Electricity Provider
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {providers.map((provider) => (
                <button
                  key={provider.id}
                  type="button"
                  onClick={() => handleProviderSelect(provider.id)}
                  className={`flex flex-col items-center justify-center p-3 border rounded-lg transition-colors ${
                    formData.provider === provider.id
                      ? `bg-${provider.color}-50 border-${provider.color}-500 text-${provider.color}-700`
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-2xl mb-1">{provider.logo}</span>
                  <span className="text-sm font-medium">{provider.name}</span>
                </button>
              ))}
            </div>
            {errors.provider && (
              <p className="mt-1 text-sm text-red-600">{errors.provider}</p>
            )}
          </div>

          {/* Meter type selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meter Type
            </label>
            <div className="flex space-x-4">
              {meterTypes.map((type) => (
                <label
                  key={type.id}
                  className="flex items-center"
                >
                  <input
                    type="radio"
                    name="meterType"
                    value={type.id}
                    checked={formData.meterType === type.id}
                    onChange={() => handleMeterTypeSelect(type.id)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">{type.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Meter number with verification */}
          <div className="mb-6">
            <label htmlFor="meterNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Meter Number
            </label>
            <div className="flex">
              <input
                type="text"
                id="meterNumber"
                name="meterNumber"
                value={formData.meterNumber}
                onChange={handleChange}
                className={`input rounded-r-none ${errors.meterNumber ? 'border-red-500' : ''}`}
                placeholder="Enter meter number"
              />
              <button
                type="button"
                onClick={verifyMeter}
                disabled={isVerifying || !formData.meterNumber || !formData.provider}
                className="btn btn-primary rounded-l-none px-4 py-2"
              >
                {isVerifying ? 'Verifying...' : 'Verify'}
              </button>
            </div>
            {errors.meterNumber ? (
              <p className="mt-1 text-sm text-red-600">{errors.meterNumber}</p>
            ) : (
              <p className="mt-1 text-sm text-gray-500">Enter your meter number</p>
            )}
            
            {/* Customer details after verification */}
            {customerVerified && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-sm font-medium text-green-800">Meter verified</p>
                </div>
                <p className="mt-1 text-sm text-green-700">
                  Customer Name: <span className="font-semibold">{formData.customerName}</span>
                </p>
              </div>
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
              <p className="mt-1 text-sm text-gray-500">Minimum amount: ₦500</p>
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
            disabled={isLoading || !customerVerified}
            className="w-full btn btn-primary py-2 px-4"
          >
            {isLoading ? 'Processing...' : 'Pay Electricity Bill'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ElectricityPayment;
