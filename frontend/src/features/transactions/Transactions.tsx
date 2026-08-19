import React, { useEffect, useMemo, useState } from 'react';
import TransactionModal from './TransactionModal';
import TransactionList from './TransactionList';
import TransactionFilter from './TransactionFilter';
import { Transaction, CreateTransactionInput, TransactionType } from './types';
import { Account } from '../accounts/types';
import { apiFetch } from '../../shared/utils/api';
import '../accounts/Accounts.css';
import './Transactions.css';
import './TransactionDisplay.css';
import './TransactionFilter.css';

const Transactions: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Transaction type filter
  const [selectedType, setSelectedType] = useState<TransactionType | 'ALL'>('ALL');
  // Date filter
  const [selectedDate, setSelectedDate] = useState<string>('');
  // Category filter (by Name for display consistency)
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [txs, accs] = await Promise.all([
        apiFetch('/api/transactions'),
        apiFetch('/api/transactions/accounts')
      ]);
      setTransactions(txs);
      setAccounts(accs);
    } catch (err: any) {
      console.error('Error loading transactions data:', err);
      setError(err.message || 'Failed to load data from backend.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveTransaction = async (transactionData: CreateTransactionInput) => {
    try {
      setError(null);
      await apiFetch('/api/transactions', {
        method: 'POST',
        body: JSON.stringify(transactionData)
      });
      await loadData(); // Reload to refresh balances and nested models
      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Error saving transaction:', err);
      setError(err.message || 'Failed to save transaction.');
    }
  };

  const handleUpdateTransaction = async (updatedTransaction: CreateTransactionInput) => {
    const tx = updatedTransaction as CreateTransactionInput & { id?: string };
    if (!tx.id) return;

    try {
      setError(null);
      await apiFetch(`/api/transactions/${tx.id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedTransaction)
      });
      await loadData(); // Reload to refresh balances and nested models
    } catch (err: any) {
      console.error('Error updating transaction:', err);
      setError(err.message || 'Failed to update transaction.');
    }
  };

  const handleDeleteTransaction = async (identifier: string | number) => {
    if (typeof identifier !== 'string') return;

    try {
      setError(null);
      await apiFetch(`/api/transactions/${identifier}`, {
        method: 'DELETE'
      });
      await loadData(); // Reload to refresh balances and nested models
    } catch (err: any) {
      console.error('Error deleting transaction:', err);
      setError(err.message || 'Failed to delete transaction.');
    }
  };

  // Apply filters
  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction: any) => {
      const matchesType =
        selectedType === 'ALL' ||
        transaction.type === selectedType;

      const matchesDate =
        selectedDate === '' ||
        transaction.date === selectedDate;

      const matchesCategory =
        selectedCategory === 'ALL' ||
        transaction.category?.name?.trim() === selectedCategory;

      return matchesType && matchesDate && matchesCategory;
    });
  }, [transactions, selectedType, selectedDate, selectedCategory]);

  const availableCategories = useMemo(() => {
    const categories = transactions
      .map((transaction: any) => transaction.category?.name?.trim())
      .filter((category): category is string => Boolean(category));

    return Array.from(new Set(categories)).sort();
  }, [transactions]);

  if (isLoading) {
    return (
      <div className="transactions-container">
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
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

      {error && (
        <div className="form-error-alert" style={{ marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTransaction}
        accounts={accounts}
      />

      <div className="transactions-list-container">
        <div className="transactions-list-header">
          <div>
            <h2>Recent Transactions</h2>

            <span className="transaction-count">
              {filteredTransactions.length}{' '}
              {filteredTransactions.length === 1
                ? 'transaction'
                : 'transactions'}
            </span>
          </div>

          <TransactionFilter
            selectedType={selectedType}
            onTypeChange={setSelectedType}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            categories={availableCategories}
          />
        </div>

        <TransactionList
          transactions={filteredTransactions}
          accounts={accounts}
          onSave={handleUpdateTransaction}
          onDelete={handleDeleteTransaction}
        />
      </div>
    </div>
  );
};

export default Transactions;