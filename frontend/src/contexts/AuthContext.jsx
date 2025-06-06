import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          // Set token in axios headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Get user profile
          const response = await api.get('/auth/profile');
          setUser(response.data.data.user);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Auth initialization error:', error);
          // Clear invalid token
          localStorage.removeItem('token');
          setToken(null);
          setIsAuthenticated(false);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, [token]);

  // Register user
  const register = async (userData) => {
    try {
      setIsLoading(true);
      const response = await api.post('/auth/register', userData);
      const { token, user } = response.data.data;
      
      // Save token to localStorage
      localStorage.setItem('token', token);
      
      // Set token in axios headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setToken(token);
      setUser(user);
      setIsAuthenticated(true);
      
      toast.success('Registration successful!');
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  // Login user
  const login = async (credentials) => {
    try {
      setIsLoading(true);
      const response = await api.post('/auth/login', credentials);
      const { token, user } = response.data.data;
      
      // Save token to localStorage
      localStorage.setItem('token', token);
      
      // Set token in axios headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setToken(token);
      setUser(user);
      setIsAuthenticated(true);
      
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    
    // Remove token from axios headers
    delete api.defaults.headers.common['Authorization'];
    
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    
    toast.info('You have been logged out.');
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      setIsLoading(true);
      const response = await api.put('/auth/profile', userData);
      setUser(response.data.data.user);
      toast.success('Profile updated successfully!');
      return { success: true };
    } catch (error) {
      console.error('Profile update error:', error);
      const message = error.response?.data?.message || 'Failed to update profile. Please try again.';
      toast.error(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated,
    register,
    login,
    logout,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
