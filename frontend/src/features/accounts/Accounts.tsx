import React, { useState, useEffect } from "react";
import { Account } from "./types/types";
import AccountCard from "./components/AccountCard";
import AccountModal from "./components/AccountModal";
import BalanceCorrectionModal from "./components/BalanceCorrectionModal";
import PrimaryCurrencyModal from "./components/PrimaryCurrencyModal";
import TransferModal from "./components/TransferModal";
import { convertCurrency } from "./utils/currencyUtils";
import { useExchangeRates } from "./hooks/useExchangeRates";
import { accountApi } from "./api/account.api";

const Accounts: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [primaryCurrency, setPrimaryCurrency] = useState("USD");
  const { rates, loading } = useExchangeRates(); 
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);

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

  const fetchAccounts = async () => {
    try {
      setIsLoadingAccounts(true);
      const data = await accountApi.getAccounts();
      setAccounts(data);
    } catch (error) {
      console.error("Failed to load accounts", error);
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

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

  const handleSaveAccount = async (accountData: Omit<Account, "id" | "createdAt" | "updatedAt"> | Account) => {
    try {
      if ("id" in accountData) {
        await accountApi.updateAccount(accountData.id, accountData);
      } else {
        await accountApi.createAccount(accountData);
      }
      await fetchAccounts();
    } catch (error) {
      console.error("Failed to save account", error);
      alert("Failed to save account");
    }
  };

  const handleOpenAdjustBalance = (account: Account) => {
    setSelectedAccount(account);
    setIsBalanceModalOpen(true);
  };

  const handleSaveBalance = async (id: string, newBalance: number) => {
    try {
      await accountApi.updateBalance(id, newBalance);
      await fetchAccounts();
    } catch (error) {
      console.error("Failed to update balance", error);
      alert("Failed to update balance");
    }
  };

  const handleTransfer = async (
    sourceId: string,
    destId: string,
    sourceAmount: number,
    convertedAmount: number
  ) => {
    try {
      await accountApi.transferBalance(sourceId, destId, sourceAmount, convertedAmount);
      await fetchAccounts();
    } catch (error) {
      console.error("Failed to transfer balance", error);
      alert("Failed to transfer balance");
    }
  };

  const handleDeleteAccount = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this account?")) {
      try {
        await accountApi.deleteAccount(id);
        await fetchAccounts();
      } catch (error) {
        console.error("Failed to delete account", error);
        alert("Failed to delete account");
      }
    }
  };

  const handleSetPrimary = async (id: string) => {
    try {
      await accountApi.updateAccount(id, { isPrimary: true });
      await fetchAccounts();
    } catch (error) {
      console.error("Failed to set primary account", error);
      alert("Failed to set primary account");
    }
  };

  if (isLoadingAccounts) {
    return <div className="accounts-container">Loading accounts...</div>;
  }

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
        {accounts.length === 0 && (
          <div style={{ color: "var(--color-text-muted)" }}>
            No accounts found. Create one to get started.
          </div>
        )}
      </div>

      {/* Modals */}
      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        onSave={handleSaveAccount}
        accountToEdit={selectedAccount}
        rates={rates}
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
