import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TransactionDeleteConfirm from '../TransactionDeleteConfirm';

describe('TransactionDeleteConfirm Component', () => {
  it('renders confirmation modal and triggers onConfirm on button click', () => {
    const transaction = {
      id: 'tx-1',
      accountId: 'acc-1',
      categoryId: 'cat-1',
      subcategoryId: 'sub-1',
      amount: 500,
      type: 'EXPENSE' as const,
      date: '2026-08-20',
      title: 'Lunch',
    };
    const onClose = vi.fn();
    const onConfirm = vi.fn();

    render(
      <TransactionDeleteConfirm
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        transaction={transaction}
      />
    );

    expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();

    const confirmButton = screen.getByRole('button', { name: /Confirm Delete/i });
    fireEvent.click(confirmButton);

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
