import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { walletAPI } from '../services/api';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('all');

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
    return date.toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Fetch transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        const response = await walletAPI.getTransactions(currentPage, 10, filter !== 'all' ? filter : undefined);
        
        setTransactions(response.data.data.transactions);
        setTotalPages(response.data.data.totalPages);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        toast.error('Failed to load transactions. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [currentPage, filter]);

  // Handle filter change
  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

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

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
        <p className="text-gray-600">View all your transactions</p>
      </div>

      {/* Filter and search */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <label htmlFor="filter" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Type
            </label>
            <select
              id="filter"
              value={filter}
              onChange={handleFilterChange}
              className="input py-1 px-3"
            >
              <option value="all">All Transactions</option>
              <option value="funding">Wallet Funding</option>
              <option value="airtime">Airtime Purchase</option>
              <option value="electricity">Electricity Payment</option>
              <option value="cable">Cable TV Subscription</option>
            </select>
          </div>
          
          <div className="text-sm text-gray-500">
            Showing {transactions.length} of {totalPages * 10} transactions
          </div>
        </div>
      </div>

      {/* Transactions list */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading transactions...</p>
          </div>
        ) : transactions.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <Link
                key={transaction._id}
                to={`/transactions/${transaction._id}`}
                className="block hover:bg-gray-50 transition-colors duration-150"
              >
                <div className="p-4 sm:p-6 flex items-center">
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center mr-4 ${
                    transaction.type === 'funding' 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-blue-100 text-blue-600'
                  }`}>
                    <span className="text-xl">{getTransactionIcon(transaction.type)}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {getTransactionTitle(transaction.type)}
                    </h3>
                    <div className="mt-1 flex flex-col sm:flex-row sm:items-center sm:justify-start text-xs text-gray-500">
                      <p className="truncate">
                        {formatDate(transaction.createdAt)}
                      </p>
                      <span className="hidden sm:inline mx-2">•</span>
                      <p className="truncate">
                        ID: {transaction._id.substring(0, 8)}...
                      </p>
                      <span className="hidden sm:inline mx-2">•</span>
                      <p className={`truncate ${
                        transaction.status === 'success' 
                          ? 'text-green-600' 
                          : transaction.status === 'pending' 
                            ? 'text-yellow-600' 
                            : 'text-red-600'
                      }`}>
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </p>
                    </div>
                  </div>
                  
                  <div className={`text-sm font-medium ${
                    transaction.type === 'funding' 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {transaction.type === 'funding' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-500">No transactions found</p>
            <Link 
              to="/wallet/fund" 
              className="mt-2 inline-block text-primary-600 hover:text-primary-700 font-medium"
            >
              Fund your wallet to get started
            </Link>
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{currentPage}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {/* Page numbers */}
                  {[...Array(totalPages).keys()].map((page) => (
                    <button
                      key={page + 1}
                      onClick={() => handlePageChange(page + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === page + 1
                          ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;
