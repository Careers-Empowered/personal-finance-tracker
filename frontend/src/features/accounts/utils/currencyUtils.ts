// Fallback rates (used if user is offline or API fails)
export const DEFAULT_RATES: Record<string, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.78,
  INR: 83.9,
  JPY: 147.5,
};

/**
 * Free open-source API endpoint (No API key required)
 */
export async function fetchExchangeRates(): Promise<Record<string, number>> {
  try {
    const response = await fetch("https://open.er-api.com/v6/latest/USD");
    if (!response.ok) throw new Error("Failed to fetch rates");
    const data = await response.json();
    return data.rates; // Returns live rates object: { USD: 1, EUR: 0.92, INR: 83.9, ... }
  } catch (error) {
    console.warn(
      "Could not fetch live exchange rates, using fallback rates:",
      error,
    );
    return DEFAULT_RATES;
  }
}

/**
 * Returns the number of decimal places for a given currency
 */
export function getCurrencyDecimals(currency: string): number {
  return currency === "JPY" ? 0 : 2;
}

/**
 * Rounds an amount based on its currency
 */
export function roundCurrency(amount: number, currency: string): number {
  if (!amount || isNaN(amount)) return 0;
  const decimals = getCurrencyDecimals(currency);
  const factor = Math.pow(10, decimals);
  const rounded = Math.round(amount * factor) / factor;
  return Object.is(rounded, -0) ? 0 : rounded;
}

/**
 * Converts an amount from fromCurrency to toCurrency using current rates
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: Record<string, number> = DEFAULT_RATES,
): number {
  if (!amount || isNaN(amount)) return 0;
  if (fromCurrency === toCurrency) {
    const val = Object.is(amount, -0) ? 0 : amount;
    return roundCurrency(val, toCurrency);
  }

  const fromRate = rates[fromCurrency] || 1.0;
  const toRate = rates[toCurrency] || 1.0;

  // Convert to USD base first, then to target currency
  const amountInUSD = amount / fromRate;
  const converted = amountInUSD * toRate;
  
  return roundCurrency(converted, toCurrency);
}
