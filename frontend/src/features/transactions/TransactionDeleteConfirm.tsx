import React from 'react';
import { Transaction, CreateTransactionInput } from './types';
import { Account } from '../accounts/types';

interface TransactionDeleteConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  transaction: Transaction | CreateTransactionInput;
  accounts?: Account[];
}

const TransactionDeleteConfirm: React.FC<TransactionDeleteConfirmProps> = ({
  isOpen,
  onClose,
  onConfirm,
  transaction,
  accounts = [],
}) => {
  if (!isOpen) return null;

  const isIncome = transaction.type === 'INCOME';

  const getAccountName = (accountId: string) => {
    const account = accounts.find((acc) => acc.id === accountId);
    return account?.name ?? 'Unknown Account';
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const parsedDate = new Date(`${dateStr}T00:00:00`);
    return parsedDate.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatAmount = (amountVal: number) => {
    return amountVal.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-container">
          <h2>Delete Transaction</h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className="delete-confirm-body">
          <div className="delete-confirm-icon-wrapper">
            <svg viewBox="0 0 24 24">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />
            </svg>
          </div>

          <div className="delete-confirm-title">Confirm Deletion</div>
          <div className="delete-confirm-text">
            Are you sure you want to delete this transaction? This action cannot
            be undone.
          </div>

          <div className="delete-transaction-preview">
            <div className="delete-preview-details">
              <div className="delete-preview-title">
                {transaction.title?.trim() || 'Untitled'}
              </div>
              <div className="delete-preview-meta">
                <span>{formatDate(transaction.date)}</span>
                <span className="transaction-meta-dot">•</span>
                <span>{transaction.categoryId?.trim() || 'Uncategorized'}</span>
                <span className="transaction-meta-dot">•</span>
                <span>{getAccountName(transaction.accountId)}</span>
              </div>
            </div>

            <div
              className={`delete-preview-amount ${
                isIncome
                  ? 'transaction-income-amount'
                  : 'transaction-expense-amount'
              }`}
            >
              {isIncome ? '+' : '-'}₹{formatAmount(transaction.amount)}
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn delete-btn-danger"
              onClick={onConfirm}
            >
              Confirm Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDeleteConfirm;
