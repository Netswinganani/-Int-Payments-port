import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { convertCurrency } from '../utils/currencies';
import PaymentModal from './PaymentModal';

function PaymentForm() {
  // Get global context values with proper destructuring
  const { 
    balance, 
    selectedCurrency, 
    authToken,
    makePayment,
    fetchUserData,
    fetchFinancialData
  } = useAppContext();

  // Form state management
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [isInstant, setIsInstant] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('SWIFT');
  const [recipientInfo, setRecipientInfo] = useState({
    recipientName: '',
    accountNumber: '',
    swiftCode: '',
    bankName: '',
  });

  // SWIFT/BIC validation regex
  const SWIFT_REGEX = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
  // Basic account number validation (adjust based on your requirements)
  const ACCOUNT_REGEX = /^[A-Z0-9]{8,34}$/i;

  const verifyRecipient = async (accountNumber) => {
    try {
      const response = await fetch('/api/payments/verify-recipient', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ 
          accountNumber: accountNumber.trim() 
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Verification failed');
      }

      const data = await response.json();
      return data.valid;
    } catch (error) {
      console.error('Verification error:', error);
      setError(error.message);
      return false;
    }
  };

  const validateForm = () => {
    const errors = [];

    // Amount validation
    if (!amount || isNaN(amount)) {
      errors.push('Invalid amount entered');
    }

    // Recipient info validation
    if (!recipientInfo.recipientName.trim()) {
      errors.push('Recipient name is required');
    }

    if (!ACCOUNT_REGEX.test(recipientInfo.accountNumber.trim())) {
      errors.push('Invalid account number format');
    }

    if (!SWIFT_REGEX.test(recipientInfo.swiftCode.trim())) {
      errors.push('Invalid SWIFT/BIC code');
    }

    if (!recipientInfo.bankName.trim()) {
      errors.push('Bank name is required');
    }

    if (errors.length > 0) {
      setError(errors.join(', '));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Validate form inputs
      if (!validateForm()) return;

      // Verify recipient account
      const isValidRecipient = await verifyRecipient(recipientInfo.accountNumber);
      if (!isValidRecipient) return;

      // Convert amount to ZAR for balance check
      const convertedAmount = convertCurrency(
        Number(amount), 
        selectedCurrency, 
        'ZAR'
      );

      // Check available balance
      if (convertedAmount > balance) {
        throw new Error('Insufficient funds');
      }

      // Show confirmation modal if all validations pass
      setShowModal(true);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    try {
      const paymentData = {
        amount: Number(amount),
        reference: reference.trim(),
        isInstant,
        payment_mode: paymentMethod,
        currency: selectedCurrency,
        recipientInfo: {
          recipientName: recipientInfo.recipientName.trim(),
          accountNumber: recipientInfo.accountNumber.trim(),
          swiftCode: recipientInfo.swiftCode.trim(),
          bankName: recipientInfo.bankName.trim()
        }
      };

      await makePayment(
        paymentData.amount,
        paymentData.reference,
        paymentData.isInstant,
        paymentData.paymentMethod,
        paymentData.recipientInfo,
        paymentData.currency
      );

      // Refresh user data after successful payment
      await fetchUserData();
      await fetchFinancialData();
      
      setShowModal(false);
    } catch (error) {
      setError(error.message);
      setShowModal(false);
    }
  };

  const isValidAmount = () => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum)) return false;

    const totalAmount = amountNum + (isInstant ? amountNum * 0.005 : 0);
    const amountInZAR = convertCurrency(totalAmount, selectedCurrency, 'ZAR');
    return amountInZAR <= balance;
  };

  const calculateTotal = () => {
    const baseAmount = parseFloat(amount) || 0;
    return isInstant ? baseAmount * 1.005 : baseAmount;
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <div className="space-y-4">
        {/* Recipient Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Recipient Details</h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="recipientName" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                id="recipientName"
                value={recipientInfo.recipientName}
                onChange={(e) => setRecipientInfo({...recipientInfo, recipientName: e.target.value})}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700">
                Account Number
              </label>
              <input
                type="text"
                id="accountNumber"
                value={recipientInfo.accountNumber}
                onChange={(e) => setRecipientInfo({...recipientInfo, accountNumber: e.target.value})}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                pattern="[A-Z0-9]{8,34}"
                title="8-34 alphanumeric characters"
                required
              />
            </div>

            <div>
              <label htmlFor="swiftCode" className="block text-sm font-medium text-gray-700">
                SWIFT/BIC Code
              </label>
              <input
                type="text"
                id="swiftCode"
                value={recipientInfo.swiftCode}
                onChange={(e) => setRecipientInfo({...recipientInfo, swiftCode: e.target.value})}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                pattern="[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?"
                title="Valid SWIFT/BIC code (e.g., AAAABBCCDDD)"
                required
              />
            </div>

            <div>
              <label htmlFor="bankName" className="block text-sm font-medium text-gray-700">
                Bank Name
              </label>
              <input
                type="text"
                id="bankName"
                value={recipientInfo.bankName}
                onChange={(e) => setRecipientInfo({...recipientInfo, bankName: e.target.value})}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Payment Details</h3>

          <div className="space-y-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                Amount ({selectedCurrency})
              </label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                step="0.01"
                min="0.01"
                required
              />
            </div>

            <div>
              <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">
                Payment Method
              </label>
              <select
                id="paymentMethod"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              >
                <option value="SWIFT">SWIFT Transfer</option>
                <option value="SEPA">SEPA Transfer</option>
                <option value="DOMESTIC">Domestic Transfer</option>
              </select>
            </div>

            <div>
              <label htmlFor="reference" className="block text-sm font-medium text-gray-700">
                Payment Reference
              </label>
              <input
                type="text"
                id="reference"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                maxLength="140"
              />
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="instant"
                  type="checkbox"
                  checked={isInstant}
                  onChange={(e) => setIsInstant(e.target.checked)}
                  className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="instant" className="font-medium text-gray-700">
                  Instant Payment (+0.5% fee)
                </label>
                <p className="text-gray-500">Guaranteed within 2 hours</p>
              </div>
            </div>

            {amount && (
              <div className="text-lg font-semibold">
                Total Amount: {selectedCurrency} {calculateTotal().toFixed(2)}
              </div>
            )}
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isValidAmount() || isLoading}
          className={`w-full py-3 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors
            ${isValidAmount() && !isLoading 
              ? 'bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500'
              : 'bg-gray-400 cursor-not-allowed'}`}
        >
          {isLoading ? 'Processing...' : 'Review Payment'}
        </button>
      </div>

      <PaymentModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirmPayment}
        amount={parseFloat(amount) || 0}
        reference={reference}
        isInstant={isInstant}
        selectedCurrency={selectedCurrency}
        paymentMethod={paymentMethod}
        recipientInfo={recipientInfo}
      />
    </form>
  );
}

export default PaymentForm;