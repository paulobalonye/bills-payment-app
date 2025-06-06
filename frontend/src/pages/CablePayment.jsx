import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { walletAPI, billsAPI } from '../services/api';

const CablePayment = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    smartCardNumber: '',
    amount: '',
    provider: '',
    packageName: '',
    packageCode: '',
    customerName: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [customerVerified, setCustomerVerified] = useState(false);
  const [packages, setPackages] = useState([]);
  const [isLoadingPackages, setIsLoadingPackages] = useState(false);

  // Cable TV providers
  const providers = [
    { id: 'dstv', name: 'DSTV', logo: '📺', color: 'blue' },
    { id: 'gotv', name: 'GOTV', logo: '📺', color: 'green' },
    { id: 'startimes', name: 'Startimes', logo: '📺', color: 'red' },
  ];

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
    
    if (name === 'smartCardNumber' && !/^\d*$/.test(value)) {
      return; // Only allow numbers for smart card number
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
    
    // Reset verification when smart card number or provider changes
    if (name === 'smartCardNumber' || name === 'provider') {
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
      packageName: '',
      packageCode: '',
      amount: '',
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
      packageName: '',
      packageCode: '',
      amount: '',
    }));
    
    // Load packages for the selected provider
    fetchPackages(providerId);
  };

  // Fetch packages for the selected provider
  const fetchPackages = async (providerId) => {
    setIsLoadingPackages(true);
    setPackages([]);
    
    try {
      // This would be a real API call in production
      // const response = await billsAPI.getCablePackages(providerId);
      // setPackages(response.data.data.packages);
      
      // Simulate API response for demo
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock packages data
      const mockPackages = [
        { id: 'p1', name: 'Basic', code: 'BASIC', amount: 2000 },
        { id: 'p2', name: 'Standard', code: 'STANDARD', amount: 5000 },
        { id: 'p3', name: 'Premium', code: 'PREMIUM', amount: 10000 },
        { id: 'p4', name: 'Compact', code: 'COMPACT', amount: 7500 },
        { id: 'p5', name: 'Compact Plus', code: 'COMPACTPLUS', amount: 12500 },
      ];
      
      setPackages(mockPackages);
    } catch (error) {
      console.error('Error fetching packages:', error);
      toast.error('Failed to load packages. Please try again.');
    } finally {
      setIsLoadingPackages(false);
    }
  };

  // Handle package selection
  const handlePackageSelect = (packageItem) => {
    setFormData({
      ...formData,
      packageName: packageItem.name,
      packageCode: packageItem.code,
      amount: packageItem.amount.toString(),
    });
    
    // Clear error when user selects
    if (errors.packageCode) {
      setErrors({
        ...errors,
        packageCode: '',
      });
    }
    
    if (errors.amount) {
      setErrors({
        ...errors,
        amount: '',
      });
    }
  };

  // Verify smart card number
  const verifySmartCard = async () => {
    if (!formData.smartCardNumber || !formData.provider) {
      setErrors({
        ...errors,
        smartCardNumber: !formData.smartCardNumber ? 'Smart card number is required' : '',
        provider: !formData.provider ? 'Please select a provider' : '',
      });
      return;
    }
    
    setIsVerifying(true);
    
    try {
      // This would be a real API call in production
      // const response = await billsAPI.verifySmartCard({
      //   smartCardNumber: formData.smartCardNumber,
      //   provider: formData.provider,
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
      toast.success('Smart card verified successfully!');
    } catch (error) {
      console.error('Smart card verification error:', error);
      const message = error.response?.data?.message || 'Failed to verify smart card. Please check the details and try again.';
      toast.error(message);
      setCustomerVerified(false);
    } finally {
      setIsVerifying(false);
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.smartCardNumber) {
      newErrors.smartCardNumber = 'Smart card number is required';
    }
    
    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else if (parseInt(formData.amount) > walletBalance) {
      newErrors.amount = 'Amount exceeds wallet balance';
    }
    
    if (!formData.provider) {
      newErrors.provider = 'Please select a provider';
    }
    
    if (!formData.packageCode) {
      newErrors.packageCode = 'Please select a package';
    }
    
    if (!customerVerified) {
      newErrors.smartCardNumber = 'Please verify smart card number first';
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
      const response = await billsAPI.payCable({
        smartCardNumber: formData.smartCardNumber,
        amount: parseInt(formData.amount),
        provider: formData.provider,
        packageCode: formData.packageCode,
      });
      
      if (response.data.success) {
        toast.success('Cable TV subscription successful!');
        navigate('/payment/status', { 
          state: { 
            success: true,
            type: 'cable',
            amount: formData.amount,
            recipient: formData.smartCardNumber,
            customerName: formData.customerName,
            provider: providers.find(p => p.id === formData.provider)?.name,
            packageName: formData.packageName,
            transactionId: response.data.data.transactionId,
          } 
        });
      } else {
        toast.error(response.data.message || 'Cable TV subscription failed. Please try again.');
      }
    } catch (error) {
      console.error('Cable TV subscription error:', error);
      const message = error.response?.data?.message || 'Cable TV subscription failed. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pay Cable TV</h1>
        <p className="text-gray-600">Subscribe to your favorite cable TV packages</p>
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

      {/* Cable TV payment form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          {/* Provider selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Cable TV Provider
            </label>
            <div className="grid grid-cols-3 gap-3">
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

          {/* Smart card number with verification */}
          <div className="mb-6">
            <label htmlFor="smartCardNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Smart Card Number
            </label>
            <div className="flex">
              <input
                type="text"
                id="smartCardNumber"
                name="smartCardNumber"
                value={formData.smartCardNumber}
                onChange={handleChange}
                className={`input rounded-r-none ${errors.smartCardNumber ? 'border-red-500' : ''}`}
                placeholder="Enter smart card number"
              />
              <button
                type="button"
                onClick={verifySmartCard}
                disabled={isVerifying || !formData.smartCardNumber || !formData.provider}
                className="btn btn-primary rounded-l-none px-4 py-2"
              >
                {isVerifying ? 'Verifying...' : 'Verify'}
              </button>
            </div>
            {errors.smartCardNumber ? (
              <p className="mt-1 text-sm text-red-600">{errors.smartCardNumber}</p>
            ) : (
              <p className="mt-1 text-sm text-gray-500">Enter your smart card number</p>
            )}
            
            {/* Customer details after verification */}
            {customerVerified && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-sm font-medium text-green-800">Smart card verified</p>
                </div>
                <p className="mt-1 text-sm text-green-700">
                  Customer Name: <span className="font-semibold">{formData.customerName}</span>
                </p>
              </div>
            )}
          </div>

          {/* Package selection */}
          {formData.provider && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Package
              </label>
              
              {isLoadingPackages ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Loading packages...</p>
                </div>
              ) : packages.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {packages.map((pkg) => (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => handlePackageSelect(pkg)}
                      className={`flex justify-between items-center p-3 border rounded-lg transition-colors ${
                        formData.packageCode === pkg.code
                          ? 'bg-primary-50 border-primary-500 text-primary-700'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-sm font-medium">{pkg.name}</span>
                      <span className="text-sm font-bold">{formatCurrency(pkg.amount)}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No packages available for this provider</p>
              )}
              
              {errors.packageCode && (
                <p className="mt-1 text-sm text-red-600">{errors.packageCode}</p>
              )}
            </div>
          )}

          {/* Selected package details */}
          {formData.packageName && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Package</h3>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-900">{formData.packageName}</p>
                  <p className="text-xs text-gray-500">Package Code: {formData.packageCode}</p>
                </div>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(parseInt(formData.amount))}</p>
              </div>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading || !customerVerified || !formData.packageCode}
            className="w-full btn btn-primary py-2 px-4"
          >
            {isLoading ? 'Processing...' : 'Pay for Subscription'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CablePayment;
