import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";

import type {
  DuplicateDecision,
  ImportedTransaction,
  ValidatedTransaction,
} from "../types/import";

import { markDuplicateTransactions } from "../utils/duplicateDetection";

interface DuplicateDetectionProps {
  transactions: ValidatedTransaction[];
  onBack?: () => void;
  onContinue: (
    transactions: ValidatedTransaction[],
    decisions: DuplicateDecision[]
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

const addAnywayButtonStyle: CSSProperties = {
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

const inputStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  border: "1px solid var(--color-divider)",
  borderRadius: "8px",
  padding: "0.7rem",
  fontFamily: "var(--font-body)",
  fontSize: "0.9rem",
  color: "var(--color-text-dark)",
  backgroundColor: "#ffffff",
};

function DuplicateDetection({
  transactions,
  onBack,
  onContinue,
}: DuplicateDetectionProps) {
  /*
   * --------------------------------------------------
   * WORKING TRANSACTIONS
   * --------------------------------------------------
   *
   * We keep a local copy so the Fix feature can modify
   * a transaction without requiring changes to the
   * Transactions page.
   */

  const [workingTransactions, setWorkingTransactions] =
    useState<ValidatedTransaction[]>(transactions);

  useEffect(() => {
    setWorkingTransactions(transactions);
  }, [transactions]);

  /*
   * --------------------------------------------------
   * SELECTION / DUPLICATE STATES
   * --------------------------------------------------
   */

  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  const [excludedRows, setExcludedRows] = useState<number[]>([]);

  const [addedAnywayRows, setAddedAnywayRows] = useState<number[]>([]);

  const [overrideNotes, setOverrideNotes] = useState<
    Record<number, string>
  >({});

  /*
   * --------------------------------------------------
   * ADD ANYWAY / EDIT NOTES DIALOG
   * --------------------------------------------------
   */

  const [noteDialogRows, setNoteDialogRows] = useState<number[]>([]);

  const [noteText, setNoteText] = useState("");

  /*
   * --------------------------------------------------
   * FIX / EDIT TRANSACTION DIALOG
   * --------------------------------------------------
   */

  const [fixDialogRow, setFixDialogRow] = useState<number | null>(null);

  const [fixForm, setFixForm] = useState<ImportedTransaction | null>(null);

  /*
   * --------------------------------------------------
   * FIND DUPLICATES
   * --------------------------------------------------
   */

  const duplicates = useMemo(
    () =>
      workingTransactions.filter((transaction) =>
        transaction.errors.some(
          (error) =>
            error.field === "transaction" &&
            error.message.toLowerCase().includes("duplicate")
        )
      ),
    [workingTransactions]
  );

  /*
   * --------------------------------------------------
   * ACTIVE DUPLICATES
   * --------------------------------------------------
   */

  const activeDuplicates = duplicates.filter(
    (transaction) => !excludedRows.includes(transaction.row)
  );

  /*
   * --------------------------------------------------
   * UNIQUE TRANSACTIONS
   * --------------------------------------------------
   */

  const uniqueTransactions = workingTransactions.filter((transaction) => {
    const isDuplicate = duplicates.some(
      (duplicate) => duplicate.row === transaction.row
    );

    if (!isDuplicate) {
      return true;
    }

    if (excludedRows.includes(transaction.row)) {
      return false;
    }

    return addedAnywayRows.includes(transaction.row);
  });

  const unresolvedDuplicates = duplicates.filter(
    (duplicate) =>
      !excludedRows.includes(duplicate.row) &&
      !addedAnywayRows.includes(duplicate.row)
  );

  /*
   * --------------------------------------------------
   * SELECT ALL
   * --------------------------------------------------
   */

  const allSelected =
    activeDuplicates.length > 0 &&
    activeDuplicates.every((transaction) =>
      selectedRows.includes(transaction.row)
    );

  const toggleRow = (row: number) => {
    setSelectedRows((current) =>
      current.includes(row)
        ? current.filter((selected) => selected !== row)
        : [...current, row]
    );
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedRows([]);
      return;
    }

    setSelectedRows(
      activeDuplicates.map((transaction) => transaction.row)
    );
  };

  /*
   * --------------------------------------------------
   * EXCLUDE
   * --------------------------------------------------
   */

  const excludeRows = (rows: number[]) => {
    setExcludedRows((current) => [
      ...new Set([...current, ...rows]),
    ]);

    setSelectedRows((current) =>
      current.filter((row) => !rows.includes(row))
    );

    setAddedAnywayRows((current) =>
      current.filter((row) => !rows.includes(row))
    );

    setOverrideNotes((current) => {
      const updated = { ...current };

      rows.forEach((row) => {
        delete updated[row];
      });

      return updated;
    });
  };

  /*
   * --------------------------------------------------
   * FIX
   * --------------------------------------------------
   *
   * Opens an edit dialog instead of showing the old
   * placeholder alert.
   */

  const handleFix = (row: number) => {
    const transaction = workingTransactions.find(
      (item) => item.row === row
    );

    if (!transaction) {
      return;
    }

    setFixDialogRow(row);

    setFixForm({
      ...transaction.data,
    });
  };

  /*
   * --------------------------------------------------
   * SAVE FIX
   * --------------------------------------------------
   *
   * After editing, duplicate detection is run again.
   */

  const saveFix = () => {
    if (fixDialogRow === null || !fixForm) {
      return;
    }

    const updatedTransactions = workingTransactions.map(
      (transaction) => {
        if (transaction.row !== fixDialogRow) {
          return transaction;
        }

        return {
          ...transaction,
          data: {
            ...fixForm,
          },
        };
      }
    );

    /*
     * Re-run duplicate detection after the edit.
     */
    const recheckedTransactions =
      markDuplicateTransactions(updatedTransactions);

    setWorkingTransactions(recheckedTransactions);

    /*
     * The row is no longer excluded/added-anyway after
     * using Fix.
     */
    setExcludedRows((current) =>
      current.filter((row) => row !== fixDialogRow)
    );

    setAddedAnywayRows((current) =>
      current.filter((row) => row !== fixDialogRow)
    );

    setOverrideNotes((current) => {
      const updated = { ...current };

      delete updated[fixDialogRow];

      return updated;
    });

    setSelectedRows((current) =>
      current.filter((row) => row !== fixDialogRow)
    );

    setFixDialogRow(null);
    setFixForm(null);
  };

  /*
   * --------------------------------------------------
   * CANCEL FIX
   * --------------------------------------------------
   */

  const cancelFix = () => {
    setFixDialogRow(null);
    setFixForm(null);
  };

  /*
   * --------------------------------------------------
   * UPDATE FIX FORM
   * --------------------------------------------------
   */

  const updateFixField = (
    field: keyof ImportedTransaction,
    value: string | number
  ) => {
    setFixForm((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        [field]: value,
      };
    });
  };

