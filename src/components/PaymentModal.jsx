import React, { useState } from 'react'; // Import useState from React
import { useAppContext } from '../context/AppContext';
import { convertCurrency } from '../utils/currencies';

/**
 * Payment confirmation modal component
 * Displays payment details and handles final confirmation
 * 
 * @param {Object} props Component props
 * @param {boolean} props.isOpen Controls modal visibility
 * @param {function} props.onClose Handles modal close
 * @param {number} props.amount Payment amount
 * @param {string} props.reference Payment reference
 * @param {boolean} props.isInstant Whether it's an instant payment
 * @param {string} props.selectedCurrency Selected currency code
 * @param {string} props.paymentMethod The chosen payment method
 * @param {Object} props.recipientInfo Recipient's account and bank info
 * 
 * TODO: Add animation for modal open/close
 */
function PaymentModal({
  isOpen,
  onClose,
  amount,
  reference,
  isInstant,
  selectedCurrency,
  paymentMethod,
  recipientInfo,
}) {
  const { balance, makePayment, fetchUserData, fetchFinancialData } = useAppContext();
  const [isProcessing, setIsProcessing] = useState(false);  // State for payment processing status
  const [error, setError] = useState(null);  // State for handling errors

  // Return null if modal is not open
  if (!isOpen) return null;

  // Calculate fees and total payment amount
  const fee = isInstant ? amount * 0.005 : 0;
  const totalAmount = amount + fee;
  const amountInZAR = convertCurrency(totalAmount, selectedCurrency, 'ZAR');
  const remainingBalance = balance - amountInZAR;

  // Confirm payment handler
  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      // Ensure only plain JSON-safe data is passed
      await makePayment(
        amountInZAR,          // Payment amount in ZAR
        reference,            // Reference for the payment
        isInstant,            // Instant payment flag
        paymentMethod,        // Payment method chosen
        { ...recipientInfo }, // Recipient info (avoiding circular refs)
        selectedCurrency      // Selected currency
      );
      // Refresh all data after successful payment
    await Promise.all([
      fetchUserData(),
      fetchFinancialData()
    ]);
      onClose(); // Close modal after successful payment
    } catch (err) {
      console.error("Payment error:", err);
      setError('Payment processing failed. Please try again.'); // Set error message if payment fails
    } finally {
      setIsProcessing(false); // Set processing state to false once the payment attempt is complete
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Confirm Payment</h2>

        <div className="space-y-3 mb-6">
          {/* Amount and fee details */}
          <div className="flex justify-between">
            <span>Amount:</span>
            <span>{selectedCurrency} {Number(amount).toFixed(2)}</span>
          </div>

          {/* Instant payment fee display */}
          {isInstant && (
            <div className="flex justify-between text-blue-600">
              <span>Processing Fee (0.5%):</span>
              <span>{selectedCurrency} {fee.toFixed(2)}</span>
            </div>
          )}

          {/* Total payment amount */}
          <div className="flex justify-between font-bold">
            <span>Total to Pay:</span>
            <span>{selectedCurrency} {totalAmount.toFixed(2)}</span>
          </div>

          {/* Reference (optional) */}
          {reference && (
            <div className="flex justify-between">
              <span>Reference:</span>
              <span>{reference}</span>
            </div>
          )}

          {/* Remaining balance after payment */}
          <div className="flex justify-between text-green-600">
            <span>Remaining Balance:</span>
            <span>ZAR {remainingBalance.toFixed(2)}</span>
          </div>
        </div>

        {/* Error message */}
        {error && <div className="text-red-600 mb-4">{error}</div>}

        {/* Action buttons */}
        <div className="flex space-x-4">
          <button
            onClick={onClose}  // Close modal on cancel
            className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}  // Proceed with the payment
            className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            disabled={isProcessing}  // Disable button while processing
          >
            {isProcessing ? 'Processing...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentModal;
