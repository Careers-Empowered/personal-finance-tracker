export interface DashboardTransaction {
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

export interface DashboardAccount {
  id: string;
  name: string;
  currency: string;
  balance: number;
  isPrimary: boolean;
}

export interface DashboardSummary {
  income: number;
  expenses: number;
  balance: number;
  transactionCount: number;
}

export interface DashboardTrendPoint {
  date: string;
  income: number;
  expenses: number;
  balance: number;
}

export interface DashboardCategorySpending {
  category: string;
  amount: number;
}

export interface DashboardResponse {
  accounts: DashboardAccount[];
  selectedAccount: DashboardAccount | null;
  summary: DashboardSummary;
  dailyTrend: DashboardTrendPoint[];
  monthlyTrend: DashboardTrendPoint[];
  spendingByCategory: DashboardCategorySpending[];
  transactions: DashboardTransaction[];
}