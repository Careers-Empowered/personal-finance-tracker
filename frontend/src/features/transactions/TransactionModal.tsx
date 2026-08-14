import React, { useState, useEffect } from 'react';
import { TransactionType, CreateTransactionInput } from './types';
import { Account } from '../accounts/types';
import { apiFetch } from '../../shared/utils/api';
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
        <option value="" disabled>Select Account</option>
        {accounts.map((acc) => (
          <option key={acc.id} value={acc.id}>
            {acc.name}
          </option>
        ))}
      </select>
    </div>
  );
};

// ============================================================================
// MODULAR EXTENSION POINT 2: Category Selector Field
// ============================================================================
interface CategorySelectorProps {
  value: string;
  onChange: (categoryId: string) => void;
  categories: any[];
  required?: boolean;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  value,
  onChange,
  categories = [],
  required = true,
}) => {
  return (
    <div className="form-group">
      <label htmlFor="transactionCategory" className="form-group-label">
        Category *
      </label>
      <select
        id="transactionCategory"
        className="form-control-enhanced"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      >
        <option value="" disabled>Select Category</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.icon ? `${cat.icon} ` : ''}{cat.name}
          </option>
        ))}
      </select>
    </div>
  );
};

// ============================================================================
// MODULAR EXTENSION POINT 3: Subcategory Selector Field
// ============================================================================
interface SubcategorySelectorProps {
  value: string;
  onChange: (subcategoryId: string) => void;
  subcategories: any[];
  required?: boolean;
  disabled?: boolean;
}

export const SubcategorySelector: React.FC<SubcategorySelectorProps> = ({
  value,
  onChange,
  subcategories = [],
  required = true,
  disabled = false,
}) => {
  return (
    <div className="form-group">
      <label htmlFor="transactionSubcategory" className="form-group-label">
        Subcategory *
      </label>
      <select
        id="transactionSubcategory"
        className="form-control-enhanced"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled || subcategories.length === 0}
      >
        <option value="" disabled>
          {subcategories.length === 0 ? 'Select Category first' : 'Select Subcategory'}
        </option>
        {subcategories.map((sub) => (
          <option key={sub.id} value={sub.id}>
            {sub.name}
          </option>
        ))}
      </select>
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
  const [categoryId, setCategoryId] = useState<string>('');
  const [subcategoryId, setSubcategoryId] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayString());
  const [title, setTitle] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Dropdown options lists
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
          console.error('Error fetching categories:', err);
          setErrorMessage('Unable to load categories.');
        });
    }
  }, [isOpen]);

  // Fetch subcategories dynamically when selected category changes
  useEffect(() => {
    if (isOpen && categoryId) {
      apiFetch(`/api/transactions/subcategories?categoryId=${categoryId}`)
        .then((data) => {
          setSubcategoriesList(data);
        })
        .catch((err) => {
          console.error('Error fetching subcategories:', err);
          setErrorMessage('Unable to load subcategories.');
        });
    } else {
      setSubcategoriesList([]);
    }
  }, [categoryId, isOpen]);

  // Reset fields on modal state change
  useEffect(() => {
    if (isOpen) {
      setType(initialType || 'EXPENSE');
      setAmount('');
      setAccountId(accounts.length > 0 ? accounts[0].id : '');
      setCategoryId('');
      setSubcategoryId('');
      setDate(getTodayString());
      setTitle('');
      setErrorMessage('');
    }
  }, [isOpen, initialType, accounts]);

  // Filter categories shown to match the active type (INCOME/EXPENSE)
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

    const transactionData: CreateTransactionInput = {
      type,
      amount: numericAmount,
      accountId: trimmedAccountId,
      categoryId: trimmedCategoryId,
      subcategoryId: trimmedSubcategoryId,
      date: trimmedDate,
      title: trimmedTitle,
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
            className={`type-toggle-btn ${type === 'INCOME' ? 'active-income' : ''}`}
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
            <label htmlFor="transactionTitle" className="form-group-label">
              Title *
            </label>
            <input
              type="text"
              id="transactionTitle"
              className="form-control-enhanced"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Grocery Shopping"
              required
            />
          </div>

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
            {/* Placeholder to align layout grid */}
            <div className="form-group"></div>
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

