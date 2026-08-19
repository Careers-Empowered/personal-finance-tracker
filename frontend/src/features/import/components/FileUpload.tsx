import { useRef, useState } from "react";
import type { ChangeEvent, CSSProperties } from "react";

import type { FileUploadProps } from "../types/import";
import {
  formatFileSize,
  validateFile,
} from "../utils/fileValidation";

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

interface TransactionSummary {
  count: number;
  startDate: string;
  endDate: string;
  account: string;
}

function normalizeHeader(header: string): string {
  return header
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
}

function findColumn(
  headers: string[],
  possibleNames: string[]
): string | undefined {
  const normalizedPossibleNames = possibleNames.map(normalizeHeader);

  return headers.find((header) =>
    normalizedPossibleNames.includes(normalizeHeader(header))
  );
}

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const character = line[i];

    if (character === '"') {
      if (insideQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (character === "," && !insideQuotes) {
      values.push(current.trim());
      current = "";
    } else {
      current += character;
    }
  }

  values.push(current.trim());

  return values;
}

function parseDate(value: string): Date | null {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  // Handles DD/MM/YYYY and DD-MM-YYYY
  const dayMonthYearMatch = trimmedValue.match(
    /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/
  );

  if (dayMonthYearMatch) {
    const day = Number(dayMonthYearMatch[1]);
    const month = Number(dayMonthYearMatch[2]) - 1;
    const year = Number(dayMonthYearMatch[3]);

    const date = new Date(year, month, day);

    if (
      date.getFullYear() === year &&
      date.getMonth() === month &&
      date.getDate() === day
    ) {
      return date;
    }

    return null;
  }

  const parsedDate = new Date(trimmedValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function extractTransactionSummary(
  csvText: string
): TransactionSummary {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new Error("The transaction CSV does not contain any data.");
  }

  const headers = parseCSVLine(lines[0]);

  const dateColumn = findColumn(headers, [
    "date",
    "transaction date",
    "transaction_date",
    "txn date",
    "txn_date",
    "value date",
    "value_date",
    "posting date",
    "posting_date",
  ]);

  const accountColumn = findColumn(headers, [
    "account",
    "account name",
    "account_name",
    "account number",
    "account_number",
    "bank account",
    "bank_account",
    "bank account name",
    "bank_account_name",
  ]);

  if (!dateColumn) {
    throw new Error(
      "Could not find a transaction date column in the CSV."
    );
  }

  const dateColumnIndex = headers.indexOf(dateColumn);
  const accountColumnIndex = accountColumn
    ? headers.indexOf(accountColumn)
    : -1;

  const dates: Date[] = [];
  const accounts: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);

    const dateValue = values[dateColumnIndex];

    if (dateValue) {
      const date = parseDate(dateValue);

      if (date) {
        dates.push(date);
      }
    }

    if (accountColumnIndex !== -1) {
      const accountValue = values[accountColumnIndex]?.trim();

      if (accountValue) {
        accounts.push(accountValue);
      }
    }
  }

  if (dates.length === 0) {
    throw new Error(
      "Could not find valid transaction dates in the CSV."
    );
  }

  const earliestDate = new Date(
    Math.min(...dates.map((date) => date.getTime()))
  );

  const latestDate = new Date(
    Math.max(...dates.map((date) => date.getTime()))
  );

  const uniqueAccounts = [...new Set(accounts)];

  let account = "Not detected";

  if (uniqueAccounts.length === 1) {
    account = uniqueAccounts[0];
  } else if (uniqueAccounts.length > 1) {
    account = uniqueAccounts.join(", ");
  }

  return {
    count: lines.length - 1,
    startDate: formatDate(earliestDate),
    endDate: formatDate(latestDate),
    account,
  };
}

interface AccountOption {
  id: string;
  name: string;
  currency?: string;
}

interface FileUploadAccountProps {
  accounts: AccountOption[];
  selectedAccountId: string;
  onAccountChange: (accountId: string) => void;
  accountsLoading?: boolean;

  onTransactionContinue?: (file: File) => void;
}

