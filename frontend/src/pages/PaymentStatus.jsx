import { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const PaymentStatus = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const paymentData = location.state;

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  // Redirect to dashboard if no payment data
  useEffect(() => {
    if (!paymentData) {
      toast.error('No payment information found');
      navigate('/');
    }
  }, [paymentData, navigate]);

  if (!paymentData) {
    return null;
  }

  // Get icon based on payment type
  const getPaymentIcon = () => {
    switch (paymentData.type) {
      case 'airtime':
        return '📱';
      case 'electricity':
        return '⚡';
      case 'cable':
        return '📺';
      default:
        return '💰';
    }
  };

  // Get payment title based on type
  const getPaymentTitle = () => {
    switch (paymentData.type) {
      case 'airtime':
        return 'Airtime Purchase';
      case 'electricity':
        return 'Electricity Payment';
      case 'cable':
        return 'Cable TV Subscription';
      default:
        return 'Payment';
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        {paymentData.success ? (
          <>
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-green-100 mb-4">
              <svg className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-600">Your transaction has been completed successfully.</p>
          </>
        ) : (
          <>
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-red-100 mb-4">
              <svg className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
            <p className="text-gray-600">We couldn't process your transaction. Please try again.</p>
          </>
        )}
      </div>

      {paymentData.success && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="bg-primary-50 p-4 border-b border-primary-100">
            <div className="flex items-center">
              <span className="text-2xl mr-3">{getPaymentIcon()}</span>
              <h3 className="text-lg font-semibold text-gray-900">{getPaymentTitle()}</h3>
            </div>
          </div>
          
          <div className="p-4 space-y-4">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Amount</span>
              <span className="text-sm font-medium text-gray-900">{formatCurrency(parseInt(paymentData.amount))}</span>
            </div>
            
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Date & Time</span>
              <span className="text-sm font-medium text-gray-900">{new Date().toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Transaction ID</span>
              <span className="text-sm font-medium text-gray-900">{paymentData.transactionId || 'N/A'}</span>
            </div>
            
            {paymentData.type === 'airtime' && (
              <>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Phone Number</span>
                  <span className="text-sm font-medium text-gray-900">{paymentData.recipient}</span>
                </div>
                
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Network</span>
                  <span className="text-sm font-medium text-gray-900">{paymentData.network}</span>
                </div>
              </>
            )}
            
            {paymentData.type === 'electricity' && (
              <>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Meter Number</span>
                  <span className="text-sm font-medium text-gray-900">{paymentData.recipient}</span>
                </div>
                
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Customer Name</span>
                  <span className="text-sm font-medium text-gray-900">{paymentData.customerName}</span>
                </div>
                
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Provider</span>
                  <span className="text-sm font-medium text-gray-900">{paymentData.provider}</span>
                </div>
                
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Meter Type</span>
                  <span className="text-sm font-medium text-gray-900">{paymentData.meterType === 'prepaid' ? 'Prepaid' : 'Postpaid'}</span>
                </div>
                
                {paymentData.meterType === 'prepaid' && paymentData.token && (
                  <div className="py-3 px-4 bg-yellow-50 rounded-md">
                    <h4 className="text-sm font-medium text-yellow-800 mb-1">Meter Token</h4>
                    <p className="text-lg font-mono font-bold text-center tracking-wider text-yellow-900 bg-yellow-100 p-2 rounded">
                      {paymentData.token}
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Please load this token into your meter
                    </p>
                  </div>
                )}
              </>
            )}
            
            {paymentData.type === 'cable' && (
              <>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Smart Card Number</span>
                  <span className="text-sm font-medium text-gray-900">{paymentData.recipient}</span>
                </div>
                
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Customer Name</span>
                  <span className="text-sm font-medium text-gray-900">{paymentData.customerName}</span>
                </div>
                
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Provider</span>
                  <span className="text-sm font-medium text-gray-900">{paymentData.provider}</span>
                </div>
                
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Package</span>
                  <span className="text-sm font-medium text-gray-900">{paymentData.packageName}</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col space-y-3">
        <Link to="/" className="btn btn-primary text-center">
          Back to Dashboard
        </Link>
        
        {paymentData.success && (
          <Link to="/transactions" className="btn btn-secondary text-center">
            View All Transactions
          </Link>
        )}
        
        {!paymentData.success && (
          <button
            onClick={() => navigate(-1)}
            className="btn btn-secondary text-center"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export default PaymentStatus;
