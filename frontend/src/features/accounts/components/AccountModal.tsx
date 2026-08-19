import React, { useState, useEffect } from "react";
import { Account } from "../types/types";
import { convertCurrency, DEFAULT_RATES } from "../utils/currencyUtils";

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (account: Omit<Account, "id"> | Account) => void;
  accountToEdit?: Account;
  rates?: Record<string, number>;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  INR: "₹",
  JPY: "¥",
};

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
  const [balanceInput, setBalanceInput] = useState<string>("0");
  const [originalCurrency, setOriginalCurrency] = useState<string>("USD");
  const [originalBalance, setOriginalBalance] = useState<number>(0);

  useEffect(() => {
    if (accountToEdit) {
      const initialBalance = Math.max(0, Math.round(accountToEdit.balance * 100) / 100);
      setName(accountToEdit.name);
      setCurrency(accountToEdit.currency);
      setBalance(initialBalance);
      setBalanceInput(initialBalance.toString());
      setOriginalCurrency(accountToEdit.currency);
      setOriginalBalance(accountToEdit.balance);
    } else {
      setName("");
      setCurrency("USD");
      setBalance(0);
      setBalanceInput("0");
      setOriginalCurrency("USD");
      setOriginalBalance(0);
    }
  }, [accountToEdit, isOpen]);

  if (!isOpen) return null;

  // Convert balance in real time using LIVE exchange rates when dropdown changes
  const handleCurrencyChange = (newCurrency: string) => {
    if (currency !== newCurrency && balance > 0) {
      const converted = convertCurrency(balance, currency, newCurrency, rates);
      const cleanBalance = Math.max(0, Math.round(converted * 100) / 100);
      setBalance(cleanBalance);
      setBalanceInput(cleanBalance.toString());
    }
    setCurrency(newCurrency);
  };

  const handleBalanceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setBalanceInput(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed)) {
      setBalance(Math.max(0, parsed));
    } else {
      setBalance(0);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalBalance = Math.max(0, Math.round(balance * 100) / 100);

    if (accountToEdit) {
      onSave({
        ...accountToEdit,
        name: name.trim(),
        currency,
        balance: finalBalance,
        updatedAt: new Date().toISOString(),
      });
    } else {
      onSave({
        name: name.trim(),
        currency,
        balance: finalBalance,
        userId: "user-123",
        isPrimary: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Omit<Account, "id">);
    }
    onClose();
  };

  const isCurrencyChanged =
    Boolean(accountToEdit) && currency !== originalCurrency;

  // Exchange rate calculation for warning banner
  const rateToNew = convertCurrency(1, originalCurrency, currency, rates);
  const rateReverse = convertCurrency(1, currency, originalCurrency, rates);

  const formattedOriginalBalance = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: originalCurrency,
  }).format(Math.max(0, originalBalance));

  const formattedNewBalance = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(balance);

  const currencySymbol = CURRENCY_SYMBOLS[currency] || currency;

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

            {/* Currency Change Warning & Conversion Preview */}
            {isCurrencyChanged && (
              <div
                style={{
                  marginTop: "0.75rem",
                  padding: "0.85rem 1rem",
                  borderRadius: "8px",
                  fontSize: "0.85rem",
                  lineHeight: "1.4",
                  backgroundColor: "rgba(211, 131, 51, 0.08)",
                  border: "1px solid rgba(211, 131, 51, 0.3)",
                  color: "var(--color-charcoal)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    fontWeight: 600,
                    color: "var(--color-primary)",
                    marginBottom: "0.35rem",
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>Currency Conversion Notice</span>
                </div>

                <p style={{ margin: "0 0 0.4rem 0" }}>
                  Converting balance from <strong>{originalCurrency}</strong> to{" "}
                  <strong>{currency}</strong>:
                </p>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.4rem 0.6rem",
                    backgroundColor: "#ffffff",
                    borderRadius: "6px",
                    border: "1px solid var(--color-divider)",
                    fontWeight: 600,
                    marginBottom: "0.4rem",
                  }}
                >
                  <span style={{ color: "var(--color-text-muted)" }}>
                    {formattedOriginalBalance}
                  </span>
                  <span>&rarr;</span>
                  <span style={{ color: "var(--color-primary)" }}>
                    {formattedNewBalance}
                  </span>
                </div>

                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--color-text-muted)",
                  }}
                >
                  &bull; <strong>Exchange Rate:</strong> 1 {currency} &asymp;{" "}
                  {rateReverse > 0 ? rateReverse.toFixed(2) : "1.00"}{" "}
                  {originalCurrency} (1 {originalCurrency} &asymp;{" "}
                  {rateToNew > 0 ? rateToNew.toFixed(4) : "1.00"} {currency})
                </div>
              </div>
            )}
          </div>

          {!accountToEdit && (
            <div className="form-group">
              <label htmlFor="accountBalance">
                Initial Balance ({currency} {currencySymbol})
              </label>
              <input
                type="number"
                id="accountBalance"
                className="form-control"
                value={balanceInput}
                onChange={handleBalanceInputChange}
                min="0"
                step="0.01"
                required
              />
            </div>
          )}

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
