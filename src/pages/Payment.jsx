import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { paymentValidationSchema } from '../utils/validation';
import { makePayment } from '../utils/api';
import Balance from '../components/Balance';
import CurrencySelect from '../components/CurrencySelect';
import PaymentModal from '../components/PaymentModal';
import { useAppContext } from '../context/AppContext';
import { convertCurrency } from '../utils/currencies';

function Payment() {
  const [paymentMode, setPaymentMode] = useState('saved');
  const [showModal, setShowModal] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [insufficientFunds, setInsufficientFunds] = useState(false);
  //console.log(user.accountNumber)
  const { savedRecipients = [], balance, selectedCurrency, user } = useAppContext();

  const handleSubmit = (values) => {
    const convertedAmount = convertCurrency(Number(values.amount), selectedCurrency, 'ZAR');

    if (convertedAmount > balance) {
      setInsufficientFunds(true);
      return;
    }

    setInsufficientFunds(false);
    setPaymentData({ ...values, currency: selectedCurrency });
    setShowModal(true);
  };

  const handlePaymentConfirm = async () => {
    try {
      const convertedAmount = convertCurrency(
        Number(paymentData.amount),
        paymentData.currency,
        'ZAR'
      );
  
      const finalData = {
        amount: convertedAmount,
        currency: 'ZAR',
        reference: paymentData.reference,
        isInstant: paymentData.isInstant,
      };
  
      if (paymentData.mode === 'saved') {
        const saved = savedRecipients.find(r => r.id === paymentData.recipient);
        finalData.recipientId = saved.id;
        finalData.recipientName = saved.name;
        finalData.recipientAccount = saved.account;
        finalData.swiftCode = saved.swiftCode;
        finalData.bankName = saved.bank;
      } else {
        finalData.recipientName = paymentData.recipientName;
        finalData.recipientAccount = paymentData.recipientAccount;
        finalData.swiftCode = paymentData.swiftCode;
        finalData.bankName = paymentData.provider;
      }
      
      const response = await makePayment(finalData);
      if (response.success) {
        setShowModal(false);
      }
    } catch (error) {
      console.error('Payment failed:', error);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow">
        <h2 className="text-3xl font-bold text-center mb-8">Make Payment</h2>

        {user && (
  <div className="text-xl font-semibold text-gray-800 mb-4">
    Welcome, {user.username}
    <div className="text-sm text-gray-600 mt-1">
    Account Number: {user.accountNumber || 'N/A'}
      
    </div>
  </div>
)}
        <Balance />
        <CurrencySelect />

        <div className="mb-6">
          <div className="flex justify-center space-x-4">
            <button
              className={`px-4 py-2 rounded-lg ${paymentMode === 'saved' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              onClick={() => setPaymentMode('saved')}
            >
              Select Recipient
            </button>
            <button
              className={`px-4 py-2 rounded-lg ${paymentMode === 'new' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              onClick={() => setPaymentMode('new')}
            >
              Add New Recipient
            </button>
          </div>
        </div>

        <Formik
          enableReinitialize
          initialValues={{
            recipient: '',
            amount: '',
            reference: '',
            isInstant: false,
            swiftCode: '',
            mode: paymentMode || 'new',
            provider: '',
            recipientName: '',
            recipientAccount: '',
            saveRecipient: false,
            paymentMethod: '', // Add this line
          }}
          // validationSchema={paymentValidationSchema}
          onSubmit={handleSubmit}
        >
          {({ values }) => {
            const converted = convertCurrency(Number(values.amount || 0), selectedCurrency, 'ZAR');
            const maxCurrencyBalance = convertCurrency(balance, 'ZAR', selectedCurrency);

            useEffect(() => {
              setInsufficientFunds(converted > balance);
            }, [converted, balance]);

            return (
              <Form className="space-y-6">
                {paymentMode === 'saved' ? (
                  savedRecipients.length > 0 ? (
                    <div>
                      <label htmlFor="recipient" className="block text-sm font-medium text-gray-700">
                        Select Saved Recipient
                      </label>
                      <Field
                        as="select"
                        name="recipient"
                        id="recipient"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
                      >
                        <option value="">-- Select Recipient --</option>
                        {savedRecipients.map((recip) => (
                          <option key={recip.id} value={recip.id}>
                            {recip.name} ({recip.account})
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage name="recipient" component="div" className="text-red-600 text-sm" />
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No saved recipients available.</p>
                  )
                ) : (
                  <>
                    <div>
                      <label htmlFor="recipientName" className="block text-sm font-medium text-gray-700">
                        Recipient Name
                      </label>
                      <Field
                        type="text"
                        name="recipientName"
                        id="recipientName"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
                        placeholder="Full Name"
                      />
                      <ErrorMessage name="recipientName" component="div" className="text-red-600 text-sm" />
                    </div>

                    <div>
                      <label htmlFor="recipientAccount" className="block text-sm font-medium text-gray-700">
                        Recipient Account Number
                      </label>
                      <Field
                        type="text"
                        name="recipientAccount"
                        id="recipientAccount"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
                        placeholder="10-16 digit account number"
                      />
                      <ErrorMessage name="recipientAccount" component="div" className="text-red-600 text-sm" />
                    </div>

                    <div>
                      <label htmlFor="provider" className="block text-sm font-medium text-gray-700">
                        Bank / Provider
                      </label>
                      <Field
                        type="text"
                        name="provider"
                        id="provider"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
                      />
                      <ErrorMessage name="provider" component="div" className="text-red-600 text-sm" />
                    </div>

                    <div>
                      <label htmlFor="swiftCode" className="block text-sm font-medium text-gray-700">
                        SWIFT Code
                      </label>
                      <Field
                        type="text"
                        name="swiftCode"
                        id="swiftCode"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
                        placeholder="e.g., ABSAZAJJXXX"
                      />
                      <ErrorMessage name="swiftCode" component="div" className="text-red-600 text-sm" />
                    </div>
                  </>
                )}

                <div>
                <div>
  <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">
    Payment Method
  </label>
  <Field
    as="select"
    name="paymentMethod"
    id="paymentMethod"
    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
  >
    <option value="">-- Select Payment Method --</option>
    <option value="SWIFT">SWIFT</option>
    <option value="SEPA">SEPA</option>
    <option value="Card">Card</option>
  </Field>
  <ErrorMessage name="paymentMethod" component="div" className="text-red-600 text-sm" />
</div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                    Payment Amount ({selectedCurrency})
                  </label>
                  <Field
                    type="number"
                    id="amount"
                    name="amount"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
                    placeholder={`Max: ${maxCurrencyBalance.toFixed(2)} ${selectedCurrency}`}
                  />
                  <ErrorMessage name="amount" component="div" className="text-red-600 text-sm" />
                  {insufficientFunds && (
                    <p className="text-sm text-red-500 mt-1">
                      You don’t have enough funds. Available: {maxCurrencyBalance.toFixed(2)} {selectedCurrency}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="reference" className="block text-sm font-medium text-gray-700">
                    Reference (Optional)
                  </label>
                  <Field
                    type="text"
                    id="reference"
                    name="reference"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
                    placeholder="e.g., Rent, Invoice #123"
                  />
                  <ErrorMessage name="reference" component="div" className="text-red-600 text-sm" />
                </div>

                <div className="flex items-center">
                  <Field
                    type="checkbox"
                    id="isInstant"
                    name="isInstant"
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                  <label htmlFor="isInstant" className="ml-2 text-sm font-medium text-gray-700">
                    Instant Payment (0.5% fee)
                  </label>
                </div>

                <div className="flex justify-center">
                  <button
                    type="submit"
                    disabled={insufficientFunds}
                    className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                      insufficientFunds
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    Make Payment
                  </button>
                </div>
              </Form>
            );
          }}
        </Formik>
      </div>

      {/* Confirmation Modal */}
      {showModal && paymentData && (() => {
        const recipientInfo =
          paymentData.mode === 'saved'
            ? savedRecipients.find(r => r.id === paymentData.recipient)
            : {
                recipientName: paymentData.recipientName,
                accountNumber: paymentData.recipientAccount,
                swiftCode: paymentData.swiftCode,
                bankName: paymentData.provider,
              };

        return (
          <PaymentModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            amount={Number(paymentData.amount)}
            reference={paymentData.reference}
            isInstant={paymentData.isInstant}
            selectedCurrency={paymentData.currency}
            recipientInfo={recipientInfo}
          />
        );
      })()}
    </div>
  );
}

export default Payment;
