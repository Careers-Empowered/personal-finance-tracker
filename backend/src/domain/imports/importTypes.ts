export interface ImportTransactionInput {
  accountId: string;

  categoryId?: string | null;

  subcategoryId?: string | null;

  amount: number;

  type: "INCOME" | "EXPENSE";

  date: Date | string;

  title: string;

  importId?: string | null;

  importedWithOverride?: boolean;

  overrideNote?: string | null;
}