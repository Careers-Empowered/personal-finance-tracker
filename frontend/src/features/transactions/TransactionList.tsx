import React from 'react';
import { Transaction, CreateTransactionInput } from './types';
import { Account } from '../accounts/types';
import TransactionEditDelete from './TransactionEditDelete';
import { getCurrencySymbol } from '../../shared/utils/currencyUtils';

interface TransactionListProps {
  transactions: Transaction[];
  accounts: Account[];
  onSave: (updatedTransaction: Transaction | CreateTransactionInput) => void;
  onDelete: (identifier: string | number) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  accounts,
  onSave,
  onDelete,
}) => {
  const getAccountName = (accountId: string) => {
    const account = accounts.find((account) => account.id === accountId);
    return account?.name ?? 'Unknown Account';
  };

  const formatDate = (date: string) => {
    const parsedDate = new Date(`${date}T00:00:00`);

    return parsedDate.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  if (transactions.length === 0) {
    return (
      <div className="transactions-empty-state">
        <div className="transactions-empty-icon">
          <span>₹</span>
        </div>

        <h3>No transactions yet</h3>

        <p>
          Your added income and expenses will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="transaction-list">
      {transactions.map((transaction, index) => {
        const isIncome = transaction.type === 'INCOME';
        const account = accounts.find((acc) => acc.id === transaction.accountId);
        const currencySymbol = getCurrencySymbol(account?.currency || (transaction as any).account?.currency);

        return (
          <div className="transaction-item" key={`${transaction.date}-${index}`}>
            {/* Left */}
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
                  {transaction.title?.trim() || 'Untitled'}
                </div>

                <div className="transaction-meta">
                  <span>{formatDate(transaction.date)}</span>

                  <span className="transaction-meta-dot">•</span>

                  <span>
                    {transaction.category?.name || transaction.categoryId?.trim() || 'Uncategorized'}
                  </span>

                  {transaction.subcategory?.name && (
                    <>
                      <span className="transaction-meta-dot">•</span>
                      <span>{transaction.subcategory.name}</span>
                    </>
                  )}

                  <span className="transaction-meta-dot">•</span>

                  <span>
                    {transaction.account?.name || getAccountName(transaction.accountId)}
                  </span>
                </div>
              </div>
            </div>

            {/* Right */}
            <div className="transaction-right">
              <div
                className={`transaction-amount ${
                  isIncome
                    ? 'transaction-income-amount'
                    : 'transaction-expense-amount'
                }`}
              >
                {isIncome ? '+' : '-'}{currencySymbol}
                {formatAmount(transaction.amount)}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span
                  className={`transaction-type-badge ${
                    isIncome
                      ? 'transaction-income-badge'
                      : 'transaction-expense-badge'
                  }`}
                >
                  {isIncome ? 'Income' : 'Expense'}
                </span>

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
  );
};

export default TransactionList;