  /*
   * --------------------------------------------------
   * ADD ANYWAY / EDIT NOTES
   * --------------------------------------------------
   */

  const openAddAnywayDialog = (rows: number[]) => {
    if (rows.length === 0) {
      alert(
        "Please select at least one duplicate transaction."
      );
      return;
    }

    setNoteDialogRows(rows);

    if (rows.length === 1 && overrideNotes[rows[0]]) {
      setNoteText(overrideNotes[rows[0]]);
    } else {
      setNoteText("");
    }
  };

  /*
   * --------------------------------------------------
   * CONFIRM ADD ANYWAY / SAVE NOTES
   * --------------------------------------------------
   */

  const confirmAddAnyway = () => {
    const note = noteText.trim();

    if (!note) {
      alert(
        "Please enter a short note explaining why this transaction should be added."
      );
      return;
    }

    setAddedAnywayRows((current) => [
      ...new Set([
        ...current,
        ...noteDialogRows,
      ]),
    ]);

    setOverrideNotes((current) => {
      const updated = {
        ...current,
      };

      noteDialogRows.forEach((row) => {
        updated[row] = note;
      });

      return updated;
    });

    setSelectedRows((current) =>
      current.filter(
        (row) => !noteDialogRows.includes(row)
      )
    );

    setNoteDialogRows([]);

    setNoteText("");
  };

