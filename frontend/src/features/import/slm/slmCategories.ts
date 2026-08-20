export type SLMCategoryType = 'expense' | 'income';

export interface SLMCategory {
  id: string;
  name: string;
  type: SLMCategoryType;
}

export const SLM_CATEGORIES: SLMCategory[] = [
  // Expense categories
  {
    id: 'food-dining',
    name: 'Food & Dining',
    type: 'expense',
  },
  {
    id: 'transportation',
    name: 'Transportation',
    type: 'expense',
  },
  {
    id: 'housing',
    name: 'Housing',
    type: 'expense',
  },
  {
    id: 'shopping',
    name: 'Shopping',
    type: 'expense',
  },
  {
    id: 'health-medical',
    name: 'Health & Medical',
    type: 'expense',
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    type: 'expense',
  },

  // Income categories
  {
    id: 'salary',
    name: 'Salary',
    type: 'income',
  },
  {
    id: 'freelance',
    name: 'Freelance',
    type: 'income',
  },
  {
    id: 'business',
    name: 'Business',
    type: 'income',
  },
  {
    id: 'investments',
    name: 'Investments',
    type: 'income',
  },
  {
  id: 'education',
  name: 'Education',
  type: 'expense',
},
{
  id: 'bills-utilities',
  name: 'Bills & Utilities',
  type: 'expense',
},
{
  id: 'personal-care',
  name: 'Personal Care',
  type: 'expense',
},
{
  id: 'insurance',
  name: 'Insurance',
  type: 'expense',
},
];