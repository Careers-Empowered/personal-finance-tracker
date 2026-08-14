export interface TransactionCategorySuggestion {
  categoryId: string;
  categoryName: string;
  source: 'model' | 'RULE';
  confidence?: number;
}

export interface Transaction {
  id: string;
  date: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  account: string;
  category?: string;
  notes?: string;
  suggestedCategory?: TransactionCategorySuggestion | null;
  suggestionDecision?: 'Accepted' | 'Overridden' | null;
}
