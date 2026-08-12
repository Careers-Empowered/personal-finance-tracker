import React from 'react';
import { Account } from './types';

interface AccountCardProps {
  account: Account;
  onEdit: (account: Account) => void;
  onAdjustBalance: (account: Account) => void;
  onDelete: (id: string) => void;
}

const AccountCard: React.FC<AccountCardProps> = ({ account, onEdit, onAdjustBalance, onDelete }) => {
  const isNegative = account.balance < 0;
  const formattedBalance = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: account.currency,
  }).format(account.balance);

  return (
    <div className="account-card">
      <div className="account-card-header">
        <div className="account-name">{account.name}</div>
        <div className="account-currency">{account.currency}</div>
      </div>
      <div className={`account-balance ${isNegative ? 'negative' : ''}`}>
        {formattedBalance}
      </div>
      <div className="account-actions">
        <button 
          className="icon-btn" 
          onClick={() => onEdit(account)}
          title="Edit Account"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
        <button 
          className="icon-btn" 
          onClick={() => onAdjustBalance(account)}
          title="Adjust Balance"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </button>
        <button 
          className="icon-btn danger" 
          onClick={() => onDelete(account.id)}
          title="Delete Account"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default AccountCard;
