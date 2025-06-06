import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { walletAPI } from '../services/api';

// Dashboard card component
const DashboardCard = ({ title, icon, value, footer, to, color = 'primary' }) => {
  return (
    <Link 
      to={to} 
      className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
    >
      <div className={`p-4 bg-${color}-50 border-b border-${color}-100`}>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <span className={`text-${color}-600`}>{icon}</span>
        </div>
      </div>
      <div className="p-4">
        <div className="text-2xl font-bold text-gray-900 mb-2">{value}</div>
        <p className="text-sm text-gray-500">{footer}</p>
      </div>
    </Link>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [walletBalance, setWalletBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [recentTransactions, setRecentTransactions] = useState([]);

  // Fetch wallet balance and recent transactions
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch wallet balance
        const balanceResponse = await walletAPI.getBalance();
        setWalletBalance(balanceResponse.data.data.balance);
        
        // Fetch recent transactions
        const transactionsResponse = await walletAPI.getTransactions(1, 5);
        setRecentTransactions(transactionsResponse.data.data.transactions);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  // Quick action cards
  const quickActions = [
    {
      title: 'Fund Wallet',
      icon: '💰',
      value: 'Top up',
      footer: 'Add money to your wallet',
      to: '/wallet/fund',
      color: 'primary',
    },
    {
      title: 'Buy Airtime',
      icon: '📱',
      value: 'Recharge',
      footer: 'For any Nigerian network',
      to: '/bills/airtime',
      color: 'green',
    },
    {
      title: 'Pay Electricity',
      icon: '⚡',
      value: 'Pay bills',
      footer: 'Prepaid & postpaid meters',
      to: '/bills/electricity',
      color: 'yellow',
    },
    {
      title: 'Pay Cable TV',
      icon: '📺',
      value: 'Subscribe',
      footer: 'DSTV, GOTV & Startimes',
      to: '/bills/cable',
      color: 'purple',
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.fullName}</h1>
        <p className="text-gray-600">Manage your bills and payments in one place</p>
      </div>

      {/* Wallet balance card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Wallet Balance</h2>
          <Link 
            to="/wallet/fund" 
            className="btn btn-primary text-sm py-1"
          >
            Fund Wallet
          </Link>
        </div>
        
        {isLoading ? (
          <div className="animate-pulse h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        ) : (
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {formatCurrency(walletBalance)}
          </div>
        )}
        
        <p className="text-sm text-gray-500">
          Your wallet balance is updated in real-time
        </p>
      </div>

      {/* Quick actions */}
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {quickActions.map((action, index) => (
          <DashboardCard key={index} {...action} />
        ))}
      </div>

      {/* Recent transactions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Recent Transactions</h2>
          <Link 
            to="/transactions" 
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            View all
          </Link>
        </div>
        
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center py-3">
                <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                <div className="ml-4 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        ) : recentTransactions.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {recentTransactions.map((transaction) => (
              <Link 
                key={transaction._id} 
                to={`/transactions/${transaction._id}`}
                className="flex items-center py-3 hover:bg-gray-50 transition-colors duration-150"
              >
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  transaction.type === 'funding' 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-blue-100 text-blue-600'
                }`}>
                  {transaction.type === 'funding' ? '💰' : 
                   transaction.type === 'airtime' ? '📱' :
                   transaction.type === 'electricity' ? '⚡' : '📺'}
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {transaction.type === 'funding' 
                      ? 'Wallet Funding' 
                      : transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1) + ' Payment'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(transaction.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className={`text-sm font-medium ${
                  transaction.type === 'funding' 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {transaction.type === 'funding' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500">No transactions yet</p>
            <Link 
              to="/wallet/fund" 
              className="mt-2 inline-block text-primary-600 hover:text-primary-700 font-medium"
            >
              Fund your wallet to get started
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
