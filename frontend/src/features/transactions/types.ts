export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Transaction {
  id: string;
  accountId: string;
  categoryId: string;
  subcategoryId: string;
  amount: number;
  type: TransactionType;
  date: string;
  title: string;
  createdAt?: string;
  updatedAt?: string;

  // Relation objects
  account?: {
    id: string;
    name: string;
  };
  category?: {
    id: string;
    name: string;
    type: string;
    icon?: string | null;
    color?: string | null;
  };
  subcategory?: {
    id: string;
    name: string;
  } | null;
}

export interface CreateTransactionInput {
  id?: string;
  accountId: string;
  categoryId: string;
  subcategoryId: string;
  amount: number;
  type: TransactionType;
  date: string;
  title: string;
}

