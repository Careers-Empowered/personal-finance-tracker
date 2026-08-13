import { useState } from "react";
import type { CSSProperties } from "react";

import type {
  ImportedTransaction,
  ValidatedTransaction,
} from "../types/import";

const isDuplicateRow = (row: ValidatedTransaction): boolean => {
  return row.errors.some(
    (error) =>
      error.field === "transaction" &&
      error.message.toLowerCase().includes("duplicate")
  );
};

import { validateTransactions } from "../utils/transactionValidation";


interface ImportValidationProps {
  transactions: ImportedTransaction[];
  onContinue: (
    transactions: ValidatedTransaction[]
  ) => void;
  onBack?: () => void;
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

function ImportValidation({
  transactions,
  onContinue,
  onBack,
}: ImportValidationProps) {
  const [validatedRows, setValidatedRows] =
    useState<ValidatedTransaction[]>(() => {
      return validateTransactions(transactions);
    });

  const [editingRow, setEditingRow] =
    useState<number | null>(null);

  const validCount = validatedRows.filter(
    (row) => row.isValid && !row.excluded
  ).length;

  const invalidCount = validatedRows.filter(
    (row) => !row.isValid && !row.excluded
  ).length;

  const excludedCount = validatedRows.filter(
    (row) => row.excluded
  ).length;

  const updateField = (
    rowNumber: number,
    field: keyof ImportedTransaction,
    value: string
  ) => {
    setValidatedRows((currentRows) =>
      currentRows.map((row) => {
        if (row.row !== rowNumber) {
          return row;
        }

        return {
          ...row,
          data: {
            ...row.data,
            [field]:
              field === "amount"
                ? Number(value)
                : value,
          },
        };
      })
    );
  };

  const saveFix = (rowNumber: number) => {
    setValidatedRows((currentRows) =>
      currentRows.map((row) => {
        if (row.row !== rowNumber) {
          return row;
        }

        const revalidated =
          validateTransactions([row.data])[0];

        return {
          ...revalidated,
          row: rowNumber,
          excluded: false,
        };
      })
    );

    setEditingRow(null);
  };

  const handleExclude = (rowNumber: number) => {
    setValidatedRows((currentRows) =>
      currentRows.map((row) =>
        row.row === rowNumber
          ? {
              ...row,
              excluded: true,
            }
          : row
      )
    );
  };

  const handleContinue = () => {
    const validRows = validatedRows.filter(
      (row) =>
        row.isValid && !row.excluded
    );

    onContinue(validRows);
  };

    return (
    <section
      style={{
        backgroundColor: "#ffffff",
        border:
          "1px solid var(--color-divider)",
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
          Import Validation
        </h2>

        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.95rem",
            color: "var(--color-text-muted)",
          }}
        >
          Review and fix invalid transactions before
          continuing.
        </p>
      </div>

      {/* Summary */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(4, 1fr)",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <Summary
          label="Total"
          value={validatedRows.length}
        />

        <Summary
          label="Valid"
          value={validCount}
          positive
        />

        <Summary
          label="Needs Attention"
          value={invalidCount}
          negative
        />

        <Summary
          label="Excluded"
          value={excludedCount}
        />
      </div>

      {/* Transactions */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        {validatedRows.map((row) => (
          <div
            key={row.row}
            style={{
              border:
                "1px solid var(--color-divider)",
              borderRadius: "12px",
              padding: "1.25rem",
              backgroundColor:
                row.excluded
                  ? "#f8f9fa"
                  : row.isValid
                  ? "#ffffff"
                  : "#fff8f7",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <strong>
                Row {row.row}
              </strong>

              {row.excluded ? (
                <span
                  style={{
                    color: "var(--color-text-muted)",
                    fontWeight: 600,
                  }}
                >
                  Excluded
                </span>
              ) : isDuplicateRow(row) ? (
                <span
                  style={{
                    color: "#b26a00",
                    fontWeight: 600,
                  }}
                >
                  ⚠ Duplicate
                </span>
              ) : row.isValid ? (
                <span
                  style={{
                    color: "#188038",
                    fontWeight: 600,
                  }}
                >
                  ✓ Valid
                </span>
              ) : (
                <span
                  style={{
                    color: "#b42318",
                    fontWeight: 600,
                  }}
                >
                  ⚠ Needs Attention
                </span>
              )}
            </div>

            {/* Normal display */}
            {editingRow !== row.row && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(3, 1fr)",
                  gap: "1rem",
                }}
              >
                <Info
                  label="Date"
                  value={row.data.date}
                />

                <Info
                  label="Description"
                  value={row.data.title}
                />

                <Info
                  label="Amount"
                  value={String(
                    row.data.amount
                  )}
                />

                <Info
                  label="Type"
                  value={row.data.type}
                />

                <Info
                  label="Account"
                  value={row.data.account}
                />

                <Info
                  label="Category"
                  value={
                    row.data.category || "-"
                  }
                />
              </div>
            )}

            {/* Editing */}
            {editingRow === row.row && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(2, 1fr)",
                  gap: "1rem",
                }}
              >
                <EditInput
                  label="Date"
                  value={row.data.date}
                  onChange={(value) =>
                    updateField(
                      row.row,
                      "date",
                      value
                    )
                  }
                />

                <EditInput
                  label="Description"
                  value={row.data.title}
                  onChange={(value) =>
                    updateField(
                      row.row,
                      "title",
                      value
                    )
                  }
                />

                <EditInput
                  label="Amount"
                  value={String(
                    row.data.amount
                  )}
                  type="number"
                  onChange={(value) =>
                    updateField(
                      row.row,
                      "amount",
                      value
                    )
                  }
                />

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      marginBottom:
                        "0.35rem",
                    }}
                  >
                    Type
                  </label>

                  <select
                    value={row.data.type}
                    onChange={(event) =>
                      updateField(
                        row.row,
                        "type",
                        event.target.value
                      )
                    }
                    style={inputStyle}
                  >
                    <option value="expense">
                      Expense
                    </option>

                    <option value="income">
                      Income
                    </option>
                  </select>
                </div>

                <EditInput
                  label="Account"
                  value={row.data.account}
                  onChange={(value) =>
                    updateField(
                      row.row,
                      "account",
                      value
                    )
                  }
                />

                <EditInput
                  label="Category"
                  value={
                    row.data.category || ""
                  }
                  onChange={(value) =>
                    updateField(
                      row.row,
                      "category",
                      value
                    )
                  }
                />
              </div>
            )}

            {/* Errors */}
            {!row.isValid &&
              !row.excluded && (
                <div
                  style={{
                    marginTop: "1rem",
                    padding: "0.75rem",
                    borderRadius: "8px",
                    backgroundColor:
                      "#fff1f0",
                  }}
                >
                  {row.errors.map(
                    (error, index) => (
                      <div
                        key={index}
                        style={{
                          color: "#b42318",
                          fontSize:
                            "0.85rem",
                          marginBottom:
                            "0.25rem",
                        }}
                      >
                        • {error.field}:{" "}
                        {error.message}
                      </div>
                    )
                  )}
                </div>
              )}

            {/* Actions */}
            {!row.excluded &&
              !row.isValid && (
                <div
                  style={{
                    display: "flex",
                    gap: "0.75rem",
                    marginTop: "1rem",
                  }}
                >
                  {editingRow === row.row ? (
                    <button
                      type="button"
                      style={
                        primaryButtonStyle
                      }
                      onClick={() =>
                        saveFix(row.row)
                      }
                    >
                      Save Fix
                    </button>
                  ) : (
                    <button
                      type="button"
                      style={
                        secondaryButtonStyle
                      }
                      onClick={() =>
                        setEditingRow(
                          row.row
                        )
                      }
                    >
                      Fix
                    </button>
                  )}

                  <button
                    type="button"
                    style={{
                      ...secondaryButtonStyle,
                      color: "#b42318",
                    }}
                    onClick={() =>
                      handleExclude(row.row)
                    }
                  >
                    Exclude
                  </button>
                </div>
              )}
          </div>
        ))}
      </div>

      {/* Bottom actions */}
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
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
          style={{
            ...primaryButtonStyle,
            opacity:
              invalidCount > 0 ? 0.5 : 1,
          }}
          disabled={invalidCount > 0}
          onClick={handleContinue}
        >
          Continue with {validCount} Transactions
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
        border:
          "1px solid var(--color-divider)",
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
          color:
            "var(--color-text-dark)",
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
          color:
            "var(--color-text-muted)",
          marginBottom: "0.2rem",
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: "0.9rem",
          color:
            "var(--color-text-dark)",
          fontWeight: 500,
        }}
      >
        {value || "-"}
      </div>
    </div>
  );
}

function EditInput({
  label,
  value,
  type = "text",
  onChange,
}: {
  label: string;
  value: string;
  type?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: "0.8rem",
          fontWeight: 600,
          marginBottom: "0.35rem",
          color:
            "var(--color-text-dark)",
        }}
      >
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        style={inputStyle}
      />
    </div>
  );
}

const inputStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "0.7rem",
  border:
    "1px solid var(--color-divider)",
  borderRadius: "8px",
  backgroundColor: "#ffffff",
  color: "var(--color-text-dark)",
  fontFamily: "var(--font-body)",
  fontSize: "0.9rem",
};

export default ImportValidation;