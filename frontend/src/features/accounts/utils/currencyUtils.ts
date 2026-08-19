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
    return Math.round(val * 100) / 100;
  }

  const fromRate = rates[fromCurrency] || 1.0;
  const toRate = rates[toCurrency] || 1.0;

  // Convert to USD base first, then to target currency
  const amountInUSD = amount / fromRate;
  const converted = amountInUSD * toRate;
  const rounded = Math.round(converted * 100) / 100;

  return Object.is(rounded, -0) ? 0 : rounded;
}

