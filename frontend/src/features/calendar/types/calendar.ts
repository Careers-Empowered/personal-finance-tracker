export type TransactionType = "income" | "expense";

export interface CalendarTransaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  date: string;
  account: string;
  category: string;
}

export interface CalendarDay {
  date: Date;
  transactions: CalendarTransaction[];
}