import type { CSSProperties } from "react";
import type { ValidatedTransaction } from "../types/import";

interface DuplicateDetectionProps {
  transactions: ValidatedTransaction[];
  onBack?: () => void;
  onContinue: (
    transactions: ValidatedTransaction[]
  ) => void;
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

function DuplicateDetection({
  transactions,
  onBack,
  onContinue,
}: DuplicateDetectionProps) {
  const duplicates = transactions.filter((transaction) =>
    transaction.errors.some(
      (error) =>
        error.field === "transaction" &&
        error.message.toLowerCase().includes("duplicate")
    )
  );

  const uniqueTransactions = transactions.filter(
    (transaction) =>
      !transaction.errors.some(
        (error) =>
          error.field === "transaction" &&
          error.message.toLowerCase().includes("duplicate")
      )
  );

  return (
    <section
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid var(--color-divider)",
        borderRadius: "16px",
        padding: "2rem",
        maxWidth: "1000px",
        width: "100%",
      }}
    >
      <div style={{ marginBottom: "1.5rem" }}>
        <h2
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "1.5rem",
            fontWeight: 600,
            color: "var(--color-text-dark)",
            marginBottom: "0.5rem",
          }}
        >
          Duplicate Detection
        </h2>

        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.95rem",
            color: "var(--color-text-muted)",
          }}
        >
          Review duplicate transactions before importing them.
        </p>
      </div>

      {/* Summary */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <Summary
          label="Transactions Checked"
          value={transactions.length}
        />

        <Summary
          label="Duplicates Found"
          value={duplicates.length}
          negative={duplicates.length > 0}
        />

        <Summary
          label="Unique Transactions"
          value={uniqueTransactions.length}
          positive
        />
      </div>

      {/* Results */}
      {duplicates.length === 0 ? (
        <div
          style={{
            padding: "1.5rem",
            borderRadius: "10px",
            backgroundColor: "#f0fdf4",
            color: "#188038",
            fontWeight: 600,
            marginBottom: "2rem",
          }}
        >
          ✓ No duplicate transactions found.
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          {duplicates.map((duplicate) => {
            const duplicateError = duplicate.errors.find(
              (error) =>
                error.field === "transaction" &&
                error.message
                  .toLowerCase()
                  .includes("duplicate")
            );

            return (
              <div
                key={duplicate.row}
                style={{
                  border: "1px solid #f0b7b2",
                  borderRadius: "10px",
                  padding: "1.25rem",
                  backgroundColor: "#fff8f7",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "1rem",
                  }}
                >
                  <strong>
                    Row {duplicate.row}
                  </strong>

                  <span
                    style={{
                      color: "#b42318",
                      fontWeight: 600,
                    }}
                  >
                    ⚠ Duplicate
                  </span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "1rem",
                  }}
                >
                  <Info
                    label="Date"
                    value={duplicate.data.date}
                  />

                  <Info
                    label="Description"
                    value={duplicate.data.title}
                  />

                  <Info
                    label="Amount"
                    value={String(duplicate.data.amount)}
                  />

                  <Info
                    label="Type"
                    value={duplicate.data.type}
                  />

                  <Info
                    label="Account"
                    value={duplicate.data.account}
                  />
                </div>

                {duplicateError && (
                  <div
                    style={{
                      marginTop: "1rem",
                      padding: "0.75rem",
                      borderRadius: "8px",
                      backgroundColor: "#fff1f0",
                      color: "#b42318",
                      fontSize: "0.85rem",
                    }}
                  >
                    {duplicateError.message}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Actions */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
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

        <button
          type="button"
          style={primaryButtonStyle}
          onClick={() => onContinue(uniqueTransactions)}
        >
          Continue with {uniqueTransactions.length} Transactions
        </button>
      </div>
    </section>
  );
}

function Summary({
  label,
  value,
  positive,
  negative,
}: {
  label: string;
  value: number;
  positive?: boolean;
  negative?: boolean;
}) {
  return (
    <div
      style={{
        border: "1px solid var(--color-divider)",
        borderRadius: "10px",
        padding: "1rem",
      }}
    >
      <div
        style={{
          fontSize: "0.8rem",
          color: negative
            ? "#b42318"
            : positive
            ? "#188038"
            : "var(--color-text-muted)",
          marginBottom: "0.25rem",
        }}
      >
        {label}
      </div>

      <strong
        style={{
          fontSize: "1.3rem",
          color: "var(--color-text-dark)",
        }}
      >
        {value}
      </strong>
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <div
        style={{
          fontSize: "0.75rem",
          color: "var(--color-text-muted)",
          marginBottom: "0.2rem",
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: "0.9rem",
          color: "var(--color-text-dark)",
          fontWeight: 500,
        }}
      >
        {value || "-"}
      </div>
    </div>
  );
}

export default DuplicateDetection;