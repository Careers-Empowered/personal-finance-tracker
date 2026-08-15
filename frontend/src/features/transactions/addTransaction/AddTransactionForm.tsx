import React, { useState, useEffect } from 'react';
import { CreateTransactionInput, TransactionType } from '../types';
import { Account } from '../../accounts/types';
import { AccountSelector } from './AccountSelector';
import { CategoryPicker } from './CategoryPicker';
import { apiFetch } from '../../../shared/utils/api';
import { getCurrencySymbol } from '../../../shared/utils/currencyUtils';

interface AddTransactionFormProps {
  type: TransactionType;
  accounts: Account[];
  onSave: (transactionData: CreateTransactionInput) => void;
  onCancel: () => void;
  setErrorMessage: (msg: string) => void;
}

export const AddTransactionForm: React.FC<AddTransactionFormProps> = ({
  type,
  accounts = [],
  onSave,
  onCancel,
  setErrorMessage,
}) => {
  const getTodayString = () => new Date().toISOString().split('T')[0];

  const [title, setTitle] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [accountId, setAccountId] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [subcategoryId, setSubcategoryId] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayString());

  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [subcategoriesList, setSubcategoriesList] = useState<any[]>([]);

  // Find currently selected account & currency symbol
  const selectedAccount = accounts.find((acc) => acc.id === accountId);
  const currencySymbol = getCurrencySymbol(selectedAccount?.currency);

  // Initialize account ID
  useEffect(() => {
    if (accounts.length > 0 && !accountId) {
      setAccountId(accounts[0].id);
    }
  }, [accounts, accountId]);

  // Fetch categories and subcategories on mount
  useEffect(() => {
    Promise.all([
      apiFetch('/api/transactions/categories'),
      apiFetch('/api/transactions/subcategories')
    ])
      .then(([catData, subData]) => {
        setCategoriesList(catData);
        setSubcategoriesList(subData);
      })
      .catch((err) => {
        console.error('Error fetching categories/subcategories in form:', err);
        setErrorMessage('Unable to load categories.');
      });
  }, [setErrorMessage]);

  const filteredCategories = categoriesList.filter((cat) => cat.type === type);

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
      setErrorMessage('Please select a valid bank account.');
      return;
    }

    if (!trimmedTitle) {
      setErrorMessage('Transaction Title is required.');
      return;
    }

    if (!trimmedCategoryId) {
      setErrorMessage('Category selection is mandatory.');
      return;
    }

    const transactionData: CreateTransactionInput = {
      accountId: trimmedAccountId,
      categoryId: trimmedCategoryId,
      subcategoryId: trimmedSubcategoryId,
      amount: numericAmount,
      type,
      date: trimmedDate || getTodayString(),
      title: trimmedTitle,
    };

    onSave(transactionData);
  };

  return (
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
          <label className="form-group-label">Account *</label>
          <AccountSelector
            value={accountId}
            onChange={setAccountId}
            accounts={accounts}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="transactionAmount" className="form-group-label">
            Amount ({selectedAccount?.currency || 'INR'}) *
          </label>
          <div className="amount-input-container">
            <span className="currency-symbol-prefix">{currencySymbol}</span>
            <input
              type="number"
              id="transactionAmount"
              className="form-control-enhanced amount-input-with-symbol"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              min="0.01"
              required
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-group-label">Category *</label>
          <CategoryPicker
            categories={filteredCategories}
            subcategories={subcategoriesList}
            selectedCategoryId={categoryId}
            selectedSubcategoryId={subcategoryId}
            onSelect={(catId, subId) => {
              setCategoryId(catId);
              setSubcategoryId(subId);
            }}
            required
          />
        </div>

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

      <div className="modal-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          Save Transaction
        </button>
      </div>
    </form>
  );
};

export default AddTransactionForm;
