import { useState, useEffect, useCallback } from 'react';
import { Transaction, CreateTransactionInput } from './types';
import { Account } from '../accounts/types';
import { apiFetch } from '../../shared/utils/api';

export const useTransactions = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (signal?: AbortSignal) => {
    try {
      setIsLoading(true);
      setError(null);

      const [txs, accs] = await Promise.all([
        apiFetch('/api/transactions?limit=10000', { signal }),
        apiFetch('/api/transactions/accounts', { signal }),
      ]);

      const safeTxs = Array.isArray(txs) ? txs : [];
      const safeAccs = Array.isArray(accs) ? accs : [];

      setTransactions(safeTxs);
      setAccounts(safeAccs);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Error loading transactions data:', err);
        setError(err.message || 'Failed to load data from backend.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const abortController = new AbortController();
    loadData(abortController.signal);

    return () => {
      abortController.abort();
    };
  }, [loadData]);

  const handleSaveTransaction = async (transactionData: CreateTransactionInput) => {
    try {
      setError(null);
      await apiFetch('/api/transactions', {
        method: 'POST',
        body: JSON.stringify(transactionData),
      });
      await loadData();
      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Error saving transaction:', err);
      const msg = err.message || 'Failed to save transaction.';
      throw new Error(msg);
    }
  };

  const handleUpdateTransaction = async (updatedTransaction: CreateTransactionInput & { id?: string }) => {
    const transactionId = updatedTransaction.id;

    if (!transactionId) {
      const errorMsg = 'Transaction ID is required for updates';
      setError(errorMsg);
      console.error(errorMsg);
      return;
    }

    try {
      setError(null);
      await apiFetch(`/api/transactions/${transactionId}`, {
        method: 'PUT',
        body: JSON.stringify(updatedTransaction),
      });
      await loadData();
    } catch (err: any) {
      console.error('Error updating transaction:', err);
      const msg = err.message || 'Failed to update transaction.';
      setError(msg);
      throw new Error(msg);
    }
  };

  const handleDeleteTransaction = async (identifier: string | number) => {
    if (typeof identifier !== 'string') {
      setError('Invalid transaction identifier');
      return;
    }

    try {
      setError(null);
      await apiFetch(`/api/transactions/${identifier}`, {
        method: 'DELETE',
      });
      await loadData();
    } catch (err: any) {
      console.error('Error deleting transaction:', err);
      setError(err.message || 'Failed to delete transaction.');
    }
  };

  return {
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
  };
};