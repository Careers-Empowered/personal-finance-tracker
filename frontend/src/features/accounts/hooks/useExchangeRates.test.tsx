import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, Mock } from 'vitest';
import { useExchangeRates } from './useExchangeRates';
import * as currencyUtils from '../utils/currencyUtils';

vi.mock('../utils/currencyUtils', async () => {
  const actual = await vi.importActual('../utils/currencyUtils');
  return {
    ...actual,
    fetchExchangeRates: vi.fn(),
  };
});

describe('useExchangeRates', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('initially returns DEFAULT_RATES and loading true, then updates with fetched rates', async () => {
    const mockRates = { USD: 1, EUR: 0.85, GBP: 0.75 };
    (currencyUtils.fetchExchangeRates as Mock).mockResolvedValue(mockRates);

    const { result } = renderHook(() => useExchangeRates());

    expect(result.current.loading).toBe(true);
    expect(result.current.rates).toEqual(currencyUtils.DEFAULT_RATES);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.rates).toEqual(mockRates);
  });

  it('returns DEFAULT_RATES and loading false if fetch fails', async () => {
    (currencyUtils.fetchExchangeRates as Mock).mockRejectedValue(new Error('Failed API call'));

    const { result } = renderHook(() => useExchangeRates());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.rates).toEqual(currencyUtils.DEFAULT_RATES);
  });
});
