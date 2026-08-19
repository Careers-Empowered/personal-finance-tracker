/**
 * ISO Currency Code to Currency Symbol Mapping Utility
 */
const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  AUD: 'A$',
  CAD: 'C$',
  SGD: 'S$',
  AED: 'AED',
  SAR: 'SAR',
  CNY: '¥',
  CHF: 'CHF',
};

/**
 * Returns currency symbol for a given ISO currency code (defaults to ₹)
 */
export const getCurrencySymbol = (currencyCode?: string): string => {
  if (!currencyCode) return '₹';
  const code = currencyCode.trim().toUpperCase();
  return CURRENCY_SYMBOLS[code] || code;
};

/**
 * Formats numeric amount with 2 decimal places using Indian/Local number format
 */
export const formatAmount = (amount: number, locale = 'en-IN'): string => {
  return amount.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
