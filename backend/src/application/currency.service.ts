const FRANKFURTER_API =
  "https://api.frankfurter.dev/v2";

type ExchangeRateResponse = {
  date: string;
  base: string;
  quote: string;
  rate: number;
};

const rateCache = new Map<
  string,
  {
    rate: number;
    expiresAt: number;
  }
>();

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export const currencyService = {
  async getExchangeRate(
    from: string,
    to: string,
  ): Promise<number> {
    const source = from.toUpperCase();
    const target = to.toUpperCase();

    if (source === target) {
      return 1;
    }

    const cacheKey = `${source}_${target}`;

    const cached = rateCache.get(cacheKey);

    if (
      cached &&
      cached.expiresAt > Date.now()
    ) {
      return cached.rate;
    }

    const response = await fetch(
      `${FRANKFURTER_API}/rate/${source}/${target}`,
    );

    if (!response.ok) {
      throw new Error(
        `EXCHANGE_RATE_UNAVAILABLE`,
      );
    }

    const data =
      (await response.json()) as ExchangeRateResponse;

    const rate = Number(data.rate);

    if (!Number.isFinite(rate)) {
      throw new Error(
        `INVALID_EXCHANGE_RATE`,
      );
    }

    rateCache.set(cacheKey, {
      rate,
      expiresAt:
        Date.now() + CACHE_DURATION,
    });

    return rate;
  },

  async convert(
    amount: number,
    from: string,
    to: string,
  ): Promise<number> {
    const rate =
      await this.getExchangeRate(
        from,
        to,
      );

    return amount * rate;
  },
};