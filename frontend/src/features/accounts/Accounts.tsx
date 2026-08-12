import React, { useState, useEffect } from 'react';
import { Account } from './types';
import mockData from './mockData.json';
import AccountCard from './AccountCard';
import AccountModal from './AccountModal';
import BalanceCorrectionModal from './BalanceCorrectionModal';
import PrimaryCurrencyModal from './PrimaryCurrencyModal';
import './Accounts.css';

const Accounts: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>(mockData as Account[]);
  const [primaryCurrency, setPrimaryCurrency] = useState('USD');

  // Modals state
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  
  // Track which account is being edited/adjusted
  const [selectedAccount, setSelectedAccount] = useState<Account | undefined>(undefined);

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
  const formattedTotal = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: primaryCurrency,
  }).format(totalBalance);

  // Handlers for Account Modal (Create / Edit)
  const handleOpenCreateModal = () => {
    setSelectedAccount(undefined);
    setIsAccountModalOpen(true);
  };

  const handleOpenEditModal = (account: Account) => {
    setSelectedAccount(account);
    setIsAccountModalOpen(true);
  };

  const handleSaveAccount = (accountData: Omit<Account, 'id'> | Account) => {
    if ('id' in accountData) {
      // Edit existing
      setAccounts(prev => prev.map(acc => acc.id === accountData.id ? accountData as Account : acc));
    } else {
      // Create new
      const newAccount: Account = {
        ...accountData,
        id: Math.random().toString(36).substr(2, 9),
      };
      setAccounts(prev => [...prev, newAccount]);
    }
  };

  // Handlers for Balance Correction
  const handleOpenAdjustBalance = (account: Account) => {
    setSelectedAccount(account);
    setIsBalanceModalOpen(true);
  };

  const handleSaveBalance = (id: string, newBalance: number) => {
    setAccounts(prev => prev.map(acc => acc.id === id ? { ...acc, balance: newBalance } : acc));
  };

  // Handlers for Deletion
  const handleDeleteAccount = (id: string) => {
    if (window.confirm("Are you sure you want to delete this account?")) {
      setAccounts(prev => prev.filter(acc => acc.id !== id));
    }
  };

  return (
    <div className="accounts-container">
      <div className="accounts-header">
        <div className="total-balance-section">
          <h1>{formattedTotal}</h1>
          <p onClick={() => setIsCurrencyModalOpen(true)}>
            Total Balance in {primaryCurrency}
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={handleOpenCreateModal}>
            + Add Account
          </button>
        </div>
      </div>

      <div className="accounts-grid">
        {accounts.map(account => (
          <AccountCard 
            key={account.id} 
            account={account} 
            onEdit={handleOpenEditModal}
            onAdjustBalance={handleOpenAdjustBalance}
            onDelete={handleDeleteAccount}
          />
        ))}
      </div>

      {/* Modals */}
      <AccountModal 
        isOpen={isAccountModalOpen} 
        onClose={() => setIsAccountModalOpen(false)} 
        onSave={handleSaveAccount}
        accountToEdit={selectedAccount}
      />

      <BalanceCorrectionModal
        isOpen={isBalanceModalOpen}
        onClose={() => setIsBalanceModalOpen(false)}
        onSave={handleSaveBalance}
        account={selectedAccount || null}
      />

      <PrimaryCurrencyModal
        isOpen={isCurrencyModalOpen}
        onClose={() => setIsCurrencyModalOpen(false)}
        currentCurrency={primaryCurrency}
        onSave={setPrimaryCurrency}
      />
    </div>
  );
};

export default Accounts;