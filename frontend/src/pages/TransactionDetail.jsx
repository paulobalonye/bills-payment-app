import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { walletAPI } from '../services/api';

const TransactionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [transaction, setTransaction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [billDetails, setBillDetails] = useState(null);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // Fetch transaction details
  useEffect(() => {
    const fetchTransactionDetails = async () => {
      try {
        setIsLoading(true);
        const response = await walletAPI.getTransactions(1, 1, undefined, id);
        
        if (response.data.success && response.data.data.transactions.length > 0) {
          const transactionData = response.data.data.transactions[0];
          setTransaction(transactionData);
          
          // Fetch bill details if it's a bill payment
          if (transactionData.type !== 'funding' && transactionData.billPaymentId) {
            try {
              // This would be a real API call in production
              // const billResponse = await billsAPI.getBillPayment(transactionData.billPaymentId);
              // setBillDetails(billResponse.data.data);
              
              // Mock bill details for demo
              const mockBillDetails = {
                _id: transactionData.billPaymentId || 'bill123456',
                type: transactionData.type,
                customerId: transactionData.type === 'airtime' ? '08012345678' : 
                            transactionData.type === 'electricity' ? '12345678901' : '98765432109',
                provider: transactionData.type === 'airtime' ? 'MTN' : 
                          transactionData.type === 'electricity' ? 'Ikeja Electric' : 'DSTV',
                status: transactionData.status,
                packageName: transactionData.type === 'cable' ? 'Premium Package' : undefined,
                meterType: transactionData.type === 'electricity' ? 'Prepaid' : undefined,
                token: transactionData.type === 'electricity' ? '1234-5678-9012-3456' : undefined,
                createdAt: transactionData.createdAt,
              };
              
              setBillDetails(mockBillDetails);
            } catch (error) {
              console.error('Error fetching bill details:', error);
            }
          }
        } else {
          toast.error('Transaction not found');
          navigate('/transactions');
        }
      } catch (error) {
        console.error('Error fetching transaction details:', error);
        toast.error('Failed to load transaction details. Please try again.');
        navigate('/transactions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactionDetails();
  }, [id, navigate]);

  // Get transaction icon based on type
  const getTransactionIcon = (type) => {
    switch (type) {
      case 'funding':
        return '💰';
      case 'airtime':
        return '📱';
      case 'electricity':
        return '⚡';
      case 'cable':
        return '📺';
      default:
        return '💳';
    }
  };

  // Get transaction title based on type
  const getTransactionTitle = (type) => {
    switch (type) {
      case 'funding':
        return 'Wallet Funding';
      case 'airtime':
        return 'Airtime Purchase';
      case 'electricity':
        return 'Electricity Payment';
      case 'cable':
        return 'Cable TV Subscription';
      default:
        return 'Transaction';
    }
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading transaction details</h2>
        <p className="text-gray-600">Please wait...</p>
      </div>
    );
  }

  if (!transaction) {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Transaction Details</h1>
        <Link 
          to="/transactions" 
          className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
        >
          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Transactions
        </Link>
      </div>

      {/* Transaction summary card */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="bg-primary-50 p-4 border-b border-primary-100">
          <div className="flex items-center">
            <span className="text-2xl mr-3">{getTransactionIcon(transaction.type)}</span>
            <h3 className="text-lg font-semibold text-gray-900">{getTransactionTitle(transaction.type)}</h3>
            <div className="ml-auto">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(transaction.status)}`}>
                {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="p-4 sm:p-6">
          <div className="mb-6">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-500">Amount</p>
              <p className={`text-3xl font-bold ${
                transaction.type === 'funding' ? 'text-green-600' : 'text-red-600'
              }`}>
                {transaction.type === 'funding' ? '+' : '-'}
                {formatCurrency(transaction.amount)}
              </p>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <dl className="divide-y divide-gray-200">
                <div className="py-3 flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Transaction ID</dt>
                  <dd className="text-sm font-medium text-gray-900">{transaction._id}</dd>
                </div>
                
                <div className="py-3 flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Date & Time</dt>
                  <dd className="text-sm font-medium text-gray-900">{formatDate(transaction.createdAt)}</dd>
                </div>
                
                <div className="py-3 flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Type</dt>
                  <dd className="text-sm font-medium text-gray-900">{getTransactionTitle(transaction.type)}</dd>
                </div>
                
                <div className="py-3 flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="text-sm font-medium">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(transaction.status)}`}>
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </span>
                  </dd>
                </div>
                
                {transaction.reference && (
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Reference</dt>
                    <dd className="text-sm font-medium text-gray-900">{transaction.reference}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Bill payment details */}
      {billDetails && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="bg-gray-50 p-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Payment Details</h3>
          </div>
          
          <div className="p-4 sm:p-6">
            <dl className="divide-y divide-gray-200">
              {billDetails.type === 'airtime' && (
                <>
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Phone Number</dt>
                    <dd className="text-sm font-medium text-gray-900">{billDetails.customerId}</dd>
                  </div>
                  
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Network Provider</dt>
                    <dd className="text-sm font-medium text-gray-900">{billDetails.provider}</dd>
                  </div>
                </>
              )}
              
              {billDetails.type === 'electricity' && (
                <>
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Meter Number</dt>
                    <dd className="text-sm font-medium text-gray-900">{billDetails.customerId}</dd>
                  </div>
                  
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Electricity Provider</dt>
                    <dd className="text-sm font-medium text-gray-900">{billDetails.provider}</dd>
                  </div>
                  
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Meter Type</dt>
                    <dd className="text-sm font-medium text-gray-900">{billDetails.meterType}</dd>
                  </div>
                  
                  {billDetails.token && (
                    <div className="py-3">
                      <dt className="text-sm font-medium text-gray-500 mb-2">Meter Token</dt>
                      <dd className="text-lg font-mono font-bold text-center tracking-wider bg-yellow-100 p-2 rounded text-yellow-900">
                        {billDetails.token}
                      </dd>
                      <p className="text-xs text-gray-500 mt-1 text-center">
                        Please load this token into your meter
                      </p>
                    </div>
                  )}
                </>
              )}
              
              {billDetails.type === 'cable' && (
                <>
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Smart Card Number</dt>
                    <dd className="text-sm font-medium text-gray-900">{billDetails.customerId}</dd>
                  </div>
                  
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Cable TV Provider</dt>
                    <dd className="text-sm font-medium text-gray-900">{billDetails.provider}</dd>
                  </div>
                  
                  {billDetails.packageName && (
                    <div className="py-3 flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">Package</dt>
                      <dd className="text-sm font-medium text-gray-900">{billDetails.packageName}</dd>
                    </div>
                  )}
                </>
              )}
            </dl>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
        <Link to="/transactions" className="btn btn-secondary text-center flex-1">
          Back to Transactions
        </Link>
        
        {transaction.type !== 'funding' && (
          <Link 
            to={`/bills/${transaction.type}`} 
            className="btn btn-primary text-center flex-1"
          >
            Make Another Payment
          </Link>
        )}
        
        {transaction.type === 'funding' && (
          <Link 
            to="/wallet/fund" 
            className="btn btn-primary text-center flex-1"
          >
            Fund Wallet Again
          </Link>
        )}
      </div>
    </div>
  );
};

export default TransactionDetail;
