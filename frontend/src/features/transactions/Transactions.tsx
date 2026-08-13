import React, { useMemo, useState } from 'react';
import TransactionModal from './TransactionModal';
import TransactionList from './TransactionList';
import TransactionFilter from './TransactionFilter';
import { CreateTransactionInput, TransactionType } from './types';
import { Account } from '../accounts/types';
import accountMockData from '../accounts/mockData.json';
import '../accounts/Accounts.css';
import './Transactions.css';
import './TransactionDisplay.css';
import './TransactionFilter.css';

const Transactions: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [transactions, setTransactions] = useState<
    CreateTransactionInput[]
  >([]);

  // Transaction type filter
  const [selectedType, setSelectedType] = useState<
    TransactionType | 'ALL'
  >('ALL');
  // Date filter
const [selectedDate, setSelectedDate] = useState<string>('');
//category filter
const [selectedCategory, setSelectedCategory] = useState<string>('ALL');


 

  const accounts: Account[] = accountMockData as Account[];

  const handleSaveTransaction = (
    transactionData: CreateTransactionInput
  ) => {
    console.log('Transaction submitted:', transactionData);

    const newTransaction = {
      ...transactionData,
      id: crypto.randomUUID
        ? crypto.randomUUID()
        : Date.now().toString(),
    };

    setTransactions((previousTransactions) => [
      ...previousTransactions,
      newTransaction,
    ]);

    setIsModalOpen(false);
  };

  const handleUpdateTransaction = (
    updatedTransaction: CreateTransactionInput
  ) => {
    const updated =
      updatedTransaction as CreateTransactionInput & { id?: string };

    setTransactions((previousTransactions) =>
      previousTransactions.map((tx) => {
        const currentTx =
          tx as CreateTransactionInput & { id?: string };

        return currentTx.id === updated.id ? updated : tx;
      })
    );
  };

  const handleDeleteTransaction = (
    identifier: string | number
  ) => {
    setTransactions((previousTransactions) =>
      previousTransactions.filter((tx, idx) => {
        const currentTx =
          tx as CreateTransactionInput & { id?: string };

        if (currentTx.id) {
          return currentTx.id !== identifier;
        }

        return idx !== identifier;
      })
    );
  };

  // Apply both type and date filters
  const filteredTransactions = useMemo(() => {
  return transactions.filter((transaction) => {
    const matchesType =
      selectedType === 'ALL' ||
      transaction.type === selectedType;

    const matchesDate =
      selectedDate === '' ||
      transaction.date === selectedDate;

    const matchesCategory =
      selectedCategory === 'ALL' ||
      transaction.categoryId?.trim() === selectedCategory;

    return matchesType && matchesDate && matchesCategory;
  });
}, [
  transactions,
  selectedType,
  selectedDate,
  selectedCategory,
]);

  const availableCategories = useMemo(() => {
  const categories = transactions
    .map((transaction) => transaction.categoryId?.trim())
    .filter((category): category is string => Boolean(category));

  return Array.from(new Set(categories)).sort();
}, [transactions]);

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