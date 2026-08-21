import React, { useCallback, useState } from 'react';
import { Transaction, CreateTransactionInput } from './types';
import { Account } from '../accounts/types';
import TransactionEditDelete from './TransactionEditDelete';
import { getCurrencySymbol } from '../../shared/utils/currencyUtils';
import './TransactionDisplay.css';



interface TransactionDisplayProps {
  transactions: Transaction[];
  accounts: Account[];
  onSave: (updatedTransaction: Transaction | CreateTransactionInput) => void;
  onDelete: (identifier: string | number) => void;
}

const TransactionDisplay: React.FC<TransactionDisplayProps> = ({
  transactions,
  accounts,
  onSave,
  onDelete,
}) => {

  const [selectedOverrideNote, setSelectedOverrideNote] =
  useState<string | null>(null);

  const getAccountName = useCallback((accountId: string) => {
    const account = accounts.find(
      (account) => account.id === accountId
    );

    return account?.name ?? 'Unknown Account';
  }, [accounts]);

  const getAccount = useCallback((transaction: Transaction): Account | undefined => {
    return accounts.find(
      (account) => account.id === transaction.accountId
    );
  }, [accounts]);

  // Memoized to avoid recreation on every render
  const formatDate = useCallback((date: string) => {
    const parsedDate = new Date(
      `${date.split('T')[0]}T00:00:00`
    );

    return parsedDate.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }, []);

  // Memoized to avoid recreation on every render
  const formatAmount = useCallback((amount: number) => {
    return amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, []);

  const getCategoryName = useCallback((transaction: Transaction) => {
    return (
      transaction.category?.name?.trim() ||
      transaction.categoryId?.trim() ||
      'Uncategorized'
    );
  }, []);

  const safeTransactions = Array.isArray(transactions) ? transactions : [];

  if (safeTransactions.length === 0) {
    return (
      <div className="transactions-empty-state">
       

        <h3>No transactions found</h3>

        <p>
          Your added income and expenses will appear here.
        </p>
      </div>
    );
  }

  return (
  <div className="transactions-list-container">

    {/* Header with Transactions Title and Count */}
    <div className="transactions-list-header">
      <div>
        <h2>Recent Transactions</h2>

        <span className="transaction-count">
          {safeTransactions.length}{' '}
          {safeTransactions.length === 1
            ? 'transaction'
            : 'transactions'}
        </span>
      </div>
    </div>

    {/* Transaction List */}
    <div className="transaction-list">

      {safeTransactions.map((transaction, index) => {
        const isIncome =
          transaction.type === 'INCOME';

        const account =
          getAccount(transaction);

        const currencySymbol =
          getCurrencySymbol(
            account?.currency
          );

        return (
          <div
            className="transaction-item"
            key={
              transaction.id ||
              `${transaction.date}-${index}`
            }
          >

            {/* Left section */}
            <div className="transaction-main">

              <div
                className={`transaction-icon ${
                  isIncome
                    ? 'transaction-icon-income'
                    : 'transaction-icon-expense'
                }`}
              >
                {isIncome ? '↑' : '↓'}
              </div>

              <div className="transaction-details">

                <div className="transaction-title">
                  {transaction.title?.trim() ||
                    'Untitled'}
                </div>

                <div className="transaction-meta">

                  <span>
                    {formatDate(transaction.date)}
                  </span>

                  <span className="transaction-meta-dot">
                    •
                  </span>

                  <span>
                    {getCategoryName(transaction)}
                  </span>

                  {transaction.subcategory?.name && (
                    <>
                      <span className="transaction-meta-dot">
                        •
                      </span>

                      <span>
                        {transaction.subcategory.name}
                      </span>
                    </>
                  )}

                  <span className="transaction-meta-dot">
                    •
                  </span>

                  <span>
                    {account?.name ||
                      getAccountName(
                        transaction.accountId
                      )}
                  </span>

                </div>
              </div>
            </div>

            {/* Right section */}
            <div className="transaction-right">

              <div
                className={`transaction-amount ${
                  isIncome
                    ? 'transaction-income-amount'
                    : 'transaction-expense-amount'
                }`}
              >
                {isIncome ? '+' : '-'}
                {currencySymbol}
                {formatAmount(
                  transaction.amount
                )}
              </div>

              <div className="transaction-actions">

                {/* Income / Expense badge */}
                <span
                  className={`transaction-type-badge ${
                    isIncome
                      ? 'transaction-income-badge'
                      : 'transaction-expense-badge'
                  }`}
                >
                  {isIncome
                    ? 'Income'
                    : 'Expense'}
                </span>

                {/* =================================
                    ADD ANYWAY NOTE - EYE ICON
                    ================================= */}
                {transaction.importedWithOverride &&
                  transaction.overrideNote ? (
                    <button
                      type="button"
                      className="transaction-note-button"
                      onClick={() => {
                        setSelectedOverrideNote(transaction.overrideNote ?? null);
                      }}
                      aria-label="View import override note"
                      title="View import override note"
                    >
                      <span className="eye-icon">👁</span>
                    </button>
                  ) : (
                    <span
                      className="transaction-note-placeholder"
                      aria-hidden="true"
                    />
                  )}
                {/* Existing Edit / Delete */}
                <TransactionEditDelete
                  transaction={transaction}
                  index={index}
                  accounts={accounts}
                  onSave={onSave}
                  onDelete={onDelete}
                />

              </div>
            </div>
          </div>
        );
      })}

    </div>

    {/* ==========================================
        IMPORT OVERRIDE NOTE MODAL
        ========================================== */}
    {selectedOverrideNote !== null && (
      <div
        className="transaction-note-overlay"
        onClick={() =>
          setSelectedOverrideNote(null)
        }
      >
        <div
          className="transaction-note-modal"
          onClick={(event) =>
            event.stopPropagation()
          }
        >

          <div className="transaction-note-modal-header">

            <h3>
              Import Override Note
            </h3>

            <button
              type="button"
              className="transaction-note-close"
              onClick={() =>
                setSelectedOverrideNote(null)
              }
              aria-label="Close note"
            >
              ×
            </button>

          </div>

          <div className="transaction-note-modal-body">
            {selectedOverrideNote}
          </div>

          <div className="transaction-note-modal-footer">
            Added using "Add Anyway"
          </div>

        </div>
      </div>
    )}

  </div>
);
};

export default TransactionDisplay;
