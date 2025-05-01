import React, { createContext, useState, useEffect, useContext } from 'react';

// Create context
const AppContext = createContext();

// Provider component
export const AppProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken') || null);
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [selectedCurrency, setSelectedCurrency] = useState('USD'); // Default currency
  const [totalPayments, setTotalPayments] = useState(0);
  const [globalLimit, setGlobalLimit] = useState(0);
  const [userData, setUserData] = useState(null);
  const [financialData, setFinancialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // For error handling

  // Fetch data on authentication change
  useEffect(() => {
    const fetchData = async () => {
      if (authToken) {
        try {
          setLoading(true);
          await fetchUserData(authToken);
          await fetchFinancialData(authToken);
        } catch (err) {
          setError('An error occurred while fetching data');
          console.error('Error fetching data:', err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [authToken]); // Runs whenever the authToken changes

  // Fetch user data
  const fetchUserData = async (token) => {
    try {
      const token = localStorage.getItem('authToken'); // Get fresh from storage
      if (!token) throw new Error('No auth token');
  
      const response = await fetch('/api/user', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
        setUserData(data); // Store user data if needed elsewhere
        console.log('Fetched user data:', data);
      } else {
        console.error('Failed to fetch user data');
        throw new Error('Failed to fetch user data');
      }
    } catch (error) {
      console.error('Error fetching user data', error);
      setError('Failed to fetch user data');
    }
  };

  // Fetch financial data (balance, total payments, global limit)
  const fetchFinancialData = async () => {
    try {
      const response = await fetch('/api/financial-data', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      setBalance(data.balance);
      setTotalPayments(data.totalPayments);
      setGlobalLimit(data.globalLimit);
    } catch (error) {
      console.error('Error fetching financial data:', error);
      setError('Error fetching financial data');
    }
  };

  // Function to handle making a payment
  // Function to handle making a payment
const makePayment = async (
  amount,
  reference,
  isInstant,
  paymentMethod,
  recipientInfo,
  currency // make sure this is passed in
) => {
  try {
    const payload = {
      amount,
      reference,
      isInstant,
      payment_mode: paymentMethod || 'SWIFT',  // ✅ FIXED KEY HERE
      recipientInfo: {
        accountNumber: recipientInfo.accountNumber.trim(),
        bankName: recipientInfo.bankName.trim(),
        swiftCode: recipientInfo.swiftCode.trim(),
        recipientName: recipientInfo.recipientName.trim()
      },
      currency,
    };

    console.log("Sending payment payload:", payload);

    const response = await fetch('/api/payments/make-payment', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
   
      const result = await response.json();
      console.log('Payment successful:', result);

      // Use fetchUserData to refresh user data
     
        // This is the correct function
      await fetchUserData(authToken);        // ✅ this does exist
      await fetchFinancialData(authToken); 
    } else {
      const errorText = await response.text();
      console.error('Payment failed:', errorText);
      throw new Error(errorData.error || 'Payment failed');
    }
  } catch (error) {
    console.error('Error making payment:', error);
    throw new Error('Payment processing failed');
  }
};
  
  // Login function
  const login = async (email, password) => {
    try {
      // Clear previous credentials
      localStorage.removeItem('authToken');
      setAuthToken(null);
      setUser(null);
  
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
  
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('authToken', data.token);
        setAuthToken(data.token);
        setUser(data.user);
        
        // Force refresh all data
        await Promise.all([
          fetchUserData(),
          fetchFinancialData()
        ]);
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    // Clear all auth-related data
    localStorage.removeItem('authToken');
    setAuthToken(null);
    setUser(null);
    setBalance(0);
    setTotalPayments(0);
    setGlobalLimit(0);
    
    // Force hard reload to clear any cached data
    window.location.href = '/login';
  };
   // Add to existing state
   const [paymentHistory, setPaymentHistory] = useState([]);

   // Add this function
   const getPaymentHistory = async () => {
    try {
        const response = await fetch('/api/payments/history', {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const data = await response.json();
        setPaymentHistory([
            ...data.sentPayments.map(p => ({ ...p, type: 'sent' })),
            ...data.receivedPayments.map(p => ({ ...p, type: 'received' }))
        ].sort((a,b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch (error) {
        console.error('History fetch error:', error);
        setError('Failed to load payment history');
    }
};
  return (
    <AppContext.Provider
      value={{
        authToken,
        user,
        balance,
        selectedCurrency,
        totalPayments,
        globalLimit,
        login,
        logout,
        setSelectedCurrency,
        loading,
        error,
        makePayment, 
        fetchUserData,  // Add this
        fetchFinancialData, // Make sure makePayment is available
        paymentHistory,
        getPaymentHistory,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
