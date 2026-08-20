import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { fetchExchangeRates, convertCurrency, DEFAULT_RATES } from './currencyUtils';

describe('currencyUtils', () => {
  describe('convertCurrency', () => {
    it('converts correctly when from and to currencies are the same', () => {
      expect(convertCurrency(100, 'USD', 'USD')).toBe(100);
      expect(convertCurrency(0, 'USD', 'USD')).toBe(0);
      expect(convertCurrency(-50, 'EUR', 'EUR')).toBe(-50);
    });

    it('returns 0 for invalid or 0 amounts', () => {
      expect(convertCurrency(0, 'USD', 'EUR')).toBe(0);
      expect(convertCurrency(NaN, 'USD', 'EUR')).toBe(0);
    });

    it('converts correctly using provided rates', () => {
      const customRates = { USD: 1.0, EUR: 0.9, GBP: 0.8 };
      expect(convertCurrency(100, 'EUR', 'GBP', customRates)).toBe(88.89);
    });

    it('falls back to DEFAULT_RATES if no rates provided', () => {
      expect(convertCurrency(100, 'EUR', 'GBP')).toBe(84.78);
    });

    it('defaults missing currencies to rate 1.0', () => {
      const customRates = { USD: 1.0 };
      expect(convertCurrency(100, 'UNKNOWN1', 'UNKNOWN2', customRates)).toBe(100);
    });
  });

  describe('fetchExchangeRates', () => {
    const originalFetch = global.fetch;

    beforeEach(() => {
      global.fetch = vi.fn();
    });

    afterEach(() => {
      global.fetch = originalFetch;
    });

    it('returns rates on successful fetch', async () => {
      const mockRates = { USD: 1, EUR: 0.85 };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ rates: mockRates }),
      });

      const rates = await fetchExchangeRates();
      expect(rates).toEqual(mockRates);
      expect(global.fetch).toHaveBeenCalledWith('https://open.er-api.com/v6/latest/USD');
    });

    it('returns DEFAULT_RATES on fetch failure', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));
      const rates = await fetchExchangeRates();
      expect(rates).toEqual(DEFAULT_RATES);
    });

    it('returns DEFAULT_RATES on non-ok response', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
      });
      const rates = await fetchExchangeRates();
      expect(rates).toEqual(DEFAULT_RATES);
    });
  });
});
