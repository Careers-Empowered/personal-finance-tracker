import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AddTransactionForm from '../addTransaction/AddTransactionForm';
import { Account } from '../../accounts/types';

vi.mock('../../../shared/utils/api', () => ({
  apiFetch: vi.fn().mockImplementation((url: string) => {
    if (url.includes('/categories')) {
      return Promise.resolve([{ id: 'cat-1', name: 'Food', type: 'EXPENSE' }]);
    }
    if (url.includes('/subcategories')) {
      return Promise.resolve([{ id: 'sub-1', categoryId: 'cat-1', name: 'Groceries' }]);
    }
    return Promise.resolve([]);
  }),
}));

describe('AddTransactionForm Component', () => {
  it('renders the form title input and submit button', async () => {
    const accounts: Account[] = [
      {
        id: 'acc-1',
        userId: 'user-1',
        name: 'Checking Account',
        currency: 'INR',
        balance: 1000,
        isPrimary: true,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      },
    ];
    const onSave = vi.fn();
    const onCancel = vi.fn();
    const setErrorMessage = vi.fn();

    render(
      <AddTransactionForm
        type="EXPENSE"
        accounts={accounts}
        onSave={onSave}
        onCancel={onCancel}
        setErrorMessage={setErrorMessage}
      />
    );

    expect(screen.getByLabelText(/Title \*/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Save Transaction/i })).toBeInTheDocument();
    });
  });
});
