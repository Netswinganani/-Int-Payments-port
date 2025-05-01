// src/utils/currencies.js

/**
 * List of supported currencies
 * TODO: Add more currencies and their symbols
 */
export const AVAILABLE_CURRENCIES = ['USD', 'EUR', 'GBP', 'ZAR', 'LSL', 'NAD'];

/**
 * Mock exchange rates with ZAR as base currency
 * TODO: 
 * - Integrate with real-time exchange rate API
 * - Add rate caching mechanism
 * - Implement rate update intervals
 */
const EXCHANGE_RATES = {
  ZAR: 1,
  USD: 0.053,  // 1 ZAR = 0.053 USD
  EUR: 0.049,  // 1 ZAR = 0.049 EUR
  GBP: 0.042,  // 1 ZAR = 0.042 GBP
  LSL: 1,      // 1:1 peg with ZAR
  NAD: 1,      // 1:1 peg with ZAR
};

/**
 * Convert amount between currencies
 * @param {number} amount - Amount to convert
 * @param {string} fromCurrency - Source currency code
 * @param {string} toCurrency - Target currency code
 * @returns {number} Converted amount
 * 
 * NOTE: All conversions go through ZAR as the base currency
 * Example: USD -> EUR first converts USD to ZAR, then ZAR to EUR
 */
export const convertCurrency = (amount, fromCurrency, toCurrency) => {
  // Convert to ZAR first (if not already in ZAR)
  const amountInZAR = fromCurrency === 'ZAR' 
    ? amount 
    : amount / EXCHANGE_RATES[fromCurrency];
  
  // Convert from ZAR to target currency
  return amountInZAR * EXCHANGE_RATES[toCurrency];
};