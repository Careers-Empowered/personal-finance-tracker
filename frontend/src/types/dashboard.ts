export interface SummaryData {
  income: number;
  expenses: number;
  balance: number;
  transactionCount: number;
}

export interface CategorySpending {
  category: string;
  amount: number;
}

export interface Account {
  id: string;
  name: string;
  balance: number;
  convertedBalance: number;
  currency: string;
  isPrimary: boolean;
}

export interface TrendDataPoint {
  date: string;
  income: number;
  expenses: number;
  balance: number;
  label?: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  date: string;
  title: string;
  category: string;
  subcategory: string;
  amount: number;
  type: "income" | "expense";
  currency: string;
}

export interface DashboardData {
  baseCurrency: string;
  accounts: Account[];
  selectedAccount: Account | null;
  summary: SummaryData;
  dailyTrend: TrendDataPoint[];
  monthlyTrend: TrendDataPoint[];
  spendingByCategory: CategorySpending[];
  transactions: Transaction[];
}