// src/components/CurrencySelect.jsx
import React from 'react';
import { useAppContext } from '../context/AppContext';
import { AVAILABLE_CURRENCIES } from '../utils/currencies';

function CurrencySelect() {
  const { selectedCurrency, setSelectedCurrency } = useAppContext();

  return (
    <div className="mb-4">
      <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
        Select Currency
      </label>
      <select
        id="currency"
        value={selectedCurrency}
        onChange={(e) => setSelectedCurrency(e.target.value)}
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
      >
        {AVAILABLE_CURRENCIES.map((currency) => (
          <option key={currency} value={currency}>
            {currency}
          </option>
        ))}
      </select>
    </div>
  );
}

export default CurrencySelect;