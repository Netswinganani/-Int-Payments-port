// src/components/Header.jsx
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { authToken, logout } = useAppContext();

  const isActive = (path) => {
    return location.pathname === path ? 'text-blue-600' : 'text-gray-700';
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16">
        <div className="flex justify-between h-full items-center">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            Secure Pay .Inc
          </Link>

          <div className="flex space-x-8 items-center">
            <Link
              to="/"
              className={`${isActive('/')} hover:text-blue-600 transition-colors`}
            >
              Home
            </Link>
            
            {!authToken && (
              <>
                <Link
                  to="/register"
                  className={`${isActive('/register')} hover:text-blue-600 transition-colors`}
                >
                  Register
                </Link>
                <Link
                  to="/login"
                  className={`${isActive('/login')} hover:text-blue-600 transition-colors`}
                >
                  Login
                </Link>
              </>
            )}

{authToken && (
  <>
    <Link
      to="/payment"
      className={`${isActive('/payment')} hover:text-blue-600 transition-colors`}
    >
      Make Payment
    </Link>
    <Link
      to="/history"
      className={`${isActive('/history')} hover:text-blue-600 transition-colors`}
    >
      History
    </Link>
    <button
      onClick={handleLogout}
      className="text-gray-700 hover:text-blue-600 transition-colors cursor-pointer"
    >
      Logout
    </button>
  </>
)}
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;