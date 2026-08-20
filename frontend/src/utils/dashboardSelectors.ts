import type {
  CategorySpending,
  SummaryData,
  Transaction,
  TrendDataPoint,
} from "../types/dashboard";

export interface DateRange {
  startDate: string;
  endDate: string;
}

export const isValidDateRange = (
  range: DateRange,
): boolean => {
  return Boolean(
    range.startDate &&
      range.endDate &&
      range.startDate <= range.endDate,
  );
};

export const createSummary = (
  transactions: Transaction[],
): SummaryData => {
  const income = transactions
    .filter(({ type }) => type === "income")
    .reduce(
      (total, { amount }) => total + amount,
      0,
    );

  const expenses = transactions
    .filter(({ type }) => type === "expense")
    .reduce(
      (total, { amount }) => total + amount,
      0,
    );

  return {
    income,
    expenses,
    balance: income - expenses,
    transactionCount: transactions.length,
  };
};

export const createCategorySpending = (
  transactions: Transaction[],
): CategorySpending[] => {
  const totals = new Map<string, number>();

  transactions
    .filter(({ type }) => type === "expense")
    .forEach(({ category, amount }) => {
      totals.set(
        category,
        (totals.get(category) ?? 0) + amount,
      );
    });

  return [...totals.entries()]
    .map(([category, amount]) => ({
      category,
      amount,
    }))
    .sort(
      (a, b) => b.amount - a.amount,
    );
};

export const splitIntoSixPeriods = (
  transactions: Transaction[],
  startDate: string,
  endDate: string,
): TrendDataPoint[] => {
  const start = new Date(
    `${startDate}T00:00:00`,
  );

  const end = new Date(
    `${endDate}T00:00:00`,
  );

  const MS_PER_DAY =
    1000 * 60 * 60 * 24;

  const totalDays =
    Math.floor(
      (end.getTime() - start.getTime()) /
        MS_PER_DAY,
    ) + 1;

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(date);

  return Array.from(
    { length: 6 },
    (_, index) => {
      const periodStartDay =
        Math.floor(
          (index * totalDays) / 6,
        );

      const periodEndDay =
        index === 5
          ? totalDays - 1
          : Math.floor(
              ((index + 1) *
                totalDays) /
                6,
            ) - 1;

      const periodStart =
        new Date(start);

      periodStart.setDate(
        start.getDate() +
          periodStartDay,
      );

      const periodEnd =
        new Date(start);

      periodEnd.setDate(
        start.getDate() +
          periodEndDay,
      );

      const periodTransactions =
        transactions.filter(
          (transaction) => {
            const transactionDate = new Date(
  `${transaction.date.slice(0, 10)}T00:00:00`,
);

            return (
              transactionDate >=
                periodStart &&
              transactionDate <=
                periodEnd
            );
          },
        );

      const income =
        periodTransactions
          .filter(
            ({ type }) =>
              type === "income",
          )
          .reduce(
            (total, { amount }) =>
              total + amount,
            0,
          );

      const expenses =
        periodTransactions
          .filter(
            ({ type }) =>
              type === "expense",
          )
          .reduce(
            (total, { amount }) =>
              total + amount,
            0,
          );

      return {
        date: startDate,
        label: `${formatDate(
          periodStart,
        )}–${formatDate(
          periodEnd,
        )}`,
        income,
        expenses,
        balance:
          income - expenses,
      };
    },
  );
};