function FileUpload({
  mode,
  onModeChange,
  onFileSelected,
  onPreview,
  accounts,
  selectedAccountId,
  onAccountChange,
  accountsLoading = false,
  onTransactionContinue,
}: FileUploadProps & FileUploadAccountProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [error, setError] = useState("");

  const [transactionSummary, setTransactionSummary] =
    useState<TransactionSummary | null>(null);

  const handleFileChange = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");

    const validationResult = validateFile(file);

    if (!validationResult.isValid) {
      setSelectedFile(null);
      setTransactionSummary(null);

      setError(
        validationResult.error ?? "Invalid file."
      );

      event.target.value = "";

      return;
    }

    setSelectedFile(file);
    onFileSelected(file);

    // Transaction Data mode:
    // Read the CSV immediately and create the summary.
    if (mode === "transaction") {
      try {
        const csvText = await file.text();

        const summary =
          extractTransactionSummary(csvText);

        setTransactionSummary(summary);
      } catch (summaryError) {
        setTransactionSummary(null);

        setError(
          summaryError instanceof Error
            ? summaryError.message
            : "Unable to read transaction data."
        );
      }

      return;
    }

    // Normal CSV mode does not parse the transaction summary.
    setTransactionSummary(null);
  };

  const handleChooseFile = () => {
    if (!selectedAccountId) {
      setError("Select the account for further actions");
      return;
    }

    setError("");
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setTransactionSummary(null);
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleModeChange = (
    newMode: "csv" | "transaction"
  ) => {
    onModeChange(newMode);

    setSelectedFile(null);
    setTransactionSummary(null);
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePreview = () => {
    if (!selectedFile) {
      return;
    }

    if (onPreview) {
      onPreview();
    }
  };

  const handleTransactionContinue = () => {
    if (!selectedFile || !transactionSummary) {
      setError(
        "Please select a transaction data file first."
      );
      return;
    }

    if (!selectedAccountId) {
      setError(
        "Select the account for further actions"
      );
      return;
    }

    console.log(
      "Transaction data ready:",
      selectedFile.name,
      transactionSummary
    );

    if (onTransactionContinue) {
      onTransactionContinue(selectedFile);
    }
  };
  const isTransactionMode = mode === "transaction";

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
          Import Financial File
        </h2>

        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.95rem",
            color: "var(--color-text-muted)",
          }}
        >
          Upload a CSV file containing your financial
          transactions.
        </p>
      </div>

      {/* ACCOUNT SELECTION */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: "0.75rem",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
        }}
      >
        <label
          htmlFor="import-account"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.9rem",
            fontWeight: 600,
            color: "var(--color-text-dark)",
          }}
        >
          Import Into
        </label>

        <select
          id="import-account"
          value={selectedAccountId}
          onChange={(event) => {
            onAccountChange(event.target.value);
            setError("");
          }}
          disabled={accountsLoading}
          style={{
            minWidth: "250px",
            padding: "0.7rem 0.9rem",
            border: "1px solid var(--color-divider)",
            borderRadius: "8px",
            backgroundColor: "#ffffff",
            color: "var(--color-text-dark)",
            fontFamily: "var(--font-body)",
            fontSize: "0.9rem",
            cursor: accountsLoading ? "not-allowed" : "pointer",
          }}
        >
          <option value="">
            {accountsLoading
              ? "Loading accounts..."
              : "Select an account"}
          </option>

          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
              {account.currency ? ` (${account.currency})` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* IMPORT MODE */}
      <div
        style={{
          display: "flex",
          gap: "1.5rem",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
        }}
      >
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontFamily: "var(--font-body)",
            fontSize: "0.95rem",
            color: "var(--color-text-dark)",
            cursor: "pointer",
          }}
        >
          <input
            type="radio"
            name="importMode"
            value="csv"
            checked={mode === "csv"}
            onChange={() => handleModeChange("csv")}
          />

          CSV File
        </label>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontFamily: "var(--font-body)",
            fontSize: "0.95rem",
            color: "var(--color-text-dark)",
            cursor: "pointer",
          }}
        >
          <input
            type="radio"
            name="importMode"
            value="transaction"
            checked={mode === "transaction"}
            onChange={() =>
              handleModeChange("transaction")
            }
          />

          Transaction Data / Bank Statement
        </label>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={handleFileChange}
        hidden
      />

      {/* CHOOSE FILE CARD */}
      {!selectedFile && (
        <div
          style={{
            border: "2px dashed var(--color-divider)",
            borderRadius: "12px",
            padding: "3rem 2rem",
            textAlign: "center",
            backgroundColor: "var(--color-background)",
          }}
        >
          <div
            style={{
              fontSize: "2.5rem",
              marginBottom: "1rem",
            }}
          >
            📄
          </div>

          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "1rem",
              fontWeight: 600,
              color: "var(--color-text-dark)",
              marginBottom: "1rem",
            }}
          >
            {isTransactionMode
              ? "Select a transaction data CSV file"
              : "Select a CSV file to import"}
          </p>

          <button
            type="button"
            style={primaryButtonStyle}
            onClick={handleChooseFile}
          >
            Choose File
          </button>

          <p
            style={{
              marginTop: "0.75rem",
              fontSize: "0.8rem",
              color: "var(--color-text-muted)",
            }}
          >
            CSV files only · Maximum size: 10 MB
          </p>
        </div>
      )}

      {/* SELECTED FILE CARD */}
      {selectedFile && (
        <>
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid var(--color-divider)",
              borderRadius: "12px",
              padding: "1.25rem",
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
                  width: "42px",
                  height: "42px",
                  borderRadius: "8px",
                  backgroundColor: "#fff1e3",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.25rem",
                  flexShrink: 0,
                }}
              >
                📄
              </div>

              <div style={{ minWidth: 0 }}>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    color: "var(--color-text-dark)",
                    margin: 0,
                    wordBreak: "break-word",
                  }}
                >
                  {selectedFile.name}
                </p>

                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.8rem",
                    color: "var(--color-text-muted)",
                    marginTop: "0.25rem",
                  }}
                >
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>

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
                onClick={handleChooseFile}
              >
                Change File
              </button>

              <button
                type="button"
                style={secondaryButtonStyle}
                onClick={handleRemoveFile}
              >
                Remove
              </button>
            </div>
          </div>

          {/* TRANSACTION DATA SUMMARY */}
          {isTransactionMode &&
            transactionSummary && (
              <div
                style={{
                  backgroundColor: "#ffffff",
                  border:
                    "1px solid var(--color-divider)",
                  borderRadius: "12px",
                  padding: "1.5rem",
                  marginTop: "1rem",
                }}
              >
                <div
                  style={{
                    marginBottom: "1.25rem",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.85rem",
                      color: "var(--color-text-muted)",
                      marginBottom: "0.35rem",
                    }}
                  >
                    Transactions found
                  </p>

                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      color: "var(--color-text-dark)",
                      margin: 0,
                    }}
                  >
                    {transactionSummary.count}
                  </p>
                </div>

                <div
                  style={{
                    marginBottom: "1.25rem",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.85rem",
                      color: "var(--color-text-muted)",
                      marginBottom: "0.35rem",
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
                    {transactionSummary.startDate} →{" "}
                    {transactionSummary.endDate}
                  </p>
                </div>

                <div>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.85rem",
                      color: "var(--color-text-muted)",
                      marginBottom: "0.35rem",
                    }}
                  >
                    Account
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
                    {transactionSummary.account}
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: "1.5rem",
                  }}
                >
                  <button
                    type="button"
                    style={primaryButtonStyle}
                    onClick={handleTransactionContinue}
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

          {/* NORMAL CSV PREVIEW BUTTON */}
          {!isTransactionMode && (
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "1.5rem",
              }}
            >
              <button
                type="button"
                style={primaryButtonStyle}
                onClick={handlePreview}
              >
                Preview
              </button>
            </div>
          )}
        </>
      )}

      {/* ERROR */}
      {error && (
        <p
          role="alert"
          style={{
            marginTop: "1rem",
            padding: "0.75rem 1rem",
            borderRadius: "8px",
            backgroundColor: "#fff5f4",
            border: "1px solid #e5c5c2",
            color: "#b42318",
            fontFamily: "var(--font-body)",
            fontSize: "0.85rem",
          }}
        >
          {error}
        </p>
      )}
    </section>
  );
}

export default FileUpload;