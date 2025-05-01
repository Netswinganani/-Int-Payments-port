//// src/App.jsx
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Payment from './pages/Payment';
import PaymentHistory from './pages/PaymentHistory';

// Import the AppProvider from context
import { AppProvider } from './context/AppContext';

function App() {
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [dbError, setDbError] = useState(null);

  // Test database connection on app start
  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await fetch('/api/test-connection');
        console.log(response);  // Log response to check its status
        
        if (!response.ok) {
          const text = await response.text();
          console.error('Server error:', text);
          setDbError(`Database connection test failed: ${text}`);
          return;
        }
    
        try {
          const data = await response.json();
          console.log(data);  // Log the parsed response data
    
          if (data.success) {
            setIsDbConnected(true);
          } else {
            setDbError('Database connection test failed');
          }
        } catch (jsonError) {
          console.error('JSON parse error:', jsonError);
          const text = await response.text();
          console.error('Response text:', text);
          setDbError(`Failed to parse response data: ${error.message}`);
        }
    
      } catch (error) {
        setDbError('Failed to test database connection');
        console.error('Connection test error:', error);
      }
    };
    
    testConnection();
  }, []); // The empty array ensures this effect runs only once on mount

  return (
    // Wrap the entire app with AppProvider to provide global state
    <AppProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Header />
          {dbError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Database Error: </strong>
              <span className="block sm:inline">{dbError}</span>
            </div>
          )}
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/history" element={<PaymentHistory />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
