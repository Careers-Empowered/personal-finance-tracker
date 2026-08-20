import { useEffect, useState } from "react";
import type { CSSProperties } from "react";

import api from "../../../shared/utils/api";

import type { ValidatedTransaction } from "../types/import";

interface Account {
  id: string;
  name: string;
  currency: string;
  balance: number;
  isPrimary: boolean;
}

interface AccountMappingProps {
  transactions: ValidatedTransaction[];
  onBack: () => void;
  onContinue: (accountId: string) => void;
}

const primaryButtonStyle: CSSProperties = {
  backgroundColor: "var(--color-primary)",
  color: "#ffffff",
  border: "none",
  borderRadius: "8px",
  padding: "0.7rem 1.25rem",
  fontFamily: "var(--font-body)",
  fontSize: "0.9rem",
  fontWeight: 600,
  cursor: "pointer",
};

const secondaryButtonStyle: CSSProperties = {
  backgroundColor: "#f1f3f4",
  color: "var(--color-text-dark)",
  border: "none",
  borderRadius: "8px",
  padding: "0.7rem 1.25rem",
  fontFamily: "var(--font-body)",
  fontSize: "0.9rem",
  fontWeight: 600,
  cursor: "pointer",
};

function AccountMapping({
  transactions,
  onBack,
  onContinue,
}: AccountMappingProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);

  const [selectedAccountId, setSelectedAccountId] =
    useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  /*
   * ============================================================
   * FETCH USER ACCOUNTS
   * ============================================================
   */

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          "/api/transactions/accounts"
        );

        const fetchedAccounts: Account[] =
          response.data;

        setAccounts(fetchedAccounts);

        /*
         * Automatically select the primary account
         * if one exists.
         */
        const primaryAccount =
          fetchedAccounts.find(
            (account) => account.isPrimary
          );

        if (primaryAccount) {
          setSelectedAccountId(
            primaryAccount.id
          );
        }
      } catch (err: any) {
        console.error(
          "Fetch accounts error:",
          err
        );

        setError(
          err?.response?.data?.error ||
            "Unable to load accounts."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  /*
   * ============================================================
   * CONTINUE
   * ============================================================
   */

  const handleContinue = () => {
    if (!selectedAccountId) {
      alert(
        "Please select the account where the entire import should be added."
      );

      return;
    }

    onContinue(selectedAccountId);
  };

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (loading) {
    return (
      <section
        style={{
          backgroundColor: "#ffffff",
          border:
            "1px solid var(--color-divider)",
          borderRadius: "16px",
          padding: "2rem",
          maxWidth: "900px",
          width: "100%",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "1.5rem",
            fontWeight: 600,
            color: "var(--color-text-dark)",
            marginBottom: "0.5rem",
          }}
        >
          Select Account
        </h2>

        <p
          style={{
            fontFamily: "var(--font-body)",
            color: "var(--color-text-muted)",
          }}
        >
          Loading your accounts...
        </p>
      </section>
    );
  }

  /*
   * ============================================================
   * ERROR
   * ============================================================
   */

  if (error) {
    return (
      <section
        style={{
          backgroundColor: "#ffffff",
          border:
            "1px solid var(--color-divider)",
          borderRadius: "16px",
          padding: "2rem",
          maxWidth: "900px",
          width: "100%",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "1.5rem",
            fontWeight: 600,
            color: "var(--color-text-dark)",
            marginBottom: "1rem",
          }}
        >
          Select Account
        </h2>

        <div
          style={{
            padding: "1rem",
            borderRadius: "8px",
            backgroundColor: "#fff1f0",
            border: "1px solid #f0b7b2",
            color: "#b42318",
            fontFamily: "var(--font-body)",
            fontSize: "0.9rem",
          }}
        >
          {error}
        </div>

        <div
          style={{
            marginTop: "2rem",
          }}
        >
          <button
            type="button"
            style={secondaryButtonStyle}
            onClick={onBack}
          >
            Back
          </button>
        </div>
      </section>
    );
  }

  /*
   * ============================================================
   * NO ACCOUNTS
   * ============================================================
   */

  if (accounts.length === 0) {
    return (
      <section
        style={{
          backgroundColor: "#ffffff",
          border:
            "1px solid var(--color-divider)",
          borderRadius: "16px",
          padding: "2rem",
          maxWidth: "900px",
          width: "100%",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "1.5rem",
            fontWeight: 600,
            color: "var(--color-text-dark)",
          }}
        >
          Select Account
        </h2>

        <div
          style={{
            marginTop: "1rem",
            padding: "1rem",
            borderRadius: "8px",
            backgroundColor: "#fff8f7",
            border: "1px solid #f0b7b2",
            color: "#b42318",
            fontSize: "0.9rem",
          }}
        >
          No accounts are available. Please create
          an account before importing transactions.
        </div>

        <div
          style={{
            marginTop: "2rem",
          }}
        >
          <button
            type="button"
            style={secondaryButtonStyle}
            onClick={onBack}
          >
            Back
          </button>
        </div>
      </section>
    );
  }

  /*
   * ============================================================
   * MAIN ACCOUNT SELECTION UI
   * ============================================================
   */

  return (
    <section
      style={{
        backgroundColor: "#ffffff",
        border:
          "1px solid var(--color-divider)",
        borderRadius: "16px",
        padding: "2rem",
        maxWidth: "900px",
        width: "100%",
      }}
    >
      {/* Header */}

      <div
        style={{
          marginBottom: "1.5rem",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "1.5rem",
            fontWeight: 600,
            color: "var(--color-text-dark)",
            marginBottom: "0.5rem",
          }}
        >
          Select Account
        </h2>

        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.95rem",
            color: "var(--color-text-muted)",
            margin: 0,
          }}
        >
          Select the account where the entire import
          file should be added.
        </p>
      </div>

      {/* Account selection */}

      <div
        style={{
          border:
            "1px solid var(--color-divider)",
          borderRadius: "12px",
          padding: "1.5rem",
          backgroundColor: "#fafafa",
        }}
      >
        <label
          htmlFor="import-account"
          style={{
            display: "block",
            fontFamily: "var(--font-body)",
            fontSize: "0.85rem",
            color: "var(--color-text-muted)",
            marginBottom: "0.5rem",
          }}
        >
          Import Into
        </label>

        <select
          id="import-account"
          value={selectedAccountId}
          onChange={(event) =>
            setSelectedAccountId(
              event.target.value
            )
          }
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "0.8rem",
            border:
              "1px solid var(--color-divider)",
            borderRadius: "8px",
            fontFamily: "var(--font-body)",
            fontSize: "0.95rem",
            backgroundColor: "#ffffff",
            cursor: "pointer",
          }}
        >
          <option value="">
            Select account
          </option>

          {accounts.map((account) => (
            <option
              key={account.id}
              value={account.id}
            >
              {account.name} ({account.currency})
            </option>
          ))}
        </select>
      </div>

      {/* Information */}

      <div
        style={{
          marginTop: "1.5rem",
          padding: "1rem",
          borderRadius: "8px",
          backgroundColor: "#f8f9fa",
          color: "var(--color-text-muted)",
          fontFamily: "var(--font-body)",
          fontSize: "0.85rem",
          lineHeight: 1.6,
        }}
      >
        <strong>
          {transactions.length}
        </strong>{" "}
        transactions will be imported into the
        selected account.
        <br />
        The CSV account names will not be used to
        select different database accounts.
        <br />
        The selected account balance will be updated
        automatically.
      </div>

      {/* Buttons */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "2rem",
          gap: "1rem",
        }}
      >
        <button
          type="button"
          style={secondaryButtonStyle}
          onClick={onBack}
        >
          Back
        </button>

        <button
          type="button"
          style={{
            ...primaryButtonStyle,
            opacity: selectedAccountId
              ? 1
              : 0.6,
          }}
          onClick={handleContinue}
          disabled={!selectedAccountId}
        >
          Continue to Import
        </button>
      </div>
    </section>
  );
}

export default AccountMapping;