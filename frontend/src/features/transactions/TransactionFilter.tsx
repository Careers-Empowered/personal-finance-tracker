import React, { useState, useMemo, useEffect } from 'react';
import { TransactionType, Transaction } from './types';
import { Account } from '../accounts/types';
import './TransactionFilter.css';

interface TransactionFilterProps {
  transactions: Transaction[];
  accounts: Account[];
  onFilterChange: (filteredTransactions: Transaction[]) => void;
}

const TransactionFilter: React.FC<TransactionFilterProps> = ({
  transactions,
  accounts,
  onFilterChange,
}) => {
  const [selectedType, setSelectedType] = useState<TransactionType | 'ALL'>('ALL');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('ALL');

  // Extract unique category names from all transactions
  const categories = useMemo(() => {
    const categoryNames = transactions
      .map(
        (transaction) =>
          transaction.category?.name?.trim() ||
          transaction.categoryId?.trim()
      )
      .filter(
        (category): category is string =>
          Boolean(category)
      );

    return Array.from(new Set(categoryNames)).sort();
  }, [transactions]);

  // Reset category filter if the selected category is no longer present in transactions
  useEffect(() => {
    if (selectedCategory !== 'ALL' && !categories.includes(selectedCategory)) {
      setSelectedCategory('ALL');
    }
  }, [categories, selectedCategory]);

  // Compute filtered transactions reactively
  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const matchesType =
        selectedType === 'ALL' ||
        transaction.type === selectedType;

      const transactionDate =
        transaction.date?.split('T')[0];

      const matchesDate =
        selectedDate === '' ||
        transactionDate === selectedDate;

      const categoryName =
        transaction.category?.name?.trim() ||
        transaction.categoryId?.trim() ||
        '';

      const matchesCategory =
        selectedCategory === 'ALL' ||
        categoryName === selectedCategory;

      const transactionAccountId =
        transaction.account?.id ||
        transaction.accountId;

      const matchesAccount =
        selectedAccountId === 'ALL' ||
        transactionAccountId === selectedAccountId;

      return (
        matchesType &&
        matchesDate &&
        matchesCategory &&
        matchesAccount
      );
    });
  }, [transactions, selectedType, selectedDate, selectedCategory, selectedAccountId]);

  // Call onFilterChange callback when filtered list updates
  useEffect(() => {
    onFilterChange(filteredTransactions);
  }, [filteredTransactions, onFilterChange]);

  return (
    <div className="transaction-filter">
      <button
        type="button"
        className={`transaction-filter-btn ${
          selectedType === 'ALL' ? 'active' : ''
        }`}
        onClick={() => setSelectedType('ALL')}
      >
        All
      </button>

      <button
        type="button"
        className={`transaction-filter-btn ${
          selectedType === 'INCOME'
            ? 'active income-filter'
            : ''
        }`}
        onClick={() => setSelectedType('INCOME')}
      >
        Income
      </button>

      <button
        type="button"
        className={`transaction-filter-btn ${
          selectedType === 'EXPENSE'
            ? 'active expense-filter'
            : ''
        }`}
        onClick={() => setSelectedType('EXPENSE')}
      >
        Expense
      </button>

      <input
        type="date"
        className="transaction-date-filter"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        aria-label="Filter transactions by date"
      />

      {selectedDate && (
        <button
          type="button"
          className="transaction-filter-clear"
          onClick={() => setSelectedDate('')}
        >
          Clear Date
        </button>
      )}

      <select
        className="transaction-category-filter"
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
      >
        <option value="ALL">
          All Categories
        </option>

        {categories.map((category) => (
          <option
            key={category}
            value={category}
          >
            {category}
          </option>
        ))}
      </select>

      <select
        className="transaction-account-filter"
        value={selectedAccountId}
        onChange={(e) => setSelectedAccountId(e.target.value)}
        aria-label="Filter transactions by account"
      >
        <option value="ALL">
          All Accounts
        </option>

        {accounts.map((account) => (
          <option
            key={account.id}
            value={account.id}
          >
            {account.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TransactionFilter;