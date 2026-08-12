import React, { useState, useEffect } from 'react';
import { Account } from './types';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (account: Omit<Account, 'id'> | Account) => void;
  accountToEdit?: Account;
}

const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose, onSave, accountToEdit }) => {
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    if (accountToEdit) {
      setName(accountToEdit.name);
      setCurrency(accountToEdit.currency);
      setBalance(accountToEdit.balance);
    } else {
      setName('');
      setCurrency('USD');
      setBalance(0);
    }
  }, [accountToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const accountData = {
      name,
      currency,
      balance: accountToEdit ? accountToEdit.balance : balance, // only set balance if new
    };

    if (accountToEdit) {
      onSave({ ...accountData, id: accountToEdit.id });
    } else {
      onSave(accountData);
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{accountToEdit ? 'Edit Account' : 'Add New Account'}</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="accountName">Account Name</label>
            <input 
              type="text" 
              id="accountName" 
              className="form-control" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
              placeholder="e.g. Chase Checking"
            />
          </div>
          <div className="form-group">
            <label htmlFor="accountCurrency">Currency</label>
            <select 
              id="accountCurrency" 
              className="form-control" 
              value={currency} 
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="INR">INR (₹)</option>
              <option value="JPY">JPY (¥)</option>
            </select>
          </div>
          {!accountToEdit && (
            <div className="form-group">
              <label htmlFor="accountBalance">Initial Balance</label>
              <input 
                type="number" 
                id="accountBalance" 
                className="form-control" 
                value={balance} 
                onChange={(e) => setBalance(parseFloat(e.target.value) || 0)} 
                step="0.01"
              />
            </div>
          )}
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Account</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountModal;
