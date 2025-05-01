import * as Yup from 'yup';

// Registration Validation Schema
export const registerValidationSchema = Yup.object().shape({
  // Username validation
  username: Yup.string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters')
    .matches(/^[a-zA-Z0-9_]*$/, 'Username can only contain letters, numbers, and underscores'),

  // Email validation
  email: Yup.string()
    .required('Email is required')
    .email('Invalid email format'),

  // ID Number validation
  idNumber: Yup.string()
    .required('ID number is required')
    .matches(/^[0-9]{8,12}$/, 'ID must be between 8-12 digits'),

  // Account Number validation
  accountNumber: Yup.string()
    .required('Account number is required')
    .matches(/^[0-9]{10,16}$/, 'Account number must be between 10-16 digits'),

  // Password validation
  password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),

  // Confirm Password validation
  confirmPassword: Yup.string()
    .required('Please confirm your password')
    .oneOf([Yup.ref('password'), null], 'Passwords must match'),
});

// Login Validation Schema
export const loginValidationSchema = Yup.object().shape({
  username: Yup.string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters'),

  accountNumber: Yup.string()
    .required('Account number is required')
    .matches(/^[0-9]{10,16}$/, 'Account number must be between 10-16 digits'),

  password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters'),
});

// Payment Validation Schema
export const paymentValidationSchema = Yup.object().shape({
  mode: Yup.string().required('Mode is required'),

  amount: Yup.number()
    .required('Amount is required')
    .positive('Amount must be positive')
    .max(1000000, 'Amount cannot exceed 1,000,000'),

  currency: Yup.string()
    .required('Currency is required')
    .oneOf(['USD', 'EUR', 'GBP', 'ZAR', 'LSL', 'NAD'], 'Invalid currency'),

  // Conditionally required fields when mode is 'new'
  provider: Yup.string().when('mode', {
    is: 'new',
    then: Yup.string().required('Provider is required'),
    otherwise: Yup.string().notRequired(),
  }),

  recipientName: Yup.string().when('mode', {
    is: 'new',
    then: Yup.string()
      .required('Recipient name is required')
      .min(2, 'Name must be at least 2 characters'),
    otherwise: Yup.string().notRequired(),
  }),

  recipientAccount: Yup.string().when('mode', {
    is: 'new',
    then: Yup.string()
      .required('Recipient account is required')
      .matches(/^[0-9]{10,16}$/, 'Account number must be between 10-16 digits'),
    otherwise: Yup.string().notRequired(),
  }),

  swiftCode: Yup.string().when('mode', {
    is: 'new',
    then: Yup.string()
      .required('SWIFT code is required')
      .matches(/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/, 'Invalid SWIFT code format'),
    otherwise: Yup.string().notRequired(),
  }),

  // Conditionally required fields when mode is 'saved'
  recipient: Yup.string().when('mode', {
    is: 'saved',
    then: Yup.string().required('Please select a recipient'),
    otherwise: Yup.string().notRequired(),
  }),

  reference: Yup.string().notRequired(),
  
  isInstant: Yup.boolean(),
  saveRecipient: Yup.boolean(),
});