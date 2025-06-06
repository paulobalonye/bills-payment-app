import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary-600">404</h1>
        <h2 className="text-3xl font-semibold text-gray-900 mt-4">Page Not Found</h2>
        <p className="text-gray-600 mt-2 max-w-md mx-auto">
          The page you are looking for doesn't exist or has been moved.
        </p>
        
        <div className="mt-8 space-y-3">
          <Link
            to="/"
            className="btn btn-primary inline-block px-6 py-3"
          >
            Go to Dashboard
          </Link>
          
          <div className="block text-sm text-gray-500 mt-4">
            or check out these links:
          </div>
          
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            <Link
              to="/wallet/fund"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Fund Wallet
            </Link>
            <Link
              to="/bills/airtime"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Buy Airtime
            </Link>
            <Link
              to="/bills/electricity"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Pay Electricity
            </Link>
            <Link
              to="/bills/cable"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Pay Cable TV
            </Link>
            <Link
              to="/transactions"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Transactions
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
