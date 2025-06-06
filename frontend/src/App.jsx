import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import FundWallet from './pages/FundWallet';
import AirtimePurchase from './pages/AirtimePurchase';
import ElectricityPayment from './pages/ElectricityPayment';
import CablePayment from './pages/CablePayment';
import TransactionHistory from './pages/TransactionHistory';
import TransactionDetail from './pages/TransactionDetail';
import PaymentStatus from './pages/PaymentStatus';
import NotFound from './pages/NotFound';

// Auth context
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
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
          <Route path="/register" element={<Register />} />
        </Route>
        
        {/* Protected routes */}
        <Route element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route path="/" element={<Dashboard />} />
          <Route path="/wallet/fund" element={<FundWallet />} />
          <Route path="/bills/airtime" element={<AirtimePurchase />} />
          <Route path="/bills/electricity" element={<ElectricityPayment />} />
          <Route path="/bills/cable" element={<CablePayment />} />
          <Route path="/transactions" element={<TransactionHistory />} />
          <Route path="/transactions/:id" element={<TransactionDetail />} />
          <Route path="/payment/status" element={<PaymentStatus />} />
        </Route>
        
        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
