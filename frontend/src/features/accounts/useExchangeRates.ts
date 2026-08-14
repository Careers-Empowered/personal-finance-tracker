import { useState, useEffect } from "react";
import { fetchExchangeRates, DEFAULT_RATES } from "./currencyUtils";

export function useExchangeRates() {
  const [rates, setRates] = useState<Record<string, number>>(DEFAULT_RATES);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchExchangeRates()
      .then((liveRates) => {
        setRates(liveRates);
        setLoading(false);
      })
      .catch(() => {
        setRates(DEFAULT_RATES);
        setLoading(false);
      });
  }, []);

  return { rates, loading };
}
