import React, { useState } from 'react';
import { Transaction, CreateTransactionInput } from './types';
import { Account } from '../accounts/types/types';
import TransactionEditForm from './TransactionEditForm';
import TransactionDeleteConfirm from './TransactionDeleteConfirm';
import './TransactionEditDelete.css';

interface TransactionEditDeleteProps {
  transaction: Transaction | CreateTransactionInput;
  index?: number;
  accounts?: Account[];
  onSave: (updatedTransaction: Transaction | CreateTransactionInput) => Promise<void> | void;
  onDelete: (identifier: string | number) => void;
}

const TransactionEditDelete: React.FC<TransactionEditDeleteProps> = ({
  transaction,
  index,
  accounts = [],
  onSave,
  onDelete,
}) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleSave = async (updated: Transaction | CreateTransactionInput) => {
    await onSave(updated);
    setIsEditOpen(false);
  };

  const handleDeleteConfirm = () => {
    // Determine the identifier. If ID is present, use it. Otherwise, use index.
    const identifier =
      'id' in transaction && transaction.id
        ? transaction.id
        : index !== undefined
        ? index
        : '';
    onDelete(identifier);
    setIsDeleteOpen(false);
  };

  return (
    <>
      <div className="transaction-actions">
        <button
          type="button"
          className="action-btn action-btn-edit"
          onClick={() => setIsEditOpen(true)}
          title="Edit transaction"
          aria-label="Edit transaction"
        >
          <svg viewBox="0 0 24 24">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z" />
          </svg>
        </button>
        <button
          type="button"
          className="action-btn action-btn-delete"
          onClick={() => setIsDeleteOpen(true)}
          title="Delete transaction"
          aria-label="Delete transaction"
        >
          <svg viewBox="0 0 24 24">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>

      <TransactionEditForm
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSave={handleSave}
        transaction={transaction}
        accounts={accounts}
      />

      <TransactionDeleteConfirm
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        transaction={transaction}
        accounts={accounts}
      />
    </>
  );
};

export default TransactionEditDelete;
export type { TransactionEditDeleteProps };
