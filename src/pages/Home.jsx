// src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">
            Secure Payment Solution
          </h1>
          <div className="text-center">
            <Link
              to="/register"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg mr-4 hover:bg-blue-700"
            >
              Get Started
            </Link>
            <a
              href="mailto:support@example.com"
              className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 border rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Secure Registration & Login</h3>
              <p className="text-gray-600">End-to-end encrypted authentication system to protect your data.</p>
            </div>
            <div className="p-6 border rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Encrypted Payments</h3>
              <p className="text-gray-600">Your transactions are protected with industry-standard encryption.</p>
            </div>
            <div className="p-6 border rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Real-time Monitoring</h3>
              <p className="text-gray-600">Track your transactions in real-time with instant notifications.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-4">Company Info</h4>
              <p>Secure Payment Solutions</p>
              <p>contact@SecurePaymentSolutions.com</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul>
                <li><a href="#" className="hover:text-gray-300">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-gray-300">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Social</h4>
              <div className="flex space-x-4">
                <a href="#" className="hover:text-gray-300">Twitter</a>
                <a href="#" className="hover:text-gray-300">LinkedIn</a>
                <a href="#" className="hover:text-gray-300">Facebook</a>
              </div>
            </div>
          </div>
          <div className="mt-8 text-center">
            <p>&copy; {new Date().getFullYear()} Secure Payment Solutions. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;