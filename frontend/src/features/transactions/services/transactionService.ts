import type { Transaction } from '../types';

const LOCAL_STORAGE_KEY = 'personal_finance_transactions';

const INITIAL_MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_1',
    date: '2026-08-14',
    title: 'Green tree restaurant',
    amount: 850,
    type: 'expense',
    account: 'Checking Account',
    category: '',
    notes: 'Team dinner',
    suggestedCategory: {
      categoryId: 'food',
      categoryName: 'Food & Dining',
      source: 'model',
      confidence: 0.92,
    },
    suggestionDecision: null,
  },
  {
    id: 'tx_2',
    date: '2026-08-13',
    title: 'Uber Ride',
    amount: 450,
    type: 'expense',
    account: 'Credit Card',
    category: '',
    notes: 'Work commute',
    suggestedCategory: {
      categoryId: 'transportation',
      categoryName: 'Transportation',
      source: 'RULE',
      confidence: 1.0,
    },
    suggestionDecision: null,
  },
  {
    id: 'tx_3',
    date: '2026-08-12',
    title: 'Reliance Fresh',
    amount: 2200,
    type: 'expense',
    account: 'Checking Account',
    category: '',
    notes: 'Weekly veggies',
    suggestedCategory: {
      categoryId: 'grocery',
      categoryName: 'Groceries',
      source: 'model',
      confidence: 0.85,
    },
    suggestionDecision: null,
  },
  {
    id: 'tx_4',
    date: '2026-08-01',
    title: 'Monthly Salary',
    amount: 75000,
    type: 'income',
    account: 'Savings Account',
    category: 'Salary',
    notes: 'Direct deposit',
    suggestedCategory: null,
    suggestionDecision: null,
  },
  {
    id: 'tx_5',
    date: '2026-08-10',
    title: 'Netflix Subscription',
    amount: 499,
    type: 'expense',
    account: 'Credit Card',
    category: 'Bills & Utilities',
    notes: 'Monthly billing',
    suggestedCategory: null,
    suggestionDecision: null,
  },
];

export const getTransactions = (): Transaction[] => {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_TRANSACTIONS));
    return INITIAL_MOCK_TRANSACTIONS;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error('Failed to parse transactions from local storage', e);
    return INITIAL_MOCK_TRANSACTIONS;
  }
};

export const getTransactionById = (id: string): Transaction | undefined => {
  const transactions = getTransactions();
  return transactions.find((tx) => tx.id === id);
};

export const updateTransaction = (updatedTx: Transaction): void => {
  const transactions = getTransactions();
  const index = transactions.findIndex((tx) => tx.id === updatedTx.id);
  if (index !== -1) {
    transactions[index] = updatedTx;
  } else {
    transactions.push(updatedTx);
  }
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(transactions));
};

export const resetMockData = (): Transaction[] => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_TRANSACTIONS));
  return INITIAL_MOCK_TRANSACTIONS;
};
