//register.jsx
import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useNavigate } from 'react-router-dom';
import { registerValidationSchema } from '../utils/validation';
import { register as registerUser } from '../utils/api';

function Register() {
  const navigate = useNavigate();

  const initialValues = {
    username: '',
    email: '',
    idNumber: '',
    accountNumber: '',
    password: '',
    confirmPassword: '',
  };

  const handleSubmit = async (values, { setSubmitting, setStatus }) => {
    console.log('Form submitted with:', values);

    try {
      const result = await registerUser(values);
      console.log('Registration successful:', result);
      setStatus('Registration successful! Redirecting...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (error) {
      console.error('Registration failed:', error);
      setStatus(error.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>

        <Formik
          initialValues={initialValues}
          validationSchema={registerValidationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, status }) => (
            <Form className="space-y-4">
              {status && (
                <div className={`text-sm p-2 rounded ${status.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {status}
                </div>
              )}

              <div>
                <label className="block">Username</label>
                <Field name="username" className="w-full border px-2 py-1" />
                <ErrorMessage name="username" component="div" className="text-red-500 text-sm" />
              </div>

              <div>
                <label className="block">Email</label>
                <Field name="email" type="email" className="w-full border px-2 py-1" />
                <ErrorMessage name="email" component="div" className="text-red-500 text-sm" />
              </div>

              <div>
                <label className="block">ID Number</label>
                <Field name="idNumber" className="w-full border px-2 py-1" />
                <ErrorMessage name="idNumber" component="div" className="text-red-500 text-sm" />
              </div>

              <div>
                <label className="block">Account Number</label>
                <Field name="accountNumber" className="w-full border px-2 py-1" />
                <ErrorMessage name="accountNumber" component="div" className="text-red-500 text-sm" />
              </div>

              <div>
                <label className="block">Password</label>
                <Field name="password" type="password" className="w-full border px-2 py-1" />
                <ErrorMessage name="password" component="div" className="text-red-500 text-sm" />
              </div>

              <div>
                <label className="block">Confirm Password</label>
                <Field name="confirmPassword" type="password" className="w-full border px-2 py-1" />
                <ErrorMessage name="confirmPassword" component="div" className="text-red-500 text-sm" />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 text-white py-2 px-4 rounded w-full"
              >
                {isSubmitting ? 'Registering...' : 'Register'}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default Register;
