import type {
  Category,
  CategoryProvider,
} from './categoryProvider';

const MOCK_CATEGORIES = [
  { id: 'food', name: 'Food & Dining' },
  { id: 'grocery', name: 'Groceries' },
  { id: 'transportation', name: 'Transportation' },
  { id: 'shopping', name: 'Shopping' },
  { id: 'entertainment', name: 'Entertainment' },
  { id: 'healthcare', name: 'Healthcare' },
  { id: 'bills-utilities', name: 'Bills & Utilities' },
  { id: 'salary', name: 'Salary' },
  { id: 'other', name: 'Other' },
];

export class MockCategoryProvider implements CategoryProvider {
  async getCategories(): Promise<Category[]> {
    return MOCK_CATEGORIES;
  }
}