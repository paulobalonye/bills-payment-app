import { Outlet, Link } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-bold text-primary-600">Bills Payment</h1>
        <h2 className="mt-2 text-center text-xl font-semibold text-gray-900">
          Pay your bills easily and securely
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Outlet />
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            &copy; {new Date().getFullYear()} Bills Payment App. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
