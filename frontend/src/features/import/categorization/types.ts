export type TransactionType = "income" | "expense";

export interface CategorizationRule {
  keyword: string;
  category: string;
  type: TransactionType;
}

export interface CategorySuggestion {
  category: string;
  source: "RULE" | "SLM";
  confidence: number;
}