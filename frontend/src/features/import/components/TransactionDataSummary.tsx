import { useEffect, useState } from "react";
import type { CSSProperties } from "react";

import type { TransactionDataSummary as TransactionDataSummaryType } from "../types/import";
import { parseTransactionData } from "../utils/transactionDataParser";

interface TransactionDataSummaryProps {
  file: File;
  onContinue: () => void;
  onBack: () => void;
}

const primaryButtonStyle: CSSProperties = {
  backgroundColor: "var(--color-primary)",
  color: "#ffffff",
  border: "none",
  borderRadius: "8px",
  padding: "0.75rem 1.5rem",
  fontFamily: "var(--font-body)",
  fontSize: "0.95rem",
  fontWeight: 600,
  cursor: "pointer",
};

const secondaryButtonStyle: CSSProperties = {
  backgroundColor: "#f1f3f4",
  color: "var(--color-text-dark)",
  border: "none",
  borderRadius: "8px",
  padding: "0.75rem 1.5rem",
  fontFamily: "var(--font-body)",
  fontSize: "0.95rem",
  fontWeight: 600,
  cursor: "pointer",
};

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function TransactionDataSummary({
  file,
  onContinue,
  onBack,
}: TransactionDataSummaryProps) {
  const [summary, setSummary] =
    useState<TransactionDataSummaryType | null>(null);

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTransactionData = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await parseTransactionData(file);

        setSummary({
          fileName: file.name,
          transactionCount: result.transactionCount,
          earliestDate: formatDate(result.earliestDate),
          latestDate: formatDate(result.latestDate),
        });
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to read the transaction file."
        );
      } finally {
        setLoading(false);
      }
    };

    loadTransactionData();
  }, [file]);

  if (loading) {
    return (
      <section
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid var(--color-divider)",
          borderRadius: "16px",
          padding: "2rem",
          maxWidth: "900px",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-body)",
            color: "var(--color-text-muted)",
          }}
        >
          Reading transaction data...
        </p>
      </section>
    );
  }

  if (error) {
    return (
      <section
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid var(--color-divider)",
          borderRadius: "16px",
          padding: "2rem",
          maxWidth: "900px",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "1.25rem",
            color: "var(--color-text-dark)",
            marginBottom: "1rem",
          }}
        >
          Unable to read transaction data
        </h2>

        <p
          style={{
            padding: "0.75rem 1rem",
            borderRadius: "8px",
            backgroundColor: "#fff5f4",
            border: "1px solid #e5c5c2",
            color: "#b42318",
            fontFamily: "var(--font-body)",
            fontSize: "0.85rem",
            marginBottom: "1.5rem",
          }}
        >
          {error}
        </p>

        <button
          type="button"
          style={secondaryButtonStyle}
          onClick={onBack}
        >
          Choose Another File
        </button>
      </section>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <section
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid var(--color-divider)",
        borderRadius: "16px",
        padding: "2rem",
        maxWidth: "900px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "10px",
            backgroundColor: "#fff1e3",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.5rem",
            flexShrink: 0,
          }}
        >
          📄
        </div>

        <div>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "1rem",
              fontWeight: 600,
              color: "var(--color-text-dark)",
              margin: 0,
            }}
          >
            {summary.fileName}
          </p>
        </div>
      </div>

      <div
        style={{
          marginTop: "1.75rem",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.9rem",
            color: "var(--color-text-muted)",
            marginBottom: "0.4rem",
          }}
        >
          Transactions found
        </p>

        <p
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "1.25rem",
            fontWeight: 600,
            color: "var(--color-text-dark)",
            margin: 0,
          }}
        >
          {summary.transactionCount}
        </p>
      </div>

      <div
        style={{
          marginTop: "1.5rem",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.9rem",
            color: "var(--color-text-muted)",
            marginBottom: "0.4rem",
          }}
        >
          Transaction period
        </p>

        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "1rem",
            fontWeight: 600,
            color: "var(--color-text-dark)",
            margin: 0,
          }}
        >
          {summary.earliestDate} → {summary.latestDate}
        </p>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
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
          style={primaryButtonStyle}
          onClick={onContinue}
        >
          Continue
        </button>
      </div>
    </section>
  );
}

export default TransactionDataSummary;