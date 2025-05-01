// src/utils/api.js
const API_URL = '/api';

export const authAPI = {
  login: async (credentials) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    return response.json();
  },

  register: async (userData) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Server responded with error:', error);
        throw new Error(error.error || 'Registration failed');
      }

      const result = await response.json();
      console.log('Registration API success:', result);
      return result;

    } catch (err) {
      console.error('API error during registration:', err);
      throw err;
    }
  },

  getAuthToken: () => {
    return localStorage.getItem('authToken');
  },

  setAuthToken: (token) => {
    localStorage.setItem('authToken', token);
  },

  removeAuthToken: () => {
    localStorage.removeItem('authToken');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  }
};

export const paymentAPI = {
  makePayment: async (paymentData) => {
    try {
      const token = authAPI.getAuthToken();

      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_URL}/payments/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(paymentData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Payment processing failed');
      }

      return response.json();
    } catch (error) {
      console.error('Payment error:', error);
      throw error;
    }
  },

  getPaymentHistory: async () => {
    try {
      const token = authAPI.getAuthToken();

      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_URL}/payments/history`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch payment history');
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching payment history:', error);
      throw error;
    }
  }
};

// Export individual API functions
export const login = authAPI.login;
export const register = authAPI.register;

export const makePayment = paymentAPI.makePayment;
export const getPaymentHistory = paymentAPI.getPaymentHistory;

export const setupAuthHeaders = () => {
  const token = authAPI.getAuthToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};
