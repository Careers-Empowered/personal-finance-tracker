import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AddTransactionModal from '../addTransaction/AddTransactionModal';
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

describe('AddTransactionModal Component', () => {
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

  it('displays error message when saving a duplicate transaction fails', async () => {
    const onSave = vi.fn().mockRejectedValue(new Error('A duplicate transaction with the exact same details already exists.'));
    const onClose = vi.fn();

    render(
      <AddTransactionModal
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
        accounts={accounts}
      />
    );

    // Fill form
    fireEvent.change(screen.getByLabelText(/Title \*/i), { target: { value: 'Lunch' } });
    fireEvent.change(screen.getByLabelText(/Amount/i), { target: { value: '150' } });

    // Select category
    await waitFor(() => {
      expect(screen.getByText('Select category')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Select category'));
    await waitFor(() => {
      expect(screen.getAllByText('Food')[0]).toBeInTheDocument();
    });
    fireEvent.click(screen.getAllByText('Food')[0]);

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Save Transaction/i }));

    await waitFor(() => {
      expect(screen.getByText('A duplicate transaction with the exact same details already exists.')).toBeInTheDocument();
    });

    expect(onClose).not.toHaveBeenCalled();
  });
});
