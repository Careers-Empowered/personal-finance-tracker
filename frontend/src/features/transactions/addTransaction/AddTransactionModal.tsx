import React, { useState, useEffect } from 'react';
import { TransactionType, CreateTransactionInput } from '../types';
import { Account } from '../../accounts/types';
import { AddTransactionForm } from './AddTransactionForm';
import './AddTransaction.css';
import '../Transactions.css';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transactionData: CreateTransactionInput) => void;
  initialType?: TransactionType;
  accounts?: Account[];
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialType = 'EXPENSE',
  accounts = [],
}) => {
  const [type, setType] = useState<TransactionType>(initialType);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setType(initialType || 'EXPENSE');
      setErrorMessage('');
    }
  }, [isOpen, initialType]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header-container">
          <h2>{type === 'INCOME' ? 'Add Income' : 'Add Expense'}</h2>
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
            className={`type-toggle-btn ${type === 'EXPENSE' ? 'active-expense' : ''}`}
            onClick={() => {
              setType('EXPENSE');
              setErrorMessage('');
            }}
          >
            <span>↓</span> Expense
          </button>
          <button
            type="button"
            className={`type-toggle-btn ${type === 'INCOME' ? 'active-income' : ''}`}
            onClick={() => {
              setType('INCOME');
              setErrorMessage('');
            }}
          >
            <span>↑</span> Income
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="form-error-alert" role="alert">
            {errorMessage}
          </div>
        )}

        {/* Form Fields */}
        <AddTransactionForm
          type={type}
          accounts={accounts}
          onSave={(data) => {
            onSave(data);
            onClose();
          }}
          onCancel={onClose}
          setErrorMessage={setErrorMessage}
        />
      </div>
    </div>
  );
};

export default AddTransactionModal;
