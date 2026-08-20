import React from "react";
import type { ValidatedTransaction } from "../types/import";

export interface DatabaseDuplicateMatch {
  row: number;
  exists: boolean;
  existingTransaction?: {
    id?: string;
    date?: string;
    title?: string;
    amount?: number | string;
    type?: string;
    account?: {
      id?: string;
      name?: string;
    };
  };
}

interface DatabaseDuplicateCheckProps {
  transactions: ValidatedTransaction[];
  matches: DatabaseDuplicateMatch[];

  onBack: () => void;
  onContinue: () => void;
}

const DatabaseDuplicateCheck: React.FC<
  DatabaseDuplicateCheckProps
> = ({
  transactions,
  matches,
  onBack,
  onContinue,
}) => {
  const duplicateMatches = matches.filter(
    (match) => match.exists
  );

  /*
   * Find the imported transaction corresponding
   * to a database duplicate.
   */
  const getImportedTransaction = (row: number) => {
    return transactions.find(
      (transaction) =>
        transaction.row === row
    );
  };

  const formatAmount = (
    amount: number | string | undefined
  ) => {
    if (
      amount === undefined ||
      amount === null ||
      amount === ""
    ) {
      return "-";
    }

    const numericAmount = Number(amount);

    if (Number.isNaN(numericAmount)) {
      return String(amount);
    }

    return numericAmount.toFixed(2);
  };

  const formatType = (
    type: string | undefined
  ) => {
    if (!type) {
      return "-";
    }

    return type.charAt(0).toUpperCase() +
      type.slice(1).toLowerCase();
  };

  /*
   * If there are no database duplicates,
   * this page should normally be skipped by
   * Import.tsx.
   */
  if (duplicateMatches.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "2rem",
        boxSizing: "border-box",
      }}
    >
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div
        style={{
          marginBottom: "1.5rem",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "2rem",
            fontWeight: 700,
            color: "#1f1f1f",
          }}
        >
          Database Duplicate Check
        </h1>

        <p
          style={{
            marginTop: "0.5rem",
            color: "#666",
            fontSize: "1rem",
          }}
        >
          Some transactions from this import already
          exist in the selected account.
        </p>
      </div>

      {/* =====================================================
          SUMMARY
      ====================================================== */}

      <div
        style={{
          border: "1px solid #f0caca",
          backgroundColor: "#fff7f7",
          borderRadius: "12px",
          padding: "1.25rem",
          marginBottom: "1.5rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <span
            style={{
              fontSize: "1.5rem",
            }}
          >
            ⚠️
          </span>

          <div>
            <div
              style={{
                fontSize: "1.1rem",
                fontWeight: 700,
                color: "#b42318",
              }}
            >
              {duplicateMatches.length}{" "}
              transaction
              {duplicateMatches.length !== 1
                ? "s"
                : ""}{" "}
              already exist
            </div>

            <div
              style={{
                marginTop: "0.25rem",
                color: "#666",
              }}
            >
              These transactions were already found
              in your selected account.
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          DATABASE DUPLICATE CARDS
      ====================================================== */}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        {duplicateMatches.map(
          (match) => {
            const importedTransaction =
              getImportedTransaction(
                match.row
              );

            const importedData =
              importedTransaction?.data;

            const existing =
              match.existingTransaction;

            return (
              <div
                key={match.row}
                style={{
                  border:
                    "1px solid #f0b4b4",
                  backgroundColor:
                    "#fffafa",
                  borderRadius: "14px",
                  padding: "1.5rem",
                }}
              >
                {/* ================================
                    CARD HEADER
                ================================= */}

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems: "center",
                    marginBottom:
                      "1.25rem",
                  }}
                >
                  <div
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: 700,
                    }}
                  >
                    Row {match.row}
                  </div>

                  <div
                    style={{
                      color: "#b42318",
                      fontWeight: 700,
                    }}
                  >
                    ⚠ Already Exists
                  </div>
                </div>

                {/* ================================
                    IMPORTED TRANSACTION
                ================================= */}

                <div
                  style={{
                    backgroundColor:
                      "#fff",
                    border:
                      "1px solid #e5e5e5",
                    borderRadius: "10px",
                    padding: "1rem",
                    marginBottom:
                      "1rem",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      marginBottom:
                        "0.75rem",
                      color: "#333",
                    }}
                  >
                    Imported Transaction
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(3, 1fr)",
                      gap: "1rem",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          color: "#777",
                          fontSize:
                            "0.85rem",
                        }}
                      >
                        Date
                      </div>

                      <div
                        style={{
                          fontWeight: 600,
                          marginTop:
                            "0.25rem",
                        }}
                      >
                        {importedData
                          ?.date || "-"}
                      </div>
                    </div>

                    <div>
                      <div
                        style={{
                          color: "#777",
                          fontSize:
                            "0.85rem",
                        }}
                      >
                        Description
                      </div>

                      <div
                        style={{
                          fontWeight: 600,
                          marginTop:
                            "0.25rem",
                        }}
                      >
                        {importedData
                          ?.title || "-"}
                      </div>
                    </div>

                    <div>
                      <div
                        style={{
                          color: "#777",
                          fontSize:
                            "0.85rem",
                        }}
                      >
                        Amount
                      </div>

                      <div
                        style={{
                          fontWeight: 600,
                          marginTop:
                            "0.25rem",
                        }}
                      >
                        {formatAmount(
                          importedData
                            ?.amount
                        )}
                      </div>
                    </div>

                    <div>
                      <div
                        style={{
                          color: "#777",
                          fontSize:
                            "0.85rem",
                        }}
                      >
                        Type
                      </div>

                      <div
                        style={{
                          fontWeight: 600,
                          marginTop:
                            "0.25rem",
                        }}
                      >
                        {formatType(
                          importedData
                            ?.type
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ================================
                    EXISTING DATABASE TRANSACTION
                ================================= */}

                <div
                  style={{
                    backgroundColor:
                      "#fff4e8",
                    border:
                      "1px solid #f2d1ad",
                    borderRadius: "10px",
                    padding: "1rem",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      marginBottom:
                        "0.75rem",
                      color: "#8a4b08",
                    }}
                  >
                    Matching Database Transaction
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(3, 1fr)",
                      gap: "1rem",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          color: "#777",
                          fontSize:
                            "0.85rem",
                        }}
                      >
                        Date
                      </div>

                      <div
                        style={{
                          fontWeight: 600,
                          marginTop:
                            "0.25rem",
                        }}
                      >
                        {existing
                          ?.date || "-"}
                      </div>
                    </div>

                    <div>
                      <div
                        style={{
                          color: "#777",
                          fontSize:
                            "0.85rem",
                        }}
                      >
                        Description
                      </div>

                      <div
                        style={{
                          fontWeight: 600,
                          marginTop:
                            "0.25rem",
                        }}
                      >
                        {existing
                          ?.title || "-"}
                      </div>
                    </div>

                    <div>
                      <div
                        style={{
                          color: "#777",
                          fontSize:
                            "0.85rem",
                        }}
                      >
                        Amount
                      </div>

                      <div
                        style={{
                          fontWeight: 600,
                          marginTop:
                            "0.25rem",
                        }}
                      >
                        {formatAmount(
                          existing
                            ?.amount
                        )}
                      </div>
                    </div>

                    <div>
                      <div
                        style={{
                          color: "#777",
                          fontSize:
                            "0.85rem",
                        }}
                      >
                        Type
                      </div>

                      <div
                        style={{
                          fontWeight: 600,
                          marginTop:
                            "0.25rem",
                        }}
                      >
                        {formatType(
                          existing
                            ?.type
                        )}
                      </div>
                    </div>

                    <div>
                      <div
                        style={{
                          color: "#777",
                          fontSize:
                            "0.85rem",
                        }}
                      >
                        Account
                      </div>

                      <div
                        style={{
                          fontWeight: 600,
                          marginTop:
                            "0.25rem",
                        }}
                      >
                        {existing
                          ?.account
                          ?.name ||
                          "-"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          }
        )}
      </div>

      {/* =====================================================
          INFORMATION
      ====================================================== */}

      <div
        style={{
          marginTop: "1.5rem",
          padding: "1rem",
          backgroundColor: "#f7f7f7",
          borderRadius: "10px",
          color: "#555",
        }}
      >
        <strong>What does this mean?</strong>

        <p
          style={{
            margin:
              "0.5rem 0 0",
          }}
        >
          These transactions are already present in
          the selected account. Continuing will
          import the transactions from the file as
          well.
        </p>
      </div>

      {/* =====================================================
          ACTION BUTTONS
      ====================================================== */}

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          marginTop: "2rem",
        }}
      >
        <button
          type="button"
          onClick={onBack}
          style={{
            padding:
              "0.8rem 1.4rem",
            border: "none",
            borderRadius: "8px",
            backgroundColor:
              "#f1f1f1",
            color: "#222",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Back
        </button>

        <button
          type="button"
          onClick={onContinue}
          style={{
            padding:
              "0.8rem 1.5rem",
            border: "none",
            borderRadius: "8px",
            backgroundColor:
              "#d8892f",
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Continue to Import
        </button>
      </div>
    </div>
  );
};

export default DatabaseDuplicateCheck;