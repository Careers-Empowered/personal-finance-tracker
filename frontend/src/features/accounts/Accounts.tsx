import React, { useState } from "react";
import { Account } from "./types";
import mockData from "./mockData.json";
import AccountCard from "./AccountCard";
import AccountModal from "./AccountModal";
import BalanceCorrectionModal from "./BalanceCorrectionModal";
import PrimaryCurrencyModal from "./PrimaryCurrencyModal";
import TransferModal from "./TransferModal";
import { convertCurrency } from "./currencyUtils";
import { useExchangeRates } from "./useExchangeRates"; // 👈 Import live rates hook
import "./Accounts.css";

const Accounts: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>(mockData as Account[]);
  const [primaryCurrency, setPrimaryCurrency] = useState("USD");
  const { rates, loading } = useExchangeRates(); // 👈 Live rates from API

  // Modals state
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | undefined>(
    undefined,
  );
  const [transferSourceAccount, setTransferSourceAccount] = useState<
    Account | undefined
  >(undefined);

  // Dynamic Total Balance calculation using LIVE API rates
  const totalBalance = accounts.reduce((sum, account) => {
    const convertedAmount = convertCurrency(
      account.balance,
      account.currency,
      primaryCurrency,
      rates,
    );
    return sum + convertedAmount;
  }, 0);

  const formattedTotal = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: primaryCurrency,
  }).format(totalBalance);

  const handleOpenCreateModal = () => {
    setSelectedAccount(undefined);
    setIsAccountModalOpen(true);
  };

  const handleOpenEditModal = (account: Account) => {
    setSelectedAccount(account);
    setIsAccountModalOpen(true);
  };

  const handleOpenTransferModal = (account: Account) => {
    setTransferSourceAccount(account);
    setIsTransferModalOpen(true);
  };

  const handleSaveAccount = (accountData: Omit<Account, "id"> | Account) => {
    if ("id" in accountData) {
      setAccounts((prev) =>
        prev.map((acc) =>
          acc.id === accountData.id ? (accountData as Account) : acc,
        ),
      );
    } else {
      const newAccount: Account = {
        ...accountData,
        id: Math.random().toString(36).substr(2, 9),
      };
      setAccounts((prev) => [...prev, newAccount]);
    }
  };

  const handleOpenAdjustBalance = (account: Account) => {
    setSelectedAccount(account);
    setIsBalanceModalOpen(true);
  };

  const handleSaveBalance = (id: string, newBalance: number) => {
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === id ? { ...acc, balance: newBalance } : acc,
      ),
    );
  };

  const handleTransfer = (
    sourceId: string,
    destId: string,
    sourceAmount: number,
    convertedAmount: number
  ) => {
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === sourceId) {
          const newBalance = Math.round((acc.balance - sourceAmount) * 100) / 100;
          return {
            ...acc,
            balance: newBalance,
            updatedAt: new Date().toISOString(),
          };
        }
        if (acc.id === destId) {
          const newBalance = Math.round((acc.balance + convertedAmount) * 100) / 100;
          return {
            ...acc,
            balance: newBalance,
            updatedAt: new Date().toISOString(),
          };
        }
        return acc;
      })
    );
  };

  const handleDeleteAccount = (id: string) => {
    if (window.confirm("Are you sure you want to delete this account?")) {
      setAccounts((prev) => prev.filter((acc) => acc.id !== id));
    }
  };

  const handleSetPrimary = (id: string) => {
    setAccounts((prev) =>
      prev.map((acc) => ({
        ...acc,
        isPrimary: acc.id === id,
      })),
    );
  };

  return (
    <div className="accounts-container">
      <div className="accounts-header">
        <div className="total-balance-section">
          <h1>{formattedTotal}</h1>
          <p
            onClick={() => setIsCurrencyModalOpen(true)}
            style={{ cursor: "pointer" }}
          >
            Total Balance in {primaryCurrency}{" "}
            {loading ? "(Updating rates...)" : ""}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
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
        {accounts.map((account) => (
          <AccountCard
            key={account.id}
            account={account}
            onEdit={handleOpenEditModal}
            onAdjustBalance={handleOpenAdjustBalance}
            onTransfer={handleOpenTransferModal}
            onSetPrimary={handleSetPrimary}
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
        rates={rates} // 👈 Pass live rates to modal for accurate conversion
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

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        onTransfer={handleTransfer}
        sourceAccount={transferSourceAccount}
        accounts={accounts}
        rates={rates}
      />
    </div>
  );
};

export default Accounts;
