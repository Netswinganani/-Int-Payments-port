// src/pages/Login.jsx
import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useNavigate } from 'react-router-dom';
import { loginValidationSchema } from '../utils/validation';
import { login } from '../utils/api';

function Login() {
  const navigate = useNavigate();

  const initialValues = {
    username: '',
    email: '',
    accountNumber: '',
    password: '',
  };

  const handleSubmit = async (values, { setSubmitting, setStatus }) => {
    try {
      const result = await login(values);
      localStorage.setItem('authToken', result.token); // Save token
      navigate('/payment');
    } catch (error) {
      setStatus(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow">
        <h2 className="text-3xl font-bold text-center mb-8">Login</h2>
        <Formik
          initialValues={initialValues}
          validationSchema={loginValidationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, status }) => (
            <Form className="space-y-6">
              {status && (
                <div className="bg-red-100 text-red-700 p-3 rounded">
                  {status}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <Field
                  type="text"
                  name="username"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
                <ErrorMessage
                  name="username"
                  component="div"
                  className="text-red-600 text-sm mt-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <Field
                  type="email"
                  name="email"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-600 text-sm mt-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Account Number
                </label>
                <Field
                  type="text"
                  name="accountNumber"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
                <ErrorMessage
                  name="accountNumber"
                  component="div"
                  className="text-red-600 text-sm mt-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Field
                  type="password"
                  name="password"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-red-600 text-sm mt-1"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {isSubmitting ? 'Logging in...' : 'Login'}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default Login;