  /*
   * --------------------------------------------------
   * CONTINUE
   * --------------------------------------------------
   */

  const handleContinue = () => {
    const decisions: DuplicateDecision[] = [];

    duplicates.forEach((duplicate) => {
      if (excludedRows.includes(duplicate.row)) {
        decisions.push({
          row: duplicate.row,
          action: "exclude",
        });
      }

      if (addedAnywayRows.includes(duplicate.row)) {
        decisions.push({
          row: duplicate.row,
          action: "add-anyway",
          note: overrideNotes[duplicate.row],
        });
      }
    });

    onContinue(
      uniqueTransactions,
      decisions
    );
  };

  /*
   * --------------------------------------------------
   * RENDER
   * --------------------------------------------------
   */

  return (
    <>
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
        {/* HEADER */}

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
            marginBottom: "1.5rem",
          }}
        >
          <Summary
            label="Transactions Checked"
            value={workingTransactions.length}
          />

          <Summary
            label="Duplicates Found"
            value={activeDuplicates.length}
            negative={activeDuplicates.length > 0}
          />

          <Summary
            label="Unique Transactions"
            value={uniqueTransactions.length}
            positive
          />
        </div>

        {/* BULK ACTIONS */}

        {activeDuplicates.length > 0 && (
          <div
            style={{
              border: "1px solid var(--color-divider)",
              borderRadius: "10px",
              padding: "1rem",
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleSelectAll}
              />

              Select All Duplicates
            </label>

            <div
              style={{
                display: "flex",
                gap: "0.75rem",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                style={dangerButtonStyle}
                disabled={selectedRows.length === 0}
                onClick={() => excludeRows(selectedRows)}
              >
                Exclude Selected
              </button>

              <button
                type="button"
                style={addAnywayButtonStyle}
                disabled={selectedRows.length === 0}
                onClick={() =>
                  openAddAnywayDialog(selectedRows)
                }
              >
                Add Anyway Selected
              </button>
            </div>
          </div>
        )}

        {/* RESULTS */}

        {activeDuplicates.length === 0 ? (
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
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              marginBottom: "2rem",
            }}
          >
            {activeDuplicates.map((duplicate) => {
              const duplicateError =
                duplicate.errors.find(
                  (error) =>
                    error.field === "transaction" &&
                    error.message
                      .toLowerCase()
                      .includes("duplicate")
                );

              const isSelected = selectedRows.includes(
                duplicate.row
              );

              const wasAddedAnyway =
                addedAnywayRows.includes(
                  duplicate.row
                );

              return (
                <div
                  key={duplicate.row}
                  style={{
                    border: wasAddedAnyway
                      ? "1px solid #9ad9ad"
                      : "1px solid #f0b7b2",

                    borderRadius: "10px",

                    padding: "1.25rem",

                    backgroundColor: wasAddedAnyway
                      ? "#f0fdf4"
                      : "#fff8f7",
                  }}
                >
                  {/* HEADER */}

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "1rem",
                    }}
                  >
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        fontWeight: 600,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() =>
                          toggleRow(duplicate.row)
                        }
                      />

                      Row {duplicate.row}
                    </label>

                    <span
                      style={{
                        color: wasAddedAnyway
                          ? "#188038"
                          : "#b42318",
                        fontWeight: 600,
                      }}
                    >
                      {wasAddedAnyway
                        ? "✓ Added Anyway"
                        : "⚠ Duplicate"}
                    </span>
                  </div>

                  {/* TRANSACTION DATA */}

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
                        duplicate.data.category || "-"
                      }
                    />
                  </div>

                  {/* DUPLICATE EXPLANATION */}

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

                  {/* ADD ANYWAY NOTE */}

                  {wasAddedAnyway &&
                    overrideNotes[
                      duplicate.row
                    ] && (
                      <div
                        style={{
                          marginTop: "1rem",
                          padding: "0.75rem",
                          borderRadius: "8px",
                          backgroundColor: "#f0fdf4",
                          color: "#188038",
                          fontSize: "0.85rem",
                        }}
                      >
                        <strong>
                          Added anyway note:
                        </strong>{" "}
                        {
                          overrideNotes[
                            duplicate.row
                          ]
                        }
                      </div>
                    )}

                  {/* INDIVIDUAL ACTIONS */}

                  <div
                    style={{
                      display: "flex",
                      gap: "0.75rem",
                      marginTop: "1.25rem",
                      flexWrap: "wrap",
                    }}
                  >
                    {!wasAddedAnyway && (
                      <>
                        <button
                          type="button"
                          style={primaryButtonStyle}
                          onClick={() =>
                            handleFix(
                              duplicate.row
                            )
                          }
                        >
                          Fix
                        </button>

                        <button
                          type="button"
                          style={dangerButtonStyle}
                          onClick={() =>
                            excludeRows([
                              duplicate.row,
                            ])
                          }
                        >
                          Exclude
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      style={secondaryButtonStyle}
                      onClick={() =>
                        openAddAnywayDialog([
                          duplicate.row,
                        ])
                      }
                    >
                      {wasAddedAnyway
                        ? "Edit Notes"
                        : "Add Anyway"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* FOOTER */}

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
            disabled={unresolvedDuplicates.length > 0}
            onClick={handleContinue}
            style={{
              ...primaryButtonStyle,
              opacity:
                unresolvedDuplicates.length > 0
                  ? 0.5
                  : 1,
              cursor:
                unresolvedDuplicates.length > 0
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            Continue with{" "}
            {uniqueTransactions.length} Transactions
          </button>
        </div>
      </section>

      {/* ------------------------------------------------
          ADD ANYWAY / EDIT NOTES DIALOG
      ------------------------------------------------ */}

      {noteDialogRows.length > 0 && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor:
              "rgba(0, 0, 0, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem",
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "14px",
              padding: "1.5rem",
              width: "100%",
              maxWidth: "500px",
              boxShadow:
                "0 10px 30px rgba(0, 0, 0, 0.2)",
            }}
          >
            <h3
              style={{
                marginTop: 0,
                marginBottom: "0.5rem",
              }}
            >
              {noteDialogRows.length === 1 &&
              overrideNotes[
                noteDialogRows[0]
              ]
                ? "Edit Add Anyway Note"
                : "Add Transaction Anyway"}
            </h3>

            <p
              style={{
                color: "var(--color-text-muted)",
                fontSize: "0.9rem",
              }}
            >
              {noteDialogRows.length === 1
                ? "This transaction was detected as a duplicate."
                : `${noteDialogRows.length} transactions were detected as duplicates.`}
            </p>

            <label
              style={{
                display: "block",
                marginTop: "1rem",
                marginBottom: "0.5rem",
                fontWeight: 600,
              }}
            >
              Reason / Note
            </label>

            <textarea
              value={noteText}
              onChange={(event) =>
                setNoteText(event.target.value)
              }
              placeholder="Example: Two separate ATM withdrawals were made on the same day."
              rows={4}
              maxLength={300}
              style={{
                width: "100%",
                boxSizing: "border-box",
                resize: "vertical",
                border:
                  "1px solid var(--color-divider)",
                borderRadius: "8px",
                padding: "0.75rem",
                fontFamily: "var(--font-body)",
                fontSize: "0.9rem",
              }}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "0.75rem",
                marginTop: "1rem",
              }}
            >
              <button
                type="button"
                style={secondaryButtonStyle}
                onClick={() => {
                  setNoteDialogRows([]);
                  setNoteText("");
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                style={primaryButtonStyle}
                onClick={confirmAddAnyway}
              >
                {noteDialogRows.length === 1 &&
                overrideNotes[
                  noteDialogRows[0]
                ]
                  ? "Save Changes"
                  : "Add Anyway"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------
          FIX / EDIT TRANSACTION DIALOG
      ------------------------------------------------ */}

      {fixDialogRow !== null && fixForm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor:
              "rgba(0, 0, 0, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1100,
            padding: "1rem",
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "14px",
              padding: "1.5rem",
              width: "100%",
              maxWidth: "600px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow:
                "0 10px 30px rgba(0, 0, 0, 0.2)",
            }}
          >
            <h3
              style={{
                marginTop: 0,
                marginBottom: "0.5rem",
                fontSize: "1.25rem",
              }}
            >
              Fix Duplicate Transaction
            </h3>

            <p
              style={{
                color: "var(--color-text-muted)",
                fontSize: "0.9rem",
                marginBottom: "1.25rem",
              }}
            >
              Edit the transaction details and save.
              The transaction will be checked again for
              duplicates.
            </p>

            {/* DATE */}

            <label
              style={{
                display: "block",
                marginBottom: "0.4rem",
                fontWeight: 600,
              }}
            >
              Date
            </label>

            <input
              type="date"
              value={fixForm.date}
              onChange={(event) =>
                updateFixField(
                  "date",
                  event.target.value
                )
              }
              style={{
                ...inputStyle,
                marginBottom: "1rem",
              }}
            />

            {/* DESCRIPTION */}

            <label
              style={{
                display: "block",
                marginBottom: "0.4rem",
                fontWeight: 600,
              }}
            >
              Description
            </label>

            <input
              type="text"
              value={fixForm.title}
              onChange={(event) =>
                updateFixField(
                  "title",
                  event.target.value
                )
              }
              style={{
                ...inputStyle,
                marginBottom: "1rem",
              }}
            />

            {/* AMOUNT */}

            <label
              style={{
                display: "block",
                marginBottom: "0.4rem",
                fontWeight: 600,
              }}
            >
              Amount
            </label>

            <input
              type="number"
              step="1"
              value={fixForm.amount}
              onChange={(event) =>
                updateFixField(
                  "amount",
                  Number(event.target.value)
                )
              }
              style={{
                ...inputStyle,
                marginBottom: "1rem",
              }}
            />

            {/* TYPE */}

            <label
              style={{
                display: "block",
                marginBottom: "0.4rem",
                fontWeight: 600,
              }}
            >
              Type
            </label>

            <select
              value={fixForm.type}
              onChange={(event) =>
                updateFixField(
                  "type",
                  event.target.value as
                    | "income"
                    | "expense"
                )
              }
              style={{
                ...inputStyle,
                marginBottom: "1rem",
              }}
            >
              <option value="expense">
                Expense
              </option>

              <option value="income">
                Income
              </option>
            </select>

            {/* ACCOUNT */}

            <label
              style={{
                display: "block",
                marginBottom: "0.4rem",
                fontWeight: 600,
              }}
            >
              Account
            </label>

            <input
              type="text"
              value={fixForm.account}
              onChange={(event) =>
                updateFixField(
                  "account",
                  event.target.value
                )
              }
              style={{
                ...inputStyle,
                marginBottom: "1rem",
              }}
            />

            {/* CATEGORY */}

            <label
              style={{
                display: "block",
                marginBottom: "0.4rem",
                fontWeight: 600,
              }}
            >
              Category
            </label>

            <input
              type="text"
              value={fixForm.category || ""}
              onChange={(event) =>
                updateFixField(
                  "category",
                  event.target.value
                )
              }
              style={{
                ...inputStyle,
                marginBottom: "1rem",
              }}
            />

            {/* NOTES */}

            <label
              style={{
                display: "block",
                marginBottom: "0.4rem",
                fontWeight: 600,
              }}
            >
              Notes
            </label>

            <textarea
              value={fixForm.notes || ""}
              onChange={(event) =>
                updateFixField(
                  "notes",
                  event.target.value
                )
              }
              rows={3}
              style={{
                ...inputStyle,
                resize: "vertical",
                marginBottom: "1.25rem",
              }}
            />

            {/* ACTIONS */}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "0.75rem",
              }}
            >
              <button
                type="button"
                style={secondaryButtonStyle}
                onClick={cancelFix}
              >
                Cancel
              </button>

              <button
                type="button"
                style={primaryButtonStyle}
                onClick={saveFix}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/*
 * --------------------------------------------------
 * SUMMARY COMPONENT
 * --------------------------------------------------
 */

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
          color: "var(--color-text-dark)",
        }}
      >
        {value}
      </strong>
    </div>
  );
}

/*
 * --------------------------------------------------
 * INFO COMPONENT
 * --------------------------------------------------
 */

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

export default DuplicateDetection;