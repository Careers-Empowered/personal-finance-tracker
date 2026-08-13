import React from 'react';
import { TransactionType } from './types';

interface TransactionFilterProps {
  selectedType: TransactionType | 'ALL';
  onTypeChange: (type: TransactionType | 'ALL') => void;
}

const TransactionFilter: React.FC<TransactionFilterProps> = ({
  selectedType,
  onTypeChange,
}) => {
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
          selectedType === 'INCOME' ? 'active income-filter' : ''
        }`}
        onClick={() => onTypeChange('INCOME')}
      >
        Income
      </button>

      <button
        type="button"
        className={`transaction-filter-btn ${
          selectedType === 'EXPENSE' ? 'active expense-filter' : ''
        }`}
        onClick={() => onTypeChange('EXPENSE')}
      >
        Expense
      </button>
    </div>
  );
};

export default TransactionFilter;