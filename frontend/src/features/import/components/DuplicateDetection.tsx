import { useState } from "react";
import type { CSSProperties } from "react";

import type {
  ImportedTransaction,
  ValidatedTransaction,
} from "../types/import";

import {
  isDuplicateError,
  markDuplicateTransactions,
} from "../utils/duplicateDetection";

interface DuplicateDetectionProps {
  transactions: ValidatedTransaction[];
  onBack?: () => void;
  onContinue: (transactions: ValidatedTransaction[]) => void;
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

const dangerButtonStyle: CSSProperties = {
  backgroundColor: "#fff1f0",
  color: "#b42318",
  border: "1px solid #f0b7b2",
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
  const [rows, setRows] =
    useState<ValidatedTransaction[]>(transactions);

  const [editingRow, setEditingRow] =
    useState<number | null>(null);

  const [editData, setEditData] =
    useState<ImportedTransaction | null>(null);

  const duplicates = rows.filter((transaction) =>
    transaction.errors.some(isDuplicateError)
  );

  const uniqueTransactions = rows.filter(
    (transaction) =>
      !transaction.excluded &&
      !transaction.errors.some(isDuplicateError)
  );

  const handleFix = (row: ValidatedTransaction) => {
    setEditingRow(row.row);

    setEditData({
      ...row.data,
    });
  };

  const handleCancelEdit = () => {
    setEditingRow(null);
    setEditData(null);
  };

  const handleSaveFix = () => {
    if (!editingRow || !editData) {
      return;
    }

    if (
      !editData.date.trim() ||
      !editData.title.trim() ||
      !editData.account.trim() ||
      editData.amount <= 0
    ) {
      alert(
        "Please enter a valid date, description, account and amount."
      );
      return;
    }

    const updatedRows = rows.map((row) => {
      if (row.row !== editingRow) {
        return row;
      }

      return {
        ...row,
        data: editData,
      };
    });

    /*
     * Run duplicate detection again after editing.
     * This allows the transaction to become unique
     * if the user changed its data.
     */
    const recheckedRows =
      markDuplicateTransactions(updatedRows);

    setRows(recheckedRows);
    setEditingRow(null);
    setEditData(null);
  };

  const handleExclude = (rowNumber: number) => {
    setRows((currentRows) =>
      currentRows.filter(
        (row) => row.row !== rowNumber
      )
    );
  };

  const handleAddAnyway = (rowNumber: number) => {
    setRows((currentRows) =>
      currentRows.map((row) => {
        if (row.row !== rowNumber) {
          return row;
        }

        const remainingErrors = row.errors.filter(
          (error) => !isDuplicateError(error)
        );

        return {
          ...row,
          isValid: remainingErrors.length === 0,
          errors: remainingErrors,
        };
      })
    );
  };

  const handleContinue = () => {
    onContinue(uniqueTransactions);
  };

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

      {/* SUMMARY */}
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
          value={rows.length}
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

      {/* NO DUPLICATES */}
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
          ✓ No duplicate transactions require attention.
        </div>
      ) : (
        /* DUPLICATE LIST */
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
              isDuplicateError
            );

            /* EDIT MODE */
            if (
              editingRow === duplicate.row &&
              editData
            ) {
              return (
                <div
                  key={duplicate.row}
                  style={{
                    border: "1px solid var(--color-primary)",
                    borderRadius: "10px",
                    padding: "1.25rem",
                    backgroundColor: "#fffaf5",
                  }}
                >
                  <h3
                    style={{
                      marginBottom: "1.25rem",
                      fontFamily:
                        "var(--font-heading)",
                    }}
                  >
                    Fix Transaction — Row {duplicate.row}
                  </h3>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(2, 1fr)",
                      gap: "1rem",
                    }}
                  >
                    <EditField
                      label="Date"
                      value={editData.date}
                      onChange={(value) =>
                        setEditData({
                          ...editData,
                          date: value,
                        })
                      }
                      type="date"
                    />

                    <EditField
                      label="Description"
                      value={editData.title}
                      onChange={(value) =>
                        setEditData({
                          ...editData,
                          title: value,
                        })
                      }
                    />

                    <EditField
                      label="Amount"
                      value={String(editData.amount)}
                      onChange={(value) =>
                        setEditData({
                          ...editData,
                          amount: Number(value),
                        })
                      }
                      type="number"
                    />

                    <div>
                      <label
                        style={labelStyle}
                      >
                        Type
                      </label>

                      <select
                        value={editData.type}
                        onChange={(event) =>
                          setEditData({
                            ...editData,
                            type: event.target
                              .value as
                              | "income"
                              | "expense",
                          })
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

                    <EditField
                      label="Account"
                      value={editData.account}
                      onChange={(value) =>
                        setEditData({
                          ...editData,
                          account: value,
                        })
                      }
                    />

                    <EditField
                      label="Category"
                      value={
                        editData.category ?? ""
                      }
                      onChange={(value) =>
                        setEditData({
                          ...editData,
                          category: value,
                        })
                      }
                    />
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "0.75rem",
                      marginTop: "1.5rem",
                    }}
                  >
                    <button
                      type="button"
                      style={primaryButtonStyle}
                      onClick={handleSaveFix}
                    >
                      Save & Check Again
                    </button>

                    <button
                      type="button"
                      style={secondaryButtonStyle}
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              );
            }

            /* DUPLICATE CARD */
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
                    gridTemplateColumns:
                      "repeat(3, 1fr)",
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
                    value={String(
                      duplicate.data.amount
                    )}
                  />

                  <Info
                    label="Type"
                    value={duplicate.data.type}
                  />

                  <Info
                    label="Account"
                    value={duplicate.data.account}
                  />

                  <Info
                    label="Category"
                    value={
                      duplicate.data.category ?? "-"
                    }
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

                {/* ACTION BUTTONS */}
                <div
                  style={{
                    display: "flex",
                    gap: "0.75rem",
                    marginTop: "1rem",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    type="button"
                    style={primaryButtonStyle}
                    onClick={() =>
                      handleFix(duplicate)
                    }
                  >
                    Fix
                  </button>

                  <button
                    type="button"
                    style={dangerButtonStyle}
                    onClick={() =>
                      handleExclude(duplicate.row)
                    }
                  >
                    Exclude
                  </button>

                  <button
                    type="button"
                    style={secondaryButtonStyle}
                    onClick={() =>
                      handleAddAnyway(
                        duplicate.row
                      )
                    }
                  >
                    Add Anyway
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ACTIONS */}
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
          style={{
            ...primaryButtonStyle,
            opacity:
              duplicates.length > 0 ? 0.6 : 1,
          }}
          disabled={duplicates.length > 0}
          onClick={handleContinue}
        >
          Continue with{" "}
          {uniqueTransactions.length} Transactions
        </button>
      </div>
    </section>
  );
}

/* SUMMARY COMPONENT */

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

/* INFORMATION COMPONENT */

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

/* EDIT FIELD */

function EditField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label style={labelStyle}>
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

const labelStyle: CSSProperties = {
  display: "block",
  fontSize: "0.8rem",
  color: "var(--color-text-muted)",
  marginBottom: "0.35rem",
};

const inputStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "0.7rem",
  border: "1px solid var(--color-divider)",
  borderRadius: "8px",
  fontFamily: "var(--font-body)",
  fontSize: "0.9rem",
  color: "var(--color-text-dark)",
  backgroundColor: "#ffffff",
};

export default DuplicateDetection;