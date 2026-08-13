export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Transaction {
  id: string;
  accountId: string;
  categoryId?: string;
  amount: number;
  type: TransactionType;
  date: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTransactionInput {
  accountId: string;
  categoryId?: string;
  amount: number;
  type: TransactionType;
  date: string;
  description?: string;
}
