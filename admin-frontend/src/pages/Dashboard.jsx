import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { statsAPI } from '../services/api';
import { 
  FiUsers, 
  FiDollarSign, 
  FiActivity, 
  FiCheckCircle, 
  FiXCircle, 
  FiClock 
} from 'react-icons/fi';
import { format } from 'date-fns';

// Stat Card Component
const StatCard = ({ title, value, icon, color }) => {
  return (
    <div className="card">
      <div className="p-6">
        <div className="flex items-center">
          <div className={`flex-shrink-0 rounded-md p-3 ${color}`}>
            {icon}
          </div>
          <div className="ml-5">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Transaction Item Component
const TransactionItem = ({ transaction }) => {
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'success':
        return 'badge-success';
      case 'failed':
        return 'badge-danger';
      case 'pending':
        return 'badge-warning';
      default:
        return 'badge-secondary';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'funding':
        return <FiDollarSign className="w-4 h-4" />;
      case 'airtime':
        return <FiActivity className="w-4 h-4" />;
      case 'electricity':
        return <FiActivity className="w-4 h-4" />;
      case 'cable':
        return <FiActivity className="w-4 h-4" />;
      default:
        return <FiActivity className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  return (
    <tr className="table-row">
      <td className="table-cell">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
            {getTypeIcon(transaction.type)}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
            </div>
            <div className="text-sm text-gray-500">
              {transaction.userId?.fullName || 'Unknown User'}
            </div>
          </div>
        </div>
      </td>
      <td className="table-cell">
        <div className="text-sm text-gray-900">{formatCurrency(transaction.amount)}</div>
        <div className="text-sm text-gray-500">
          {format(new Date(transaction.createdAt), 'MMM dd, yyyy HH:mm')}
        </div>
      </td>
      <td className="table-cell">
        <span className={`badge ${getStatusBadgeClass(transaction.status)}`}>
          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
        </span>
      </td>
      <td className="table-cell text-right">
        <Link
          to={`/transactions/${transaction._id}`}
          className="text-primary-600 hover:text-primary-900 text-sm font-medium"
        >
          View
        </Link>
      </td>
    </tr>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const response = await statsAPI.getStats();
        
        if (response.data.success) {
          setStats(response.data.data.stats);
          setRecentTransactions(response.data.data.recentTransactions);
        } else {
          setError('Failed to load dashboard data');
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('An error occurred while fetching dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-danger-50 text-danger-700 p-4 rounded-md">
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 text-sm font-medium text-danger-700 hover:text-danger-900"
        >
          Try again
        </button>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to the Bills Admin Dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={<FiUsers className="h-6 w-6 text-primary-600" />}
          color="bg-primary-50"
        />
        <StatCard
          title="Total Wallet Balance"
          value={formatCurrency(stats.totalWalletBalance)}
          icon={<FiDollarSign className="h-6 w-6 text-success-600" />}
          color="bg-success-50"
        />
        <StatCard
          title="Total Transactions"
          value={stats.totalTransactions}
          icon={<FiActivity className="h-6 w-6 text-warning-600" />}
          color="bg-warning-50"
        />
      </div>

      {/* Transaction Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="p-6">
            <div className="flex items-center">
              <FiCheckCircle className="h-5 w-5 text-success-600" />
              <h3 className="ml-2 text-lg font-medium text-gray-900">Success Rate</h3>
            </div>
            <div className="mt-2">
              <p className="text-3xl font-semibold text-success-600">
                {formatPercentage(stats.successRate)}
              </p>
              <p className="text-sm text-gray-500">
                {stats.successTransactions} successful transactions
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="p-6">
            <div className="flex items-center">
              <FiXCircle className="h-5 w-5 text-danger-600" />
              <h3 className="ml-2 text-lg font-medium text-gray-900">Failure Rate</h3>
            </div>
            <div className="mt-2">
              <p className="text-3xl font-semibold text-danger-600">
                {formatPercentage(stats.failRate)}
              </p>
              <p className="text-sm text-gray-500">
                {stats.failedTransactions} failed transactions
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="p-6">
            <div className="flex items-center">
              <FiClock className="h-5 w-5 text-warning-600" />
              <h3 className="ml-2 text-lg font-medium text-gray-900">Pending</h3>
            </div>
            <div className="mt-2">
              <p className="text-3xl font-semibold text-warning-600">
                {stats.pendingTransactions}
              </p>
              <p className="text-sm text-gray-500">
                Transactions awaiting completion
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
            <Link
              to="/transactions"
              className="text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              View all
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          {recentTransactions.length > 0 ? (
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">Transaction</th>
                  <th className="table-header-cell">Amount</th>
                  <th className="table-header-cell">Status</th>
                  <th className="table-header-cell text-right">Action</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {recentTransactions.map((transaction) => (
                  <TransactionItem key={transaction._id} transaction={transaction} />
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-6 text-center text-gray-500">
              No transactions found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
