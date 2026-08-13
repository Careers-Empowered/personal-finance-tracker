import React, { useState, useEffect } from "react";
import { Account } from "./types";
import { convertCurrency, DEFAULT_RATES } from "./currencyUtils";

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (account: Omit<Account, "id"> | Account) => void;
  accountToEdit?: Account;
  rates?: Record<string, number>; // 👈 Accept live rates prop
}

const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  onSave,
  accountToEdit,
  rates = DEFAULT_RATES,
}) => {
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    if (accountToEdit) {
      setName(accountToEdit.name);
      setCurrency(accountToEdit.currency);
      setBalance(accountToEdit.balance);
    } else {
      setName("");
      setCurrency("USD");
      setBalance(0);
    }
  }, [accountToEdit, isOpen]);

  if (!isOpen) return null;

  // Convert balance in real time using LIVE exchange rates when dropdown changes
  const handleCurrencyChange = (newCurrency: string) => {
    if (currency !== newCurrency && balance !== 0) {
      const converted = convertCurrency(balance, currency, newCurrency, rates);
      setBalance(Math.round(converted * 100) / 100);
    }
    setCurrency(newCurrency);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (accountToEdit) {
      onSave({
        ...accountToEdit,
        name,
        currency,
        balance,
        updatedAt: new Date().toISOString(),
      });
    } else {
      onSave({
        name,
        currency,
        balance,
        userId: "user-123",
        isPrimary: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Omit<Account, "id">);
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{accountToEdit ? "Edit Account" : "Add New Account"}</h2>
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
              onChange={(e) => handleCurrencyChange(e.target.value)}
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="INR">INR (₹)</option>
              <option value="JPY">JPY (¥)</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="accountBalance">Balance</label>
            <input
              type="number"
              id="accountBalance"
              className="form-control"
              value={balance}
              onChange={(e) => setBalance(parseFloat(e.target.value) || 0)}
              step="0.01"
            />
          </div>
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountModal;
