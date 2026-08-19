import React, { useState, useEffect } from 'react';
import { Transaction, CreateTransactionInput, TransactionType } from './types';
import { Account } from '../accounts/types';
import { AccountSelector, CategorySelector, SubcategorySelector } from './TransactionModal';
import { apiFetch } from '../../shared/utils/api';

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
  const [categoryId, setCategoryId] = useState<string>('');
  const [subcategoryId, setSubcategoryId] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Dropdowns option lists
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [subcategoriesList, setSubcategoriesList] = useState<any[]>([]);

  // Fetch categories when modal opens
  useEffect(() => {
    if (isOpen) {
      apiFetch('/api/transactions/categories')
        .then((data) => {
          setCategoriesList(data);
        })
        .catch((err) => {
          console.error('Error fetching categories in edit form:', err);
          setErrorMessage('Unable to load categories.');
        });
    }
  }, [isOpen]);

  // Load transaction values when open
  useEffect(() => {
    if (isOpen && transaction) {
      setType(transaction.type);
      setAmount(transaction.amount.toString());
      setAccountId(transaction.accountId);
      setCategoryId(transaction.categoryId || '');
      setSubcategoryId(transaction.subcategoryId || '');
      setDate(transaction.date);
      setTitle(transaction.title || '');
      setErrorMessage('');
    }
  }, [isOpen, transaction]);

  // Fetch subcategories dynamically when selected category changes
  useEffect(() => {
    if (isOpen && categoryId) {
      apiFetch(`/api/transactions/subcategories?categoryId=${categoryId}`)
        .then((data) => {
          setSubcategoriesList(data);
        })
        .catch((err) => {
          console.error('Error fetching subcategories in edit form:', err);
          setErrorMessage('Unable to load subcategories.');
        });
    } else {
      setSubcategoriesList([]);
    }
  }, [categoryId, isOpen]);

  // Filter categories shown to match type
  const filteredCategories = categoriesList.filter((cat) => cat.type === type);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedTitle = title.trim();
    const trimmedAccountId = accountId.trim();
    const trimmedCategoryId = categoryId.trim();
    const trimmedSubcategoryId = subcategoryId.trim();
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

    if (!trimmedCategoryId) {
      setErrorMessage('Category is required.');
      return;
    }

    if (!trimmedSubcategoryId) {
      setErrorMessage('Subcategory is required.');
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
      categoryId: trimmedCategoryId,
      subcategoryId: trimmedSubcategoryId,
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
            onClick={() => {
              setType('EXPENSE');
              setCategoryId('');
              setSubcategoryId('');
            }}
          >
            <span>↓</span> Expense
          </button>
          <button
            type="button"
            className={`type-toggle-btn ${
              type === 'INCOME' ? 'active-income' : ''
            }`}
            onClick={() => {
              setType('INCOME');
              setCategoryId('');
              setSubcategoryId('');
            }}
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
              value={categoryId}
              onChange={(catId) => {
                setCategoryId(catId);
                setSubcategoryId('');
              }}
              categories={filteredCategories}
              required
            />

            {/* Decoupled Subcategory Selector Field */}
            <SubcategorySelector
              value={subcategoryId}
              onChange={setSubcategoryId}
              subcategories={subcategoriesList}
              required
              disabled={!categoryId}
            />
          </div>

          <div className="form-row">
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
            {/* Placeholder to align layout grid */}
            <div className="form-group"></div>
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

