import { useState } from "react";
import type { CSSProperties } from "react";
import type { ValidatedTransaction } from "../types/import";

interface DatabaseDuplicateMatch {
  row: number;
  existingTransaction?: {
    id?: string;
    date?: string;
    title?: string;
    amount?: number | string;
    type?: string;
    account?: {
      name?: string;
    };
  };
}

interface CsvDatabaseDuplicateCheckProps {
  databaseDuplicateMatches: DatabaseDuplicateMatch[];
  transactionsForImport: ValidatedTransaction[];
  selectedAccountId: string;
  isImporting: boolean;

  onBack: () => void;

  onExcludeDuplicates: () => void | Promise<void>;

  onContinueWithSelectedDuplicates: (
    selectedDuplicateRows: number[]
  ) => void | Promise<void>;
}

const styles: Record<string, CSSProperties> = {
  section: {
    width: "100%",
    maxWidth: "1100px",
    margin: "0 auto",
    boxSizing: "border-box",
  },

  card: {
    backgroundColor: "#ffffff",
    border: "1px solid #dedede",
    borderRadius: "16px",
    padding: "2rem",
    boxSizing: "border-box",
  },
};

function formatDate(value: unknown): string {
  if (!value) return "-";

  return String(value).split("T")[0];
}

export default function CsvDatabaseDuplicateCheck({
  databaseDuplicateMatches,
  transactionsForImport,
  selectedAccountId,
  isImporting,
  onBack,
  onExcludeDuplicates,
  onContinueWithSelectedDuplicates,
}: CsvDatabaseDuplicateCheckProps) {
  /*
   * ============================================================
   * SELECTED DATABASE DUPLICATES
   * ============================================================
   *
   * Stores the row numbers of database duplicates that the
   * user wants to import again.
   *
   * Example:
   *
   * Set { 2, 4 }
   *
   * means Row 2 and Row 4 will be imported again.
   */
  const [selectedDuplicateRows, setSelectedDuplicateRows] =
    useState<Set<number>>(new Set());

  /*
   * ============================================================
   * TOGGLE ONE DUPLICATE
   * ============================================================
   */
  const toggleDuplicate = (row: number) => {
    setSelectedDuplicateRows((current) => {
      const next = new Set(current);

      if (next.has(row)) {
        next.delete(row);
      } else {
        next.add(row);
      }

      return next;
    });
  };

  /*
   * ============================================================
   * SELECT / DESELECT ALL
   * ============================================================
   */
  const allSelected =
    databaseDuplicateMatches.length > 0 &&
    selectedDuplicateRows.size ===
      databaseDuplicateMatches.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedDuplicateRows(new Set());
      return;
    }

    setSelectedDuplicateRows(
      new Set(
        databaseDuplicateMatches.map(
          (match) => match.row
        )
      )
    );
  };

  /*
   * ============================================================
   * CONTINUE SELECTED
   * ============================================================
   */
  const handleContinueSelected = async () => {
    if (!selectedAccountId || isImporting) {
      return;
    }

    await onContinueWithSelectedDuplicates(
      Array.from(selectedDuplicateRows)
    );
  };

  return (
    <section style={styles.section}>
      <div style={styles.card}>

        {/* ======================================================
            HEADER
            ====================================================== */}

        <div
          style={{
            marginBottom: "1.5rem",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "1.75rem",
              lineHeight: 1.25,
              fontWeight: 700,
              color: "#111827",
            }}
          >
            Database Duplicate Check
          </h2>

          <p
            style={{
              margin: "0.6rem 0 0",
              color: "#667085",
              fontSize: "1rem",
              lineHeight: 1.5,
            }}
          >
            Review transactions that already exist in the
            selected account before importing them.
          </p>
        </div>

        {/* ======================================================
            WARNING
            ====================================================== */}

        <div
          style={{
            marginBottom: "1.5rem",
            padding: "1rem 1.25rem",
            borderRadius: "12px",
            border: "1px solid #f3b5b5",
            backgroundColor: "#fff6f6",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              fontWeight: 700,
              fontSize: "1rem",
              color: "#c5221f",
            }}
          >
            ⚠ Database Duplicate Warning
          </div>

          <div
            style={{
              marginTop: "0.4rem",
              color: "#7f1d1d",
              lineHeight: 1.5,
            }}
          >
            {databaseDuplicateMatches.length} transaction
            {databaseDuplicateMatches.length === 1
              ? ""
              : "s"}{" "}
            from this import already{" "}
            {databaseDuplicateMatches.length === 1
              ? "exists"
              : "exist"}{" "}
            in the selected account.
          </div>

          <div
            style={{
              marginTop: "0.35rem",
              color: "#667085",
              lineHeight: 1.5,
            }}
          >
            Select the duplicate transactions that you want
            to import again.
          </div>
        </div>

        {/* ======================================================
            SELECT ALL
            ====================================================== */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            padding: "1rem 1.25rem",
            marginBottom: "1rem",
            border: "1px solid #dedede",
            borderRadius: "12px",
            backgroundColor: "#ffffff",
            flexWrap: "wrap",
          }}
        >
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              fontSize: "1rem",
              fontWeight: 700,
              color: "#111827",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleSelectAll}
              style={{
                width: "18px",
                height: "18px",
                cursor: "pointer",
              }}
            />

            Select All Duplicates
          </label>

          <span
            style={{
              color: "#667085",
              fontSize: "0.95rem",
            }}
          >
            {selectedDuplicateRows.size} of{" "}
            {databaseDuplicateMatches.length} selected
          </span>
        </div>

        {/* ======================================================
            MATCHING TRANSACTIONS
            ====================================================== */}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          {databaseDuplicateMatches.map((match) => {
            const importedTransaction =
              transactionsForImport.find(
                (transaction) =>
                  transaction.row === match.row
              );

            const imported =
              importedTransaction?.data;

            const existing =
              match.existingTransaction;

            const isSelected =
              selectedDuplicateRows.has(
                match.row
              );

            return (
              <div
                key={`${match.row}-${existing?.id ?? "existing"}`}
                style={{
                  border: isSelected
                    ? "2px solid #d8892f"
                    : "1px solid #f1b8b8",

                  borderRadius: "14px",

                  padding: "1.25rem",

                  backgroundColor: isSelected
                    ? "#fffaf3"
                    : "#fff9f9",

                  boxSizing: "border-box",
                }}
              >

                {/* ==================================================
                    ROW HEADER
                    ================================================== */}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "1rem",
                    marginBottom: "1rem",
                    flexWrap: "wrap",
                  }}
                >
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() =>
                        toggleDuplicate(
                          match.row
                        )
                      }
                      style={{
                        width: "18px",
                        height: "18px",
                        cursor: "pointer",
                      }}
                    />

                    <strong
                      style={{
                        fontSize: "1.05rem",
                        color: "#111827",
                      }}
                    >
                      Row {match.row}
                    </strong>
                  </label>

                  <span
                    style={{
                      fontWeight: 700,
                      color: "#c5221f",
                      fontSize: "1rem",
                    }}
                  >
                    Already exists
                  </span>
                </div>

                {/* ==================================================
                    IMPORTED VS DATABASE
                    ================================================== */}

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(2, minmax(0, 1fr))",
                    gap: "1rem",
                  }}
                >

                  {/* ==================================================
                      IMPORTED FILE
                      ================================================== */}

                  <div
                    style={{
                      padding: "1.15rem",
                      borderRadius: "10px",
                      backgroundColor: "#f7f8fa",
                      border: "1px solid #eceef0",
                      boxSizing: "border-box",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "1rem",
                        marginBottom: "0.9rem",
                        color: "#111827",
                      }}
                    >
                      Imported File
                    </div>

                    <div
                      style={{
                        lineHeight: 1.65,
                        color: "#111827",
                      }}
                    >
                      <div>
                        <strong>Date:</strong>{" "}
                        {formatDate(
                          imported?.date
                        )}
                      </div>

                      <div>
                        <strong>Title:</strong>{" "}
                        {imported?.title || "-"}
                      </div>

                      <div>
                        <strong>Amount:</strong>{" "}
                        {imported?.amount ?? "-"}
                      </div>

                      <div>
                        <strong>Type:</strong>{" "}
                        {imported?.type || "-"}
                      </div>
                    </div>
                  </div>

                  {/* ==================================================
                      DATABASE RECORD
                      ================================================== */}

                  <div
                    style={{
                      padding: "1.15rem",
                      borderRadius: "10px",
                      backgroundColor: "#fff3e7",
                      border: "1px solid #f2d2b3",
                      boxSizing: "border-box",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "1rem",
                        marginBottom: "0.9rem",
                        color: "#111827",
                      }}
                    >
                      Existing Database Record
                    </div>

                    <div
                      style={{
                        lineHeight: 1.65,
                        color: "#111827",
                      }}
                    >
                      <div>
                        <strong>Date:</strong>{" "}
                        {formatDate(
                          existing?.date
                        )}
                      </div>

                      <div>
                        <strong>Title:</strong>{" "}
                        {existing?.title || "-"}
                      </div>

                      <div>
                        <strong>Amount:</strong>{" "}
                        {existing?.amount ?? "-"}
                      </div>

                      <div>
                        <strong>Type:</strong>{" "}
                        {existing?.type || "-"}
                      </div>

                      <div>
                        <strong>Account:</strong>{" "}
                        {existing?.account?.name || "-"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ======================================================
            BOTTOM ACTIONS
            ====================================================== */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
            marginTop: "1.75rem",
            flexWrap: "wrap",
          }}
        >

          {/* Back */}
          <button
            type="button"
            onClick={onBack}
            style={{
              padding: "0.8rem 1.3rem",
              border: "none",
              borderRadius: "10px",
              backgroundColor: "#f1f3f4",
              color: "#111827",
              fontSize: "1rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Back
          </button>

          {/* Right actions */}
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              flexWrap: "wrap",
              justifyContent: "flex-end",
            }}
          >

            {/* ==================================================
                CONTINUE SELECTED
                ================================================== */}

            <button
              type="button"
              disabled={
                selectedDuplicateRows.size === 0 ||
                !selectedAccountId ||
                isImporting
              }
              onClick={
                handleContinueSelected
              }
              style={{
                padding: "0.8rem 1.3rem",
                border: "none",
                borderRadius: "10px",
                backgroundColor: "#d8892f",
                color: "#ffffff",
                fontSize: "1rem",
                fontWeight: 700,

                cursor:
                  selectedDuplicateRows.size > 0 &&
                  selectedAccountId &&
                  !isImporting
                    ? "pointer"
                    : "not-allowed",

                opacity:
                  selectedDuplicateRows.size > 0 &&
                  selectedAccountId &&
                  !isImporting
                    ? 1
                    : 0.55,
              }}
            >
              {isImporting
                ? "Importing..."
                : `Import ${
                    selectedDuplicateRows.size
                  } selected`}
            </button>

            {/* ==================================================
                EXCLUDE ALL DATABASE DUPLICATES
                ================================================== */}

            <button
              type="button"
              disabled={
                !selectedAccountId ||
                isImporting
              }
              onClick={
                onExcludeDuplicates
              }
              style={{
                padding: "0.8rem 1.3rem",
                border: "none",
                borderRadius: "10px",
                backgroundColor: "#188038",
                color: "#ffffff",
                fontSize: "1rem",
                fontWeight: 700,

                cursor:
                  selectedAccountId &&
                  !isImporting
                    ? "pointer"
                    : "not-allowed",

                opacity:
                  selectedAccountId &&
                  !isImporting
                    ? 1
                    : 0.55,
              }}
            >
              {isImporting
                ? "Importing..."
                : `Exclude ${
                    databaseDuplicateMatches.length
                  } Duplicate${
                    databaseDuplicateMatches.length ===
                    1
                      ? ""
                      : "s"
                  } & Continue`}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}