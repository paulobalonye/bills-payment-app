import axios from 'axios';
import { toast } from 'react-toastify';

// Create axios instance
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    
    if (response && response.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/login';
      toast.error('Your session has expired. Please log in again.');
    } else if (response && response.data && response.data.message) {
      // Show error message from server
      toast.error(response.data.message);
    } else {
      // Show generic error message
      toast.error('An error occurred. Please try again.');
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/admin/login', credentials),
  getProfile: () => api.get('/admin/me'),
};

// Users API
export const usersAPI = {
  getUsers: (page = 1, limit = 10, search = '') => 
    api.get('/admin/users', { params: { page, limit, search } }),
};

// Wallet Fundings API
export const fundingsAPI = {
  getFundings: (page = 1, limit = 10, filters = {}) => 
    api.get('/admin/fundings', { 
      params: { 
        page, 
        limit, 
        ...filters 
      } 
    }),
};

// Bill Payments API
export const billsAPI = {
  getBills: (page = 1, limit = 10, filters = {}) => 
    api.get('/admin/bills', { 
      params: { 
        page, 
        limit, 
        ...filters 
      } 
    }),
};

// Transactions API
export const transactionsAPI = {
  getTransaction: (id) => api.get(`/admin/transactions/${id}`),
  retryTransaction: (id) => api.post(`/admin/transactions/${id}/retry`),
};

// Dashboard Stats API
export const statsAPI = {
  getStats: () => api.get('/admin/stats'),
};

export default api;
