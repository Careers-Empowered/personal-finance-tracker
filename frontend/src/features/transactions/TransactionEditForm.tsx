import React, { useState, useEffect } from 'react';
import { Transaction, CreateTransactionInput, TransactionType } from './types';
import { Account } from '../accounts/types';
import { AccountSelector, CategorySelector } from './TransactionModal';

interface TransactionEditFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedTransaction: Transaction | CreateTransactionInput) => void;
  transaction: Transaction | CreateTransactionInput;
  accounts?: Account[];
}

const TransactionEditForm: React.FC<TransactionEditFormProps> = ({
  isOpen,
  onClose,
  onSave,
  transaction,
  accounts = [],
}) => {
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [amount, setAmount] = useState<string>('');
  const [accountId, setAccountId] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (isOpen && transaction) {
      setType(transaction.type);
      setAmount(transaction.amount.toString());
      setAccountId(transaction.accountId);
      setCategory(transaction.categoryId || '');
      setDate(transaction.date);
      setTitle(transaction.title || '');
      setErrorMessage('');
    }
  }, [isOpen, transaction]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedTitle = title.trim();
    const trimmedCategory = category.trim();
    const trimmedAccountId = accountId.trim();
    const trimmedDate = date.trim();
    const numericAmount = parseFloat(amount);

    if (isNaN(numericAmount) || numericAmount <= 0) {
      setErrorMessage('Please enter a valid amount greater than 0.');
      return;
    }

    if (!trimmedAccountId) {
      setErrorMessage('Please select a valid Account.');
      return;
    }

    if (!trimmedCategory) {
      setErrorMessage('Category is required.');
      return;
    }

    if (!trimmedDate) {
      setErrorMessage('Date is required.');
      return;
    }

    if (!trimmedTitle) {
      setErrorMessage('Title is required.');
      return;
    }

    const updatedTransaction: Transaction | CreateTransactionInput = {
      ...transaction,
      type,
      amount: numericAmount,
      accountId: trimmedAccountId,
      date: trimmedDate,
      categoryId: trimmedCategory,
      title: trimmedTitle,
    } as Transaction | CreateTransactionInput;

    onSave(updatedTransaction);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-container">
          <h2>Edit Transaction</h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Type Segmented Toggle */}
        <div className="type-toggle-container">
          <button
            type="button"
            className={`type-toggle-btn ${
              type === 'EXPENSE' ? 'active-expense' : ''
            }`}
            onClick={() => setType('EXPENSE')}
          >
            <span>↓</span> Expense
          </button>
          <button
            type="button"
            className={`type-toggle-btn ${
              type === 'INCOME' ? 'active-income' : ''
            }`}
            onClick={() => setType('INCOME')}
          >
            <span>↑</span> Income
          </button>
        </div>

        {errorMessage && (
          <div className="form-error-alert" role="alert">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label
              htmlFor="editTransactionTitle"
              className="form-group-label"
            >
              Title *
            </label>
            <input
              type="text"
              id="editTransactionTitle"
              className="form-control-enhanced"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Grocery Shopping"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="editTransactionAmount" className="form-group-label">
                Amount *
              </label>
              <input
                type="number"
                id="editTransactionAmount"
                className="form-control-enhanced"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
              />
            </div>

            {/* Decoupled Account Selector Field */}
            <AccountSelector
              value={accountId}
              onChange={setAccountId}
              accounts={accounts}
              required
            />
          </div>

          <div className="form-row">
            {/* Decoupled Category Selector Field */}
            <CategorySelector
              value={category}
              onChange={setCategory}
              required
            />

            <div className="form-group">
              <label htmlFor="editTransactionDate" className="form-group-label">
                Date *
              </label>
              <input
                type="date"
                id="editTransactionDate"
                className="form-control-enhanced"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
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
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionEditForm;
