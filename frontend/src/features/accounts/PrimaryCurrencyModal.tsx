import React, { useState, useEffect } from 'react';

interface PrimaryCurrencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCurrency: string;
  onSave: (currency: string) => void;
}

const PrimaryCurrencyModal: React.FC<PrimaryCurrencyModalProps> = ({ isOpen, onClose, currentCurrency, onSave }) => {
  const [currency, setCurrency] = useState(currentCurrency);

  useEffect(() => {
    setCurrency(currentCurrency);
  }, [currentCurrency, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(currency);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Set Primary Currency</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="primaryCurrency">Primary Currency</label>
            <select 
              id="primaryCurrency" 
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
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            This currency will be used to display your total net worth and combined balances. (Conversion rates in this mock version are 1:1 for simplicity).
          </p>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PrimaryCurrencyModal;
