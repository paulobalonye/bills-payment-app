import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>
        
        {/* Protected routes */}
        <Route element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route path="/" element={<Dashboard />} />
          {/* These routes will be implemented later */}
          <Route path="/users" element={<div className="p-4">Users Management (Coming Soon)</div>} />
          <Route path="/fundings" element={<div className="p-4">Wallet Fundings (Coming Soon)</div>} />
          <Route path="/bills" element={<div className="p-4">Bill Payments (Coming Soon)</div>} />
          <Route path="/transactions" element={<div className="p-4">Transactions (Coming Soon)</div>} />
          <Route path="/transactions/:id" element={<div className="p-4">Transaction Detail (Coming Soon)</div>} />
          <Route path="/settings" element={<div className="p-4">Settings (Coming Soon)</div>} />
        </Route>
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
