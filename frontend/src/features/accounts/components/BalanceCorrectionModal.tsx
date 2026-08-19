import React, { useState, useEffect } from 'react';
import { Account } from '../types/types';

interface BalanceCorrectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (accountId: string, newBalance: number) => void;
  account: Account | null;
}

const BalanceCorrectionModal: React.FC<BalanceCorrectionModalProps> = ({ isOpen, onClose, onSave, account }) => {
  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    if (account) {
      setBalance(account.balance);
    }
  }, [account, isOpen]);

  if (!isOpen || !account) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(account.id, balance);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Adjust Balance</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Account</label>
            <input type="text" className="form-control" value={account.name} disabled />
          </div>
          <div className="form-group">
            <label htmlFor="newBalance">Corrected Balance ({account.currency})</label>
            <input 
              type="number" 
              id="newBalance" 
              className="form-control" 
              value={balance} 
              onChange={(e) => setBalance(parseFloat(e.target.value) || 0)} 
              step="0.01"
              required
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Balance</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BalanceCorrectionModal;
