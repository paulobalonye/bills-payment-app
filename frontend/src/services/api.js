import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add it to request headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle unauthorized errors (401)
    if (error.response && error.response.status === 401) {
      // Clear token from localStorage
      localStorage.removeItem('token');
      
      // Redirect to login page if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
};

// Wallet API
export const walletAPI = {
  getBalance: () => api.get('/wallet/balance'),
  fundWallet: (amount) => api.post('/wallet/fund', { amount }),
  verifyFunding: (reference) => api.get(`/wallet/verify/${reference}`),
  getTransactions: (page = 1, limit = 10, type) => {
    const params = { page, limit };
    if (type) params.type = type;
    return api.get('/wallet/transactions', { params });
  },
};

// Bills API
export const billsAPI = {
  buyAirtime: (data) => api.post('/bills/airtime', data),
  payElectricity: (data) => api.post('/bills/electricity', data),
  payCable: (data) => api.post('/bills/cable', data),
  getBillPayments: (page = 1, limit = 10, type) => {
    const params = { page, limit };
    if (type) params.type = type;
    return api.get('/bills/history', { params });
  },
};

export default api;
