import { useState } from "react";
import type { CSSProperties } from "react";

import type {
  ImportedTransaction,
  ValidatedTransaction,
} from "../types/import";

import { validateTransactions } from "../utils/transactionValidation";
import { markDuplicateTransactions } from "../utils/duplicateDetection";

/**
 * Result returned by the Categorization feature.
 *
 * The Import Validation feature does not implement
 * Rule-based or SLM categorization logic.
 */
export interface CategorySuggestion {
  category: string;
  source: "RULE" | "SLM";
  confidence?: number;
}

interface ImportValidationProps {
  transactions: ImportedTransaction[];

  onContinue: (
    transactions: ValidatedTransaction[]
  ) => void;

  onBack?: () => void;

  /**
   * Called when the user clicks "Categorize".
   *
   * The Categorization feature will eventually provide
   * the Rule-based -> SLM implementation.
   */
  onCategorize?: (
    transaction: ImportedTransaction
  ) => Promise<CategorySuggestion | null>;
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

const categoryButtonStyle: CSSProperties = {
  backgroundColor: "var(--color-primary)",
  color: "#ffffff",
  border: "none",
  borderRadius: "7px",
  padding: "0.55rem 0.9rem",
  fontFamily: "var(--font-body)",
  fontSize: "0.82rem",
  fontWeight: 600,
  cursor: "pointer",
};

const iconButtonStyle: CSSProperties = {
  width: "34px",
  height: "34px",
  borderRadius: "7px",
  border: "1px solid var(--color-divider)",
  backgroundColor: "#ffffff",
  color: "var(--color-text-dark)",
  fontSize: "1rem",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

function ImportValidation({
  transactions,
  onContinue,
  onBack,
  onCategorize,
}: ImportValidationProps) {
  /*
   * Validate the imported transactions first,
   * then run duplicate detection.
   */
  const [validatedRows, setValidatedRows] =
    useState<ValidatedTransaction[]>(() => {
      const validated = validateTransactions(transactions);

      return markDuplicateTransactions(validated);
    });

  /*
   * Row currently being edited for validation.
   */
  const [editingRow, setEditingRow] =
    useState<number | null>(null);

  /*
   * Category suggestions returned by the
   * categorization feature.
   *
   * Key = transaction row number.
   */
  const [categorySuggestions, setCategorySuggestions] =
    useState<Record<number, CategorySuggestion>>({});

  /*
   * Row currently being categorized.
   */
  const [categorizingRow, setCategorizingRow] =
    useState<number | null>(null);

  /*
   * Tracks whether the user accepted a category
   * suggestion.
   */
  const [acceptedCategories, setAcceptedCategories] =
    useState<Record<number, boolean>>({});

  /*
   * Row currently in manual category-edit mode.
   */
  const [editingCategoryRow, setEditingCategoryRow] =
    useState<number | null>(null);

  /*
   * Temporary values entered during category editing.
   */
  const [manualCategoryValues, setManualCategoryValues] =
    useState<Record<number, string>>({});

  /*
   * Messages related to categorization.
   */
  const [categorizationMessages, setCategorizationMessages] =
    useState<Record<number, string>>({});

  /*
   * Summary counts.
   */
  const validCount = validatedRows.filter(
    (row) => row.isValid && !row.excluded
  ).length;

  const invalidCount = validatedRows.filter(
    (row) => !row.isValid && !row.excluded
  ).length;

  const excludedCount = validatedRows.filter(
    (row) => row.excluded
  ).length;

  /*
   * Category is OPTIONAL.
   *
   * Therefore, it is intentionally NOT included
   * in the Continue validation.
   */
  const canContinue = invalidCount === 0;

  /**
   * Update a transaction field while fixing
   * an invalid transaction.
   */
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

  /**
   * Revalidate a transaction after the user fixes it.
   */
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

  /**
   * Exclude an invalid transaction.
   */
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

    /*
     * Remove categorization state for an excluded row.
     */
    setCategorySuggestions((current) => {
      const updated = { ...current };
      delete updated[rowNumber];
      return updated;
    });

    setAcceptedCategories((current) => {
      const updated = { ...current };
      delete updated[rowNumber];
      return updated;
    });

    setCategorizationMessages((current) => {
      const updated = { ...current };
      delete updated[rowNumber];
      return updated;
    });
  };

  /**
   * Trigger the Categorization feature.
   *
   * This component does NOT contain:
   * - Rule-based categorization
   * - SLM logic
   * - AI calls
   *
   * It only consumes the result.
   */
  const handleCategorize = async (
    row: ValidatedTransaction
  ) => {
    /*
     * Until the Categorization feature is connected,
     * show a clear message instead of using fake data.
     */
    if (!onCategorize) {
      setCategorizationMessages((current) => ({
        ...current,
        [row.row]:
          "Categorization is not connected yet.",
      }));

      return;
    }

    setCategorizingRow(row.row);

    setCategorizationMessages((current) => ({
      ...current,
      [row.row]: "",
    }));

    try {
      const suggestion = await onCategorize(row.data);

      /*
       * No suggestion returned.
       */
      if (!suggestion) {
        setCategorizationMessages((current) => ({
          ...current,
          [row.row]:
            "No category suggestion was found.",
        }));

        return;
      }

      /*
       * Store the suggestion.
       *
       * IMPORTANT:
       * The suggestion is NOT automatically applied.
       */
      setCategorySuggestions((current) => ({
        ...current,
        [row.row]: suggestion,
      }));

      setAcceptedCategories((current) => ({
        ...current,
        [row.row]: false,
      }));
    } catch (error) {
      console.error(
        "Categorization failed:",
        error
      );

      setCategorizationMessages((current) => ({
        ...current,
        [row.row]:
          "Unable to categorize this transaction.",
      }));
    } finally {
      setCategorizingRow(null);
    }
  };

  /**
   * Accept the suggested category.
   */
  const handleAcceptCategory = (
    rowNumber: number
  ) => {
    const suggestion =
      categorySuggestions[rowNumber];

    if (!suggestion) {
      return;
    }

    setValidatedRows((currentRows) =>
      currentRows.map((row) => {
        if (row.row !== rowNumber) {
          return row;
        }

        return {
          ...row,
          data: {
            ...row.data,
            category: suggestion.category,
          },
        };
      })
    );

    setAcceptedCategories((current) => ({
      ...current,
      [rowNumber]: true,
    }));

    setEditingCategoryRow(null);
  };

  /**
   * Open manual category editing.
   */
  const handleEditCategory = (
    row: ValidatedTransaction
  ) => {
    const suggestion =
      categorySuggestions[row.row];

    setEditingCategoryRow(row.row);

    setManualCategoryValues((current) => ({
      ...current,
      [row.row]:
        row.data.category ||
        suggestion?.category ||
        "",
    }));
  };

  /**
   * Save manually entered category.
   *
   * Category remains optional overall,
   * but if the user enters one, we save it.
   */
  const handleSaveCategory = (
    rowNumber: number
  ) => {
    const category =
      manualCategoryValues[rowNumber]?.trim();

    /*
     * Do nothing if the user tries to save
     * an empty category.
     */
    if (!category) {
      return;
    }

    setValidatedRows((currentRows) =>
      currentRows.map((row) => {
        if (row.row !== rowNumber) {
          return row;
        }

        return {
          ...row,
          data: {
            ...row.data,
            category,
          },
        };
      })
    );

    /*
     * Manual category is considered confirmed.
     */
    setAcceptedCategories((current) => ({
      ...current,
      [rowNumber]: true,
    }));

    setEditingCategoryRow(null);
  };

  /**
   * Continue with all valid, non-excluded transactions.
   *
   * CATEGORY IS OPTIONAL.
   *
   * Therefore, transactions without categories
   * are still passed to the next stage.
   */
  const handleContinue = () => {
    const validRows = validatedRows.filter(
      (row) =>
        row.isValid &&
        !row.excluded
    );

    onContinue(validRows);
  };

  /**
   * Determine whether a row was marked as duplicate.
   *
   * Duplicate detection itself is handled by
   * duplicateDetection.ts.
   */
  const isDuplicateRow = (
    row: ValidatedTransaction
  ): boolean => {
    return row.errors.some(
      (error) =>
        error.field === "transaction" &&
        error.message
          .toLowerCase()
          .includes("duplicate")
    );
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
      {/* Heading */}
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
        {validatedRows.map((row) => {
          const suggestion =
            categorySuggestions[row.row];

          const isCategorizing =
            categorizingRow === row.row;

          const isCategoryEditing =
            editingCategoryRow === row.row;

          const categoryAccepted =
            acceptedCategories[row.row];

          return (
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
              {/* Row Header */}
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
                      color:
                        "var(--color-text-muted)",
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

              {/* Normal Display */}
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

                  {/* Category */}
                  <div>
                    <Info
                      label="Category"
                      value={
                        row.data.category?.trim()
                          ? row.data.category
                          : "Not categorized"
                      }
                    />

                    {/*
                     * Categorize button is only useful
                     * when the row is valid and category
                     * has not been filled.
                     *
                     * Category is OPTIONAL.
                     */}
                    {row.isValid &&
                      !row.excluded &&
                      !row.data.category?.trim() &&
                      !suggestion &&
                      !isCategoryEditing && (
                        <button
                          type="button"
                          style={{
                            ...categoryButtonStyle,
                            marginTop: "0.5rem",
                          }}
                          onClick={() =>
                            handleCategorize(row)
                          }
                          disabled={
                            isCategorizing
                          }
                        >
                          {isCategorizing
                            ? "Categorizing..."
                            : "✨ Categorize"}
                        </button>
                      )}

                    {/* Categorization message */}
                    {categorizationMessages[
                      row.row
                    ] && (
                      <div
                        style={{
                          marginTop: "0.5rem",
                          color: "#b26a00",
                          fontFamily:
                            "var(--font-body)",
                          fontSize:
                            "0.75rem",
                        }}
                      >
                        {
                          categorizationMessages[
                            row.row
                          ]
                        }
                      </div>
                    )}

                    {/* Suggested Category */}
                    {suggestion &&
                      !categoryAccepted &&
                      !isCategoryEditing && (
                        <div
                          style={{
                            marginTop: "0.65rem",
                            padding: "0.7rem",
                            borderRadius: "8px",
                            backgroundColor:
                              "#f7f9fc",
                            border:
                              "1px solid var(--color-divider)",
                          }}
                        >
                          <div
                            style={{
                              fontSize:
                                "0.72rem",
                              color:
                                "var(--color-text-muted)",
                              marginBottom:
                                "0.25rem",
                            }}
                          >
                            Suggested category
                          </div>

                          <div
                            style={{
                              display: "flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "space-between",
                              gap: "0.75rem",
                            }}
                          >
                            <div>
                              <strong
                                style={{
                                  color:
                                    "var(--color-text-dark)",
                                  fontSize:
                                    "0.9rem",
                                }}
                              >
                                {suggestion.category}
                              </strong>

                              <div
                                style={{
                                  fontSize:
                                    "0.7rem",
                                  color:
                                    "var(--color-text-muted)",
                                  marginTop:
                                    "0.2rem",
                                }}
                              >
                                {suggestion.source ===
                                "RULE"
                                  ? "Rule-based suggestion"
                                  : `AI suggestion${
                                      suggestion.confidence !==
                                      undefined
                                        ? ` · ${Math.round(
                                            suggestion.confidence *
                                              100
                                          )}%`
                                        : ""
                                    }`}
                              </div>
                            </div>

                            <div
                              style={{
                                display: "flex",
                                gap: "0.4rem",
                              }}
                            >
                              {/* Accept */}
                              <button
                                type="button"
                                title="Accept category"
                                aria-label="Accept category"
                                style={{
                                  ...iconButtonStyle,
                                  color:
                                    "#188038",
                                  borderColor:
                                    "#b7d8bd",
                                }}
                                onClick={() =>
                                  handleAcceptCategory(
                                    row.row
                                  )
                                }
                              >
                                ✓
                              </button>

                              {/* Edit */}
                              <button
                                type="button"
                                title="Edit category"
                                aria-label="Edit category"
                                style={{
                                  ...iconButtonStyle,
                                  color:
                                    "var(--color-primary)",
                                }}
                                onClick={() =>
                                  handleEditCategory(
                                    row
                                  )
                                }
                              >
                                ✎
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                    {/* Manual Category Editing */}
                    {isCategoryEditing && (
                      <div
                        style={{
                          marginTop: "0.65rem",
                          display: "flex",
                          gap: "0.5rem",
                          alignItems:
                            "center",
                        }}
                      >
                        <input
                          type="text"
                          value={
                            manualCategoryValues[
                              row.row
                            ] || ""
                          }
                          onChange={(event) =>
                            setManualCategoryValues(
                              (current) => ({
                                ...current,
                                [row.row]:
                                  event.target
                                    .value,
                              })
                            )
                          }
                          placeholder="Enter category"
                          style={{
                            ...inputStyle,
                            flex: 1,
                          }}
                        />

                        <button
                          type="button"
                          style={
                            primaryButtonStyle
                          }
                          onClick={() =>
                            handleSaveCategory(
                              row.row
                            )
                          }
                        >
                          Save
                        </button>
                      </div>
                    )}

                    {/* Category Confirmed */}
                    {categoryAccepted &&
                      row.data.category && (
                        <div
                          style={{
                            marginTop: "0.5rem",
                            display: "flex",
                            alignItems:
                              "center",
                            gap: "0.4rem",
                            color: "#188038",
                            fontFamily:
                              "var(--font-body)",
                            fontSize:
                              "0.75rem",
                            fontWeight: 600,
                          }}
                        >
                          ✓ Category confirmed
                        </div>
                      )}
                  </div>
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
                        color:
                          "var(--color-text-dark)",
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

              {/* Validation Errors */}
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

              {/* Fix / Exclude Actions */}
              {!row.excluded &&
                !row.isValid && (
                  <div
                    style={{
                      display: "flex",
                      gap: "0.75rem",
                      marginTop: "1rem",
                    }}
                  >
                    {editingRow ===
                    row.row ? (
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
                        handleExclude(
                          row.row
                        )
                      }
                    >
                      Exclude
                    </button>
                  </div>
                )}
            </div>
          );
        })}
      </div>

      {/* Bottom Actions */}
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
            opacity: canContinue ? 1 : 0.5,
          }}
          disabled={!canContinue}
          onClick={handleContinue}
        >
          Continue with {validCount} Transactions
        </button>
      </div>
    </section>
  );
}

/**
 * Summary card.
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
          color:
            "var(--color-text-dark)",
        }}
      >
        {value}
      </strong>
    </div>
  );
}

/**
 * Display-only transaction field.
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

/**
 * Reusable input for transaction editing.
 */
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