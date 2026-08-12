export type SuggestionSource = 'model';

export interface CategorySuggestion {
  categoryId: string;
  categoryName: string;
  source: SuggestionSource;
  confidence?: number;
}