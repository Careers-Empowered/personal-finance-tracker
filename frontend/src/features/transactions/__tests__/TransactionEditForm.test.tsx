import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TransactionEditForm from '../TransactionEditForm';
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

describe('TransactionEditForm Component', () => {
  it('renders edit transaction modal with form fields', async () => {
    const transaction = {
      id: 'tx-1',
      accountId: 'acc-1',
      categoryId: 'cat-1',
      subcategoryId: 'sub-1',
      amount: 250,
      type: 'EXPENSE' as const,
      date: '2026-08-20',
      title: 'Groceries',
    };
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
    const onClose = vi.fn();
    const onSave = vi.fn();

    render(
      <TransactionEditForm
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
        transaction={transaction}
        accounts={accounts}
      />
    );

    expect(screen.getByRole('heading', { name: /Edit Transaction/i })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Save Changes/i })).toBeInTheDocument();
    });
  });
});
