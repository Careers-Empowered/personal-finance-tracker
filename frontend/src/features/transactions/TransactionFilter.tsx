import React from 'react';
import { TransactionType } from './types';

interface TransactionFilterProps {
  selectedType: TransactionType | 'ALL';
  onTypeChange: (type: TransactionType | 'ALL') => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
}

const TransactionFilter: React.FC<TransactionFilterProps> = ({
  selectedType,
  onTypeChange,
  selectedDate,
  onDateChange,
  selectedCategory,
  onCategoryChange,
  categories,
}) =>  {
  return (
    <div className="transaction-filter">
      <button
        type="button"
        className={`transaction-filter-btn ${
          selectedType === 'ALL' ? 'active' : ''
        }`}
        onClick={() => onTypeChange('ALL')}
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
        onClick={() => onTypeChange('INCOME')}
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
        onClick={() => onTypeChange('EXPENSE')}
      >
        Expense
      </button>

      <input
        type="date"
        className="transaction-date-filter"
        value={selectedDate}
        onChange={(e) => onDateChange(e.target.value)}
        aria-label="Filter transactions by date"
      />

      {selectedDate && (
        <button
          type="button"
          className="transaction-filter-clear"
          onClick={() => onDateChange('')}
        >
          Clear Date
        </button>
      )}

      <select
  className="transaction-category-filter"
  value={selectedCategory}
  onChange={(e) => onCategoryChange(e.target.value)}
>
  <option value="ALL">All Categories</option>

  {categories.map((category) => (
    <option key={category} value={category}>
      {category}
    </option>
  ))}
</select>
    </div>
  );
};

export default TransactionFilter;