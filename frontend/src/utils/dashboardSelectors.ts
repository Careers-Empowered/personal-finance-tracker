import type {
  Account,
  CategorySpending,
  DashboardData,
  SummaryData,
  Transaction,
  TrendDataPoint,
} from "../types/dashboard";

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface DashboardViewData {
  selectedAccount?: Account;
  visibleAccounts: Account[];
  transactions: Transaction[];
  dailyTrend: TrendDataPoint[];
  monthlyTrend: TrendDataPoint[];
  summary: SummaryData;
  spendingByCategory: CategorySpending[];
}

const isDateInRange = (date: string, range?: DateRange | null) =>
  !range || (date >= range.startDate && date <= range.endDate);

const isMonthInRange = (date: string, range?: DateRange | null) =>
  !range ||
  (date >= range.startDate.slice(0, 7) && date <= range.endDate.slice(0, 7));

export const isValidDateRange = (range: DateRange) =>
  Boolean(range.startDate && range.endDate && range.startDate <= range.endDate);

export const createSummary = (transactions: Transaction[]): SummaryData => {
  const income = transactions
    .filter(({ type }) => type === "income")
    .reduce((total, { amount }) => total + amount, 0);
  const expenses = transactions
    .filter(({ type }) => type === "expense")
    .reduce((total, { amount }) => total + amount, 0);

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
      totals.set(category, (totals.get(category) ?? 0) + amount);
    });

  return [...totals.entries()].map(([category, amount]) => ({
    category,
    amount,
  }));
};

export const splitIntoSixPeriods = (
  transactions: Transaction[],
  startDate: string,
  endDate: string,
): TrendDataPoint[] => {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  const MS_PER_DAY = 1000 * 60 * 60 * 24;

  const totalDays =
    Math.floor((end.getTime() - start.getTime()) / MS_PER_DAY) + 1;

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(date);

  return Array.from({ length: 6 }, (_, index) => {
    const periodStartDay = Math.floor((index * totalDays) / 6);

    const periodEndDay =
      index === 5
        ? totalDays - 1
        : Math.floor(((index + 1) * totalDays) / 6) - 1;

    const periodStart = new Date(start);
    periodStart.setDate(start.getDate() + periodStartDay);

    const periodEnd = new Date(start);
    periodEnd.setDate(start.getDate() + periodEndDay);

    const periodTransactions = transactions.filter((transaction) => {
      const transactionDate = new Date(
        `${transaction.date}T00:00:00`,
      );

      return (
        transactionDate >= periodStart &&
        transactionDate <= periodEnd
      );
    });

    const income = periodTransactions
      .filter(({ type }) => type === "income")
      .reduce((total, { amount }) => total + amount, 0);

    const expenses = periodTransactions
      .filter(({ type }) => type === "expense")
      .reduce((total, { amount }) => total + amount, 0);

    return {
      date: startDate,
      label: `${formatDate(periodStart)}–${formatDate(periodEnd)}`,
      income,
      expenses,
      balance: income - expenses,
    };
  });
};

export const createDashboardView = (
  data: DashboardData,
  selectedAccountId: string,
  range?: DateRange | null,
): DashboardViewData => {
  const selectedAccount = data.accounts.find(
    (account) => account.id === selectedAccountId,
  );
  const accountData = selectedAccount?.dashboard ?? data;
  const accountTransactions = selectedAccount
    ? data.transactions.filter(
        (transaction) => transaction.accountId === selectedAccount.id,
      )
    : data.transactions;
  const transactions = accountTransactions.filter((transaction) =>
    isDateInRange(transaction.date, range),
  );
const dailyTrend = accountData.dailyTrend.filter((point) =>
  isDateInRange(point.date, range),
);

const monthlyTrend = accountData.monthlyTrend.filter((point) =>
  isMonthInRange(point.date, range),
);

const customRangeTrend =
  range && isValidDateRange(range)
    ? splitIntoSixPeriods(
        transactions,
        range.startDate,
        range.endDate,
      )
    : monthlyTrend;

return {
  selectedAccount,
  visibleAccounts: selectedAccount
    ? [selectedAccount]
    : data.accounts,
  transactions,
  dailyTrend,
  monthlyTrend: customRangeTrend,
  summary: range
    ? createSummary(transactions)
    : accountData.monthly,
  spendingByCategory: range
    ? createCategorySpending(transactions)
    : accountData.spendingByCategory,
};
};
