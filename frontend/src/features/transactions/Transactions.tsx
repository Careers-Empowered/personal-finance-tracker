import React from 'react';
import { AddTransactionModal as TransactionModal } from './addTransaction';
import TransactionDisplay from './TransactionDisplay';
import TransactionFilter from './TransactionFilter';
import { useTransactions } from './useTransactions.ts';
import '../accounts/Accounts.css';
import './Transactions.css';

const Transactions: React.FC = () => {
  const {
    isModalOpen,
    setIsModalOpen,
    transactions,
    filteredTransactions,
    setFilteredTransactions,
    accounts,
    isLoading,
    error,
    handleSaveTransaction,
    handleUpdateTransaction,
    handleDeleteTransaction,
  } = useTransactions();

  if (isLoading) {
    return (
      <div className="transactions-container">
        <div className="transactions-loading">
          <p>Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="transactions-container">
      <div className="transactions-header">
        <h1 className="transactions-title">Transactions</h1>
        <button
          className="btn btn-primary"
          onClick={() => setIsModalOpen(true)}
        >
          + Add Transaction
        </button>
      </div>

      {error && <div className="form-error-alert">{error}</div>}

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTransaction}
        accounts={accounts}
      />

      <TransactionFilter
        transactions={transactions}
        accounts={accounts}
        onFilterChange={setFilteredTransactions}
      />

      <TransactionDisplay
        transactions={filteredTransactions}
        accounts={accounts}
        onSave={handleUpdateTransaction}
        onDelete={handleDeleteTransaction}
      />
    </div>
  );
};

export default Transactions;
