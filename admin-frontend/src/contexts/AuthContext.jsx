import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('admin_token') || null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on initial render
  useEffect(() => {
    const storedUser = localStorage.getItem('admin_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('admin_user');
      }
    }
    setIsLoading(false);
  }, []);

  // Fetch user profile when token changes
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await authAPI.getProfile();
        
        if (response.data.success) {
          const userData = response.data.data.user;
          setUser(userData);
          localStorage.setItem('admin_user', JSON.stringify(userData));
          setIsAuthenticated(true);
        } else {
          // Handle unsuccessful response
          logout();
          toast.error('Failed to load user profile');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [token]);

  // Login function
  const login = async (credentials) => {
    try {
      setIsLoading(true);
      const response = await authAPI.login(credentials);
      
      if (response.data.success) {
        const { token: newToken, user: userData } = response.data.data;
        
        // Save token and user data
        localStorage.setItem('admin_token', newToken);
        localStorage.setItem('admin_user', JSON.stringify(userData));
        
        // Update state
        setToken(newToken);
        setUser(userData);
        setIsAuthenticated(true);
        
        toast.success('Login successful');
        return true;
      } else {
        toast.error(response.data.message || 'Login failed');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    
    // Reset state
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    
    toast.info('You have been logged out');
  };

  // Context value
  const value = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
