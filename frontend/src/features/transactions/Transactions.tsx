import React, { useEffect, useState } from 'react';
import { AddTransactionModal as TransactionModal } from './addTransaction';
import TransactionDisplay from './TransactionDisplay';
import TransactionFilter from './TransactionFilter';
import {
  Transaction,
  CreateTransactionInput,
} from './types';
import { Account } from '../accounts/types';
import { apiFetch } from '../../shared/utils/api';
import '../accounts/Accounts.css';
import './Transactions.css';

const Transactions: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [transactions, setTransactions] =
    useState<Transaction[]>([]);

  const [filteredTransactions, setFilteredTransactions] =
    useState<Transaction[]>([]);

  const [accounts, setAccounts] =
    useState<Account[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);



  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [txs, accs] = await Promise.all([
        apiFetch('/api/transactions?limit=10000'),
        apiFetch('/api/transactions/accounts'),
      ]);

      const safeTxs = Array.isArray(txs) ? txs : [];
      const safeAccs = Array.isArray(accs) ? accs : [];

      setTransactions(safeTxs);
      setFilteredTransactions(safeTxs);
      setAccounts(safeAccs);
    } catch (err: any) {
      console.error(
        'Error loading transactions data:',
        err
      );

      setError(
        err.message ||
          'Failed to load data from backend.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveTransaction = async (
    transactionData: CreateTransactionInput
  ) => {
    try {
      setError(null);

      await apiFetch('/api/transactions', {
        method: 'POST',
        body: JSON.stringify(transactionData),
      });

      await loadData();
      setIsModalOpen(false);
    } catch (err: any) {
      console.error(
        'Error saving transaction:',
        err
      );

      const msg = err.message || 'Failed to save transaction.';
      setError(msg);
      throw new Error(msg);
    }
  };

  const handleUpdateTransaction = async (
    updatedTransaction: CreateTransactionInput
  ) => {
    const transaction =
      updatedTransaction as CreateTransactionInput & {
        id?: string;
      };

    if (!transaction.id) {
      return;
    }

    try {
      setError(null);

      await apiFetch(
        `/api/transactions/${transaction.id}`,
        {
          method: 'PUT',
          body: JSON.stringify(updatedTransaction),
        }
      );

      await loadData();
    } catch (err: any) {
      console.error(
        'Error updating transaction:',
        err
      );

      setError(
        err.message ||
          'Failed to update transaction.'
      );
    }
  };

  const handleDeleteTransaction = async (
    identifier: string | number
  ) => {
    if (typeof identifier !== 'string') {
      return;
    }

    try {
      setError(null);

      await apiFetch(
        `/api/transactions/${identifier}`,
        {
          method: 'DELETE',
        }
      );

      await loadData();
    } catch (err: any) {
      console.error(
        'Error deleting transaction:',
        err
      );

      setError(
        err.message ||
          'Failed to delete transaction.'
      );
    }
  };

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
        <h1 className="transactions-title">
          Transactions
        </h1>

        <button
          className="btn btn-primary"
          onClick={() => setIsModalOpen(true)}
        >
          + Add Transaction
        </button>
      </div>

      {error && (
        <div className="form-error-alert">
          {error}
        </div>
      )}

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