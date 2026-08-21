import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TransactionEditDelete from '../TransactionEditDelete';

vi.mock('../../../shared/utils/api', () => ({
  apiFetch: vi.fn().mockResolvedValue([]),
}));

describe('TransactionEditDelete Component', () => {
  it('renders edit and delete action buttons', () => {
    const transaction = {
      id: 'tx-1',
      accountId: 'acc-1',
      categoryId: 'cat-1',
      subcategoryId: 'sub-1',
      amount: 100,
      type: 'EXPENSE' as const,
      date: '2026-08-20',
      title: 'Coffee',
    };
    const onSave = vi.fn();
    const onDelete = vi.fn();

    render(
      <TransactionEditDelete
        transaction={transaction}
        onSave={onSave}
        onDelete={onDelete}
      />
    );

    expect(screen.getByRole('button', { name: /Edit transaction/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Delete transaction/i })).toBeInTheDocument();
  });
});
