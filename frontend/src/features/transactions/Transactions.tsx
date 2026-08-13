import React, { useState } from 'react';
import TransactionModal from './TransactionModal';
import { CreateTransactionInput } from './types';
import { Account } from '../accounts/types';
import accountMockData from '../accounts/mockData.json';
import '../accounts/Accounts.css';
import './Transactions.css';

const Transactions: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const accounts: Account[] = accountMockData as Account[];

  const handleSaveTransaction = (transactionData: CreateTransactionInput) => {
    console.log('Transaction submitted:', transactionData);
  };

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
    </div>
  );
};

export default Transactions;
