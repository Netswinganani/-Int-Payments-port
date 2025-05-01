// src/components/Balance.jsx
import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { convertCurrency } from '../utils/currencies';

function Balance() {
  const { balance, selectedCurrency, totalPayments, globalLimit } = useAppContext();
  const [displayValues, setDisplayValues] = useState({
    balance: 0,
    convertedBalance: 0,
    rate: 1
  });

  useEffect(() => {
    const updateBalance = () => {
      const validBalance = Number(balance) || 0;
      const converted = convertCurrency(validBalance, 'ZAR', selectedCurrency);
      
      setDisplayValues({
        balance: validBalance,
        convertedBalance: converted,
        rate: converted / validBalance || 1
      });
    };

    updateBalance();
  }, [balance, selectedCurrency]);

  const formatCurrency = (value, currency) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Account Overview</h2>
      
      <div className="space-y-4">
        <div className="border-b pb-4">
          <div className="text-3xl font-bold text-green-600">
            {formatCurrency(displayValues.convertedBalance, selectedCurrency)}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {formatCurrency(displayValues.balance, 'ZAR')} ZAR
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Total Sent:</span>
            <span>{formatCurrency(totalPayments, 'ZAR')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Account Limit:</span>
            <span>{formatCurrency(globalLimit, 'ZAR')}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-400">
            <span>Current Rate (ZAR → {selectedCurrency}):</span>
            <span>1 : {displayValues.rate.toFixed(4)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Balance;