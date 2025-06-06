import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AuthLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // If loading, show loading spinner
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // If authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-primary-600">Bills Admin</h1>
          <p className="mt-2 text-sm text-gray-600">
            Admin Dashboard for Nigerian Bill Payment System
          </p>
        </div>
        
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Outlet />
        </div>
        
        <div className="text-center text-xs text-gray-500">
          &copy; {new Date().getFullYear()} Bills Payment System. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
