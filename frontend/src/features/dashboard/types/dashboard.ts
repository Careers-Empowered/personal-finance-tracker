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
  currency: string;
  income: number;
  expenses: number;
  transactionCount: number;
  dashboard: AccountDashboardData;
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
  description: string;
  category: string;
  amount: number;
  type: "income" | "expense";
}

export interface AccountDashboardData {
  daily: SummaryData;
  monthly: SummaryData;
  spendingByCategory: CategorySpending[];
  monthlyTrend: TrendDataPoint[];
  dailyTrend: TrendDataPoint[];
}

export interface DashboardData {
  daily: SummaryData;
  monthly: SummaryData;
  spendingByCategory: CategorySpending[];
  accounts: Account[];
  monthlyTrend: TrendDataPoint[];
  dailyTrend: TrendDataPoint[];
  transactions: Transaction[];
}
