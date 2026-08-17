import React from 'react';
import { Account } from './types';

interface AccountCardProps {
  account: Account;
  onEdit: (account: Account) => void;
  onAdjustBalance: (account: Account) => void;
  onTransfer: (account: Account) => void;
  onSetPrimary: (id: string) => void;
  onDelete: (id: string) => void;
}

const AccountCard: React.FC<AccountCardProps> = ({ account, onEdit, onAdjustBalance, onTransfer, onSetPrimary, onDelete }) => {
  const isNegative = account.balance < 0;
  const formattedBalance = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: account.currency,
  }).format(account.balance);

  return (
    <div className={`account-card ${account.isPrimary ? 'primary' : ''}`} style={account.isPrimary ? { borderColor: 'var(--color-primary)', borderWidth: '2px' } : {}}>
      <div className="account-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div className="account-name">{account.name}</div>
          {account.isPrimary && (
            <span style={{ fontSize: '0.7rem', backgroundColor: 'var(--color-primary)', color: 'white', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 'bold' }}>
              PRIMARY
            </span>
          )}
        </div>
        <div className="account-currency">{account.currency}</div>
      </div>
      <div className={`account-balance ${isNegative ? 'negative' : ''}`}>
        {formattedBalance}
      </div>
      <div className="account-actions">
        <button 
          className="icon-btn" 
          onClick={() => onTransfer(account)}
          title="Transfer Funds"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m16 3 4 4-4 4" />
            <path d="M20 7H4" />
            <path d="m8 21-4-4 4-4" />
            <path d="M4 17h16" />
          </svg>
        </button>
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
        {!account.isPrimary && (
          <button 
            className="icon-btn" 
            onClick={() => onSetPrimary(account.id)}
            title="Set as Primary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>
        )}
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
