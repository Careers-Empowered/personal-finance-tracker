import React, { useMemo, useState } from 'react';
import TransactionModal from './TransactionModal';
import TransactionList from './TransactionList';
import TransactionFilter from './TransactionFilter';
import { CreateTransactionInput, TransactionType } from './types';
import { Account } from '../accounts/types';
import accountMockData from '../accounts/mockData.json';
import '../accounts/Accounts.css';
import './Transactions.css';

const Transactions: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [transactions, setTransactions] = useState<
    CreateTransactionInput[]
  >([]);

  const [selectedType, setSelectedType] = useState<
    TransactionType | 'ALL'
  >('ALL');

  const accounts: Account[] = accountMockData as Account[];

  const handleSaveTransaction = (
    transactionData: CreateTransactionInput
  ) => {
    console.log('Transaction submitted:', transactionData);

    setTransactions((previousTransactions) => [
      ...previousTransactions,
      transactionData,
    ]);

    setIsModalOpen(false);
  };

  const filteredTransactions = useMemo(() => {
    if (selectedType === 'ALL') {
      return transactions;
    }

    return transactions.filter(
      (transaction) => transaction.type === selectedType
    );
  }, [transactions, selectedType]);

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
          />
        </div>

        <TransactionList
          transactions={filteredTransactions}
          accounts={accounts}
        />
      </div>
    </div>
  );
};

export default Transactions;