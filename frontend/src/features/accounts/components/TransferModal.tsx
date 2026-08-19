import React, { useState, useEffect } from "react";
import { Account } from "../types/types";
import { convertCurrency, DEFAULT_RATES } from "../utils/currencyUtils";

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransfer: (
    sourceAccountId: string,
    destinationAccountId: string,
    sourceAmount: number,
    convertedAmount: number
  ) => void;
  sourceAccount?: Account;
  accounts: Account[];
  rates?: Record<string, number>;
}

const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  onTransfer,
  sourceAccount,
  accounts,
  rates = DEFAULT_RATES,
}) => {
  if (!isOpen || !sourceAccount) return null;

  // Filter out the source account so it cannot transfer to itself
  const availableDestinations = accounts.filter(
    (acc) => acc.id !== sourceAccount.id
  );

  const [destinationId, setDestinationId] = useState<string>(
    availableDestinations.length > 0 ? availableDestinations[0].id : ""
  );
  const [transferEntireBalance, setTransferEntireBalance] = useState(true);
  const [amount, setAmount] = useState<number>(
    sourceAccount.balance > 0 ? sourceAccount.balance : 0
  );
  const [error, setError] = useState<string | null>(null);

  // Sync state whenever sourceAccount or modal opening state changes
  useEffect(() => {
    if (availableDestinations.length > 0) {
      // Default to first available destination account
      setDestinationId(availableDestinations[0].id);
    }
    if (sourceAccount) {
      setAmount(sourceAccount.balance > 0 ? sourceAccount.balance : 0);
      setTransferEntireBalance(true);
      setError(null);
    }
  }, [sourceAccount?.id, isOpen]);

  const targetAccount = accounts.find((acc) => acc.id === destinationId);

  // Calculate transfer amount and converted amount
  const transferAmount = transferEntireBalance ? sourceAccount.balance : amount;
  const isDifferentCurrency =
    targetAccount && targetAccount.currency !== sourceAccount.currency;

  const convertedAmount =
    targetAccount && transferAmount > 0
      ? convertCurrency(
          transferAmount,
          sourceAccount.currency,
          targetAccount.currency,
          rates
        )
      : 0;

  // Unit rate for display (e.g. 1 INR = 0.0119 USD)
  const unitRate = targetAccount
    ? convertCurrency(1, sourceAccount.currency, targetAccount.currency, rates)
    : 1;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!targetAccount) {
      setError("Please select a destination account.");
      return;
    }

    if (transferAmount <= 0) {
      setError("Transfer amount must be greater than zero.");
      return;
    }

    if (transferAmount > sourceAccount.balance) {
      setError("Transfer amount exceeds available account balance.");
      return;
    }

    onTransfer(
      sourceAccount.id,
      targetAccount.id,
      Math.round(transferAmount * 100) / 100,
      Math.round(convertedAmount * 100) / 100
    );
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Transfer Funds</h2>
          <p className="transfer-source-subtitle">
            From: <strong>{sourceAccount.name}</strong> ({sourceAccount.currency}) &bull; Available:{" "}
            <strong>
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: sourceAccount.currency,
              }).format(sourceAccount.balance)}
            </strong>
          </p>
        </div>

        {availableDestinations.length === 0 ? (
          <div>
            <p style={{ color: "var(--color-text-muted)", margin: "1.5rem 0" }}>
              You need at least 2 accounts to make a transfer. Please add another account first.
            </p>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Destination Account Selection Dropdown */}
            <div className="form-group">
              <label htmlFor="destinationAccount">Destination Account</label>
              <select
                id="destinationAccount"
                className="form-control"
                value={destinationId}
                onChange={(e) => setDestinationId(e.target.value)}
                required
              >
                {availableDestinations.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.currency}) &mdash; Balance:{" "}
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: acc.currency,
                    }).format(acc.balance)}
                  </option>
                ))}
              </select>
            </div>

            {/* Transfer Amount & Transfer Entire Balance Checkbox */}
            <div className="form-group">
              <div className="transfer-amount-header">
                <label htmlFor="transferAmount">
                  Amount ({sourceAccount.currency})
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={transferEntireBalance}
                    onChange={(e) => {
                      setTransferEntireBalance(e.target.checked);
                      if (e.target.checked) {
                        setAmount(sourceAccount.balance > 0 ? sourceAccount.balance : 0);
                      }
                    }}
                  />
                  <span>Transfer entire balance</span>
                </label>
              </div>

              <input
                type="number"
                id="transferAmount"
                className="form-control"
                value={transferEntireBalance ? (sourceAccount.balance > 0 ? sourceAccount.balance : 0) : amount}
                onChange={(e) => {
                  setTransferEntireBalance(false);
                  setAmount(parseFloat(e.target.value) || 0);
                }}
                disabled={transferEntireBalance}
                step="0.01"
                min="0.01"
                max={sourceAccount.balance > 0 ? sourceAccount.balance : 0}
                required
              />
            </div>

            {/* Live Conversion & Balances Preview Card */}
            {targetAccount && transferAmount > 0 && (
              <div className="transfer-preview-card">
                {isDifferentCurrency && (
                  <div className="preview-row">
                    <span className="preview-label">Exchange Rate:</span>
                    <span className="preview-val">
                      1 {sourceAccount.currency} &asymp; {unitRate.toFixed(4)}{" "}
                      {targetAccount.currency}
                    </span>
                  </div>
                )}

                <div className="preview-row highlight">
                  <span className="preview-label">Recipient Receives:</span>
                  <span className="preview-val recipient-amount">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: targetAccount.currency,
                    }).format(convertedAmount)}
                  </span>
                </div>

                <div className="preview-balances-summary">
                  <div className="balance-projection">
                    <span>{sourceAccount.name} after transfer:</span>
                    <strong>
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: sourceAccount.currency,
                      }).format(Math.max(0, sourceAccount.balance - transferAmount))}
                    </strong>
                  </div>
                  <div className="balance-projection">
                    <span>{targetAccount.name} after transfer:</span>
                    <strong>
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: targetAccount.currency,
                      }).format(targetAccount.balance + convertedAmount)}
                    </strong>
                  </div>
                </div>
              </div>
            )}

            {error && <div className="transfer-error">{error}</div>}

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={sourceAccount.balance <= 0}
              >
                Confirm Transfer
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default TransferModal;
