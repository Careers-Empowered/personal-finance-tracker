import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import TransactionFilter from '../TransactionFilter';
import { Transaction } from '../types';
import { Account } from '../../accounts/types';

describe('TransactionFilter', () => {
  const mockAccounts: Account[] = [
    {
      id: 'acc-1',
      name: 'SBI Account',
      currency: 'INR',
      balance: 99500,
      isPrimary: true,
      userId: 'dummy-user-id',
      createdAt: '2026-08-20T00:00:00.000Z',
      updatedAt: '2026-08-20T00:00:00.000Z'
    },
    {
      id: 'acc-2',
      name: 'HDFC Card',
      currency: 'INR',
      balance: -5000,
      isPrimary: false,
      userId: 'dummy-user-id',
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
      amount: 1850,
      type: 'EXPENSE',
      date: '2024-01-25',
      title: 'Dinner at Green Leaf',
      category: { id: 'cat-food', name: 'Food & Dining', type: 'EXPENSE' },
      subcategory: { id: 'sub-rest', name: 'Restaurants' },
    },
    {
      id: 'tx-2',
      accountId: 'acc-1',
      categoryId: 'cat-salary',
      subcategoryId: 'sub-basic',
      amount: 85000,
      type: 'INCOME',
      date: '2024-01-22',
      title: 'Monthly Salary',
      category: { id: 'cat-salary', name: 'Salary', type: 'INCOME' },
      subcategory: { id: 'sub-basic', name: 'Basic Salary' },
    },
    {
      id: 'tx-3',
      accountId: 'acc-2',
      categoryId: 'cat-transport',
      subcategoryId: 'sub-uber',
      amount: 450,
      type: 'EXPENSE',
      date: '2024-01-16',
      title: 'Uber Cab ride',
      category: { id: 'cat-transport', name: 'Transportation', type: 'EXPENSE' },
      subcategory: { id: 'sub-uber', name: 'Taxi & Ride Share' },
    },
  ];

  const defaultProps = {
    transactions: mockTransactions,
    accounts: mockAccounts,
    onFilterChange: vi.fn(),
  };

  it('renders filter elements correctly', () => {
    render(<TransactionFilter {...defaultProps} />);

    // Check Type buttons
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Income')).toBeInTheDocument();
    expect(screen.getByText('Expense')).toBeInTheDocument();

    // Check Date input
    expect(screen.getByLabelText('Filter transactions by date')).toBeInTheDocument();

    // Check Category dropdown options
    const categorySelect = screen.getByRole('combobox', { name: '' }) as HTMLSelectElement;
    expect(categorySelect).toBeInTheDocument();

    // Check Account dropdown options
    const accountSelect = screen.getByLabelText('Filter transactions by account');
    expect(accountSelect).toBeInTheDocument();
  });

  it('filters by transaction type (Income / Expense / All)', async () => {
    const user = userEvent.setup();
    const onFilterChangeMock = vi.fn();

    render(<TransactionFilter {...defaultProps} onFilterChange={onFilterChangeMock} />);

    // 1. Click "Income" button
    await user.click(screen.getByRole('button', { name: 'Income' }));
    // Expect only the income transaction (tx-2)
    expect(onFilterChangeMock).toHaveBeenLastCalledWith([mockTransactions[1]]);

    // 2. Click "Expense" button
    await user.click(screen.getByRole('button', { name: 'Expense' }));
    // Expect the expense transactions (tx-1 and tx-3)
    expect(onFilterChangeMock).toHaveBeenLastCalledWith([mockTransactions[0], mockTransactions[2]]);

    // 3. Click "All" button
    await user.click(screen.getByRole('button', { name: 'All' }));
    // Expect all transactions
    expect(onFilterChangeMock).toHaveBeenLastCalledWith(mockTransactions);
  });

  it('filters by date and clears filter correctly', async () => {
    const user = userEvent.setup();
    const onFilterChangeMock = vi.fn();

    render(<TransactionFilter {...defaultProps} onFilterChange={onFilterChangeMock} />);

    const dateInput = screen.getByLabelText('Filter transactions by date');

    // Change date to '2024-01-25'
    fireEvent.change(dateInput, { target: { value: '2024-01-25' } });

    // Expect only the transaction on that date (tx-1)
    expect(onFilterChangeMock).toHaveBeenLastCalledWith([mockTransactions[0]]);

    // Clear the date filter
    const clearButton = screen.getByRole('button', { name: 'Clear Date' });
    await user.click(clearButton);

    // Expect all transactions to return
    expect(onFilterChangeMock).toHaveBeenLastCalledWith(mockTransactions);
  });

  it('filters by category selection', async () => {
    const onFilterChangeMock = vi.fn();

    render(<TransactionFilter {...defaultProps} onFilterChange={onFilterChangeMock} />);

    const categorySelect = screen.getByRole('combobox', { name: '' }) as HTMLSelectElement;

    // Select 'Salary'
    fireEvent.change(categorySelect, { target: { value: 'Salary' } });
    expect(onFilterChangeMock).toHaveBeenLastCalledWith([mockTransactions[1]]);

    // Select 'Transportation'
    fireEvent.change(categorySelect, { target: { value: 'Transportation' } });
    expect(onFilterChangeMock).toHaveBeenLastCalledWith([mockTransactions[2]]);

    // Select 'All Categories'
    fireEvent.change(categorySelect, { target: { value: 'ALL' } });
    expect(onFilterChangeMock).toHaveBeenLastCalledWith(mockTransactions);
  });

  it('filters by account selection', async () => {
    const onFilterChangeMock = vi.fn();

    render(<TransactionFilter {...defaultProps} onFilterChange={onFilterChangeMock} />);

    const accountSelect = screen.getByLabelText('Filter transactions by account');

    // Select HDFC Card (acc-2)
    fireEvent.change(accountSelect, { target: { value: 'acc-2' } });
    expect(onFilterChangeMock).toHaveBeenLastCalledWith([mockTransactions[2]]);

    // Select SBI Account (acc-1)
    fireEvent.change(accountSelect, { target: { value: 'acc-1' } });
    expect(onFilterChangeMock).toHaveBeenLastCalledWith([mockTransactions[0], mockTransactions[1]]);
  });
});