import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import TransactionDisplay from '../TransactionDisplay';
import { Transaction } from '../types';
import { Account } from '../../accounts/types';

// Mock the child component to isolate TransactionDisplay testing
vi.mock('../TransactionEditDelete', () => ({
  default: () => <div data-testid="mock-edit-delete" />,
}));

describe('TransactionDisplay', () => {
  const mockAccounts: Account[] = [
    {
      id: 'acc-1',
      name: 'SBI Account',
      currency: 'INR',
      balance: 99500,
      isPrimary: true,
      userId: 'user-1',
      createdAt: '2026-08-20T00:00:00.000Z',
      updatedAt: '2026-08-20T00:00:00.000Z'
    },
    {
      id: 'acc-2',
      name: 'HDFC Card',
      currency: 'USD',
      balance: -5000,
      isPrimary: false,
      userId: 'user-1',
      createdAt: '2026-08-20T00:00:00.000Z',
      updatedAt: '2026-08-20T00:00:00.000Z'
    },
  ];

  const mockTransactions: Transaction[] = [
    {
      id: 'tx-1',
      accountId: 'acc-1',
      categoryId: 'cat-food',
      subcategoryId: 'sub-rest',
      amount: 1850.50,
      type: 'EXPENSE',
      date: '2024-01-25',
      title: 'Dinner at Green Leaf',
      category: { id: 'cat-food', name: 'Food & Dining', type: 'EXPENSE' },
      subcategory: { id: 'sub-rest', name: 'Restaurants' },
    },
    {
      id: 'tx-2',
      accountId: 'acc-2',
      categoryId: 'cat-salary',
      subcategoryId: 'sub-basic',
      amount: 500,
      type: 'INCOME',
      date: '2024-01-22',
      title: 'Freelance Design',
      category: { id: 'cat-salary', name: 'Salary', type: 'INCOME' },
      subcategory: { id: 'sub-basic', name: 'Basic Salary' },
      importedWithOverride: true,
      overrideNote: 'Overridden because rule mismatch',
    },
  ];

  const defaultProps = {
    transactions: mockTransactions,
    accounts: mockAccounts,
    onSave: vi.fn(),
    onDelete: vi.fn(),
  };

  it('renders the empty state when transaction list is empty', () => {
    render(<TransactionDisplay {...defaultProps} transactions={[]} />);

    expect(screen.getByText('No transactions found')).toBeInTheDocument();
    expect(screen.getByText('Your added income and expenses will appear here.')).toBeInTheDocument();
  });

  it('renders the transactions count and items correctly', () => {
    render(<TransactionDisplay {...defaultProps} />);

    // Header showing count
    expect(screen.getByText('2 transactions')).toBeInTheDocument();

    // Renders titles
    expect(screen.getByText('Dinner at Green Leaf')).toBeInTheDocument();
    expect(screen.getByText('Freelance Design')).toBeInTheDocument();
  });

  it('formats amounts and currency symbols correctly based on account settings', () => {
    render(<TransactionDisplay {...defaultProps} />);

    // Transaction 1: INR account, expense
    expect(screen.getByText('-₹1,850.50')).toBeInTheDocument();

    // Transaction 2: USD account, income
    expect(screen.getByText('+$500.00')).toBeInTheDocument();
  });

  it('renders date, category, subcategory, and account name correctly', () => {
    render(<TransactionDisplay {...defaultProps} />);

    // Check transaction 1 details
    expect(screen.getByText('25 Jan 2024')).toBeInTheDocument();
    expect(screen.getByText('Food & Dining')).toBeInTheDocument();
    expect(screen.getByText('Restaurants')).toBeInTheDocument();
    expect(screen.getByText('SBI Account')).toBeInTheDocument();
  });

  it('opens and closes the import override note modal correctly when eye icon is clicked', async () => {
    const user = userEvent.setup();
    render(<TransactionDisplay {...defaultProps} />);

    // Note button should only show for transaction 2 (importedWithOverride is true)
    const noteButton = screen.getByTitle('View import override note');
    expect(noteButton).toBeInTheDocument();

    // Click to open modal
    await user.click(noteButton);

    // Verify modal title and content
    expect(screen.getByText('Import Override Note')).toBeInTheDocument();
    expect(screen.getByText('Overridden because rule mismatch')).toBeInTheDocument();
    expect(screen.getByText('Added using "Add Anyway"')).toBeInTheDocument();

    // Click close button
    const closeBtn = screen.getByLabelText('Close note');
    await user.click(closeBtn);

    // Modal should close
    expect(screen.queryByText('Import Override Note')).not.toBeInTheDocument();
  });
});