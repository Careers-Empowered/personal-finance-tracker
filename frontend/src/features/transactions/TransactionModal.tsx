import React, { useState, useEffect } from 'react';
import { TransactionType, CreateTransactionInput } from './types';
import { Account } from '../accounts/types';
import './Transactions.css';

// ============================================================================
// MODULAR EXTENSION POINT 1: Account Selector Field
// Isolated so the Accounts team can replace/upgrade dropdown without touching modal logic
// ============================================================================
interface AccountSelectorProps {
  value: string;
  onChange: (accountId: string) => void;
  accounts?: Account[];
  required?: boolean;
}

export const AccountSelector: React.FC<AccountSelectorProps> = ({
  value,
  onChange,
  accounts = [],
  required = true,
}) => {
  return (
    <div className="form-group">
      <label htmlFor="transactionAccount" className="form-group-label">
        Account *
      </label>
      <select
        id="transactionAccount"
        className="form-control-enhanced"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      >
        {accounts.length === 0 ? (
          <option value="" disabled>
            No accounts available
          </option>
        ) : (
          accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.name}
            </option>
          ))
        )}
      </select>
    </div>
  );
};

// ============================================================================
// MODULAR EXTENSION POINT 2: Category Selector Field
// Isolated so the Categories team can swap in their Category picker without touching modal logic
// ============================================================================
interface CategorySelectorProps {
  value: string;
  onChange: (categoryId: string) => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="form-group">
      <label htmlFor="transactionCategory" className="form-group-label">
        Category
      </label>
      <input
        type="text"
        id="transactionCategory"
        className="form-control-enhanced"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. Groceries"
      />
    </div>
  );
};

// ============================================================================
// MAIN TRANSACTION MODAL COMPONENT
// ============================================================================
interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transactionData: CreateTransactionInput) => void;
  initialType?: TransactionType;
  accounts?: Account[];
}

const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialType,
  accounts = [],
}) => {
  const getTodayString = () => new Date().toISOString().split('T')[0];

  const [type, setType] = useState<TransactionType>(initialType || 'EXPENSE');
  const [amount, setAmount] = useState<string>('');
  const [accountId, setAccountId] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayString());
  const [description, setDescription] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setType(initialType || 'EXPENSE');
      setAmount('');
      setAccountId(accounts.length > 0 ? accounts[0].id : '');
      setCategory('');
      setDate(getTodayString());
      setDescription('');
    }
  }, [isOpen, initialType, accounts]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return;
    }

    const transactionData: CreateTransactionInput = {
      type,
      amount: numericAmount,
      accountId,
      date,
      ...(category.trim() ? { categoryId: category.trim() } : {}),
      ...(description.trim() ? { description: description.trim() } : {}),
    };

    onSave(transactionData);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-container">
          <h2>{type === 'INCOME' ? 'Add Income' : 'Add Expense'}</h2>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        {/* Type Segmented Toggle */}
        <div className="type-toggle-container">
          <button
            type="button"
            className={`type-toggle-btn ${type === 'EXPENSE' ? 'active-expense' : ''}`}
            onClick={() => setType('EXPENSE')}
          >
            <span>↓</span> Expense
          </button>
          <button
            type="button"
            className={`type-toggle-btn ${type === 'INCOME' ? 'active-income' : ''}`}
            onClick={() => setType('INCOME')}
          >
            <span>↑</span> Income
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="transactionAmount" className="form-group-label">
                Amount *
              </label>
              <input
                type="number"
                id="transactionAmount"
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
            />
          </div>

          <div className="form-row">
            {/* Decoupled Category Selector Field */}
            <CategorySelector
              value={category}
              onChange={setCategory}
            />

            <div className="form-group">
              <label htmlFor="transactionDate" className="form-group-label">
                Date *
              </label>
              <input
                type="date"
                id="transactionDate"
                className="form-control-enhanced"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="transactionDescription" className="form-group-label">
              Description
            </label>
            <input
              type="text"
              id="transactionDescription"
              className="form-control-enhanced"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Weekly supermarket shopping"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
