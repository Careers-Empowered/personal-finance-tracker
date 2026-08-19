import { TransactionType } from '@prisma/client';

export interface CreateTransactionDTO {
  accountId: string;
  categoryId: string;
  subcategoryId?: string;
  amount: number;
  type: TransactionType;
  date?: string;
  title: string;
}

export interface UpdateTransactionDTO {
  accountId?: string;
  categoryId?: string;
  subcategoryId?: string;
  amount?: number;
  type?: TransactionType;
  date?: string;
  title?: string;
}

export interface TransactionFilterQuery {
  type?: TransactionType | 'ALL';
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  accountId?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export interface TransactionSummaryResponse {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  incomeCount: number;
  expenseCount: number;
}
