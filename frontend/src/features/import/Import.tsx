import { useEffect, useState } from "react";

import FileUpload from "./components/FileUpload";
import FilePreview from "./components/FilePreview";
import ImportValidation from "./components/ImportValidation";
import DuplicateDetection from "./components/DuplicateDetection";

import { markDuplicateTransactions } from "./utils/duplicateDetection";

import type {
  ImportMode,
  ImportedTransaction,
  ValidatedTransaction,
  DuplicateDecision,
} from "./types/import";

import { suggestCategoryByRules } from "./categorization/ruleCategorizationService";

import api from "../../shared/utils/api";

interface DatabaseDuplicateMatch {
  row: number;
  exists: boolean;
  existingTransaction?: {
    id?: string;
    accountId?: string;
    date?: string;
    title?: string;
    amount?: number | string;
    type?: "INCOME" | "EXPENSE" | string;
    account?: {
      id?: string;
      name?: string;
    };
  };
}

interface AccountOption {
  id: string;
  name: string;
  currency?: string;
}


/*
 * ============================================================
 * TRANSACTION DATA CSV HELPERS
 * ============================================================
 *
 * Transaction Data / Bank Statement mode is intentionally kept
 * separate from the normal CSV mapping flow.
 *
 * The selected account from the first screen is always used as
 * the database account for the complete file.
 */

function normalizeImportHeader(header: string): string {
  return header
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
}

function findImportColumn(
  headers: string[],
  possibleNames: string[]
): string | undefined {
  const normalizedNames = possibleNames.map(
    normalizeImportHeader
  );

  return headers.find((header) =>
    normalizedNames.includes(
      normalizeImportHeader(header)
    )
  );
}

function parseImportCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const character = line[i];

    if (character === '"') {
      if (
        insideQuotes &&
        line[i + 1] === '"'
      ) {
        current += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (
      character === "," &&
      !insideQuotes
    ) {
      values.push(current.trim());
      current = "";
    } else {
      current += character;
    }
  }

  values.push(current.trim());
  return values;
}

function parseImportDate(value: string): string | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  // DD/MM/YYYY or DD-MM-YYYY
  const dayMonthYear = trimmed.match(
    /^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/
  );

  if (dayMonthYear) {
    const day = Number(dayMonthYear[1]);
    const month = Number(dayMonthYear[2]);
    const year = Number(dayMonthYear[3]);

    const date = new Date(
      year,
      month - 1,
      day
    );

    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }

    return `${year.toString().padStart(4, "0")}-${month
      .toString()
      .padStart(2, "0")}-${day
      .toString()
      .padStart(2, "0")}`;
  }

  // ISO-style dates and other browser-readable dates.
  const parsed = new Date(trimmed);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed
    .toISOString()
    .split("T")[0];
}

function parseImportAmount(value: string): number {
  const cleaned = value
    .replace(/,/g, "")
    .replace(/[₹$€£]/g, "")
    .replace(/\s/g, "")
    .trim();

  if (!cleaned) {
    return 0;
  }

  // Supports accounting-style negative values: (123.45)
  if (
    cleaned.startsWith("(") &&
    cleaned.endsWith(")")
  ) {
    const numberValue = Number(
      cleaned.slice(1, -1)
    );

    return Number.isFinite(numberValue)
      ? -numberValue
      : 0;
  }

  const numberValue = Number(cleaned);

  return Number.isFinite(numberValue)
    ? numberValue
    : 0;
}

function parseTransactionDataCSV(
  csvText: string
): ImportedTransaction[] {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new Error(
      "The transaction CSV does not contain any data."
    );
  }

  const headers = parseImportCSVLine(
    lines[0]
  );

  const dateColumn = findImportColumn(
    headers,
    [
      "date",
      "transaction date",
      "transaction_date",
      "txn date",
      "txn_date",
      "value date",
      "value_date",
      "posting date",
      "posting_date",
    ]
  );

  const titleColumn = findImportColumn(
    headers,
    [
      "description",
      "transaction description",
      "transaction_description",
      "narration",
      "remarks",
      "remark",
      "details",
      "transaction details",
      "transaction",
      "title",
      "merchant",
      "payee",
      "particulars",
      "particular",
    ]
  );

  const amountColumn = findImportColumn(
    headers,
    [
      "amount",
      "transaction amount",
      "transaction_amount",
      "value",
    ]
  );

  const debitColumn = findImportColumn(
    headers,
    [
      "debit",
      "debit amount",
      "debit_amount",
      "withdrawal",
      "withdrawal amount",
      "withdrawals",
    ]
  );

  const creditColumn = findImportColumn(
    headers,
    [
      "credit",
      "credit amount",
      "credit_amount",
      "deposit",
      "deposit amount",
      "deposits",
    ]
  );

  const typeColumn = findImportColumn(
    headers,
    [
      "type",
      "transaction type",
      "transaction_type",
      "txn type",
      "txn_type",
      "debit credit",
      "debit/credit",
    ]
  );

  const categoryColumn = findImportColumn(
    headers,
    [
      "category",
      "transaction category",
      "transaction_category",
    ]
  );

  if (!dateColumn) {
    throw new Error(
      "Could not find a transaction date column in the CSV."
    );
  }

  if (!titleColumn) {
    throw new Error(
      "Could not find a transaction description/title column in the CSV."
    );
  }

  if (
    !amountColumn &&
    !debitColumn &&
    !creditColumn
  ) {
    throw new Error(
      "Could not find an amount, debit, or credit column in the CSV."
    );
  }

  const dateIndex = headers.indexOf(dateColumn);
  const titleIndex = headers.indexOf(titleColumn);
  const amountIndex = amountColumn
    ? headers.indexOf(amountColumn)
    : -1;
  const debitIndex = debitColumn
    ? headers.indexOf(debitColumn)
    : -1;
  const creditIndex = creditColumn
    ? headers.indexOf(creditColumn)
    : -1;
  const typeIndex = typeColumn
    ? headers.indexOf(typeColumn)
    : -1;
  const categoryIndex = categoryColumn
    ? headers.indexOf(categoryColumn)
    : -1;

  const transactions: ImportedTransaction[] = [];
  const skippedRows: number[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rowNumber = i + 1;
    const values = parseImportCSVLine(lines[i]);

    const rawDate =
      values[dateIndex]?.trim() ?? "";

    const date = parseImportDate(rawDate);

    if (!date) {
      skippedRows.push(rowNumber);
      continue;
    }

    const title =
      values[titleIndex]?.trim() ?? "";

    if (!title) {
      skippedRows.push(rowNumber);
      continue;
    }

    let amount = 0;
    let type: "income" | "expense";

    if (amountIndex !== -1) {
      const rawAmount =
        values[amountIndex]?.trim() ?? "";

      const parsedAmount =
        parseImportAmount(rawAmount);

      if (!Number.isFinite(parsedAmount) || parsedAmount === 0) {
        skippedRows.push(rowNumber);
        continue;
      }

      amount = Math.abs(parsedAmount);

      if (typeIndex !== -1) {
        const rawType =
          values[typeIndex]
            ?.trim()
            .toLowerCase() ?? "";

        if (
          rawType === "income" ||
          rawType === "credit" ||
          rawType === "cr" ||
          rawType === "deposit"
        ) {
          type = "income";
        } else if (
          rawType === "expense" ||
          rawType === "debit" ||
          rawType === "dr" ||
          rawType === "withdrawal"
        ) {
          type = "expense";
        } else {
          type =
            parsedAmount >= 0
              ? "income"
              : "expense";
        }
      } else {
        type =
          parsedAmount >= 0
            ? "income"
            : "expense";
      }
    } else {
      const debit =
        debitIndex !== -1
          ? parseImportAmount(
              values[debitIndex] ?? ""
            )
          : 0;

      const credit =
        creditIndex !== -1
          ? parseImportAmount(
              values[creditIndex] ?? ""
            )
          : 0;

      if (credit !== 0) {
        amount = Math.abs(credit);
        type = "income";
      } else if (debit !== 0) {
        amount = Math.abs(debit);
        type = "expense";
      } else {
        skippedRows.push(rowNumber);
        continue;
      }
    }

    const category =
      categoryIndex !== -1
        ? values[categoryIndex]?.trim() || undefined
        : undefined;

    transactions.push({
      date,
      title,
      amount,
      type,
      account: "",
      category,
    });
  }

  if (transactions.length === 0) {
    throw new Error(
      "No valid transactions could be read from the selected transaction data CSV."
    );
  }

  console.log(
    "Transaction Data CSV parsed successfully:",
    {
      transactionCount: transactions.length,
      skippedRows,
    }
  );

  return transactions;
}

function Import() {
  /*
   * ============================================================
   * IMPORT MODE
   * ============================================================
   */

  const [importMode, setImportMode] =
    useState<ImportMode>("csv");

  /*
   * ============================================================
   * FILE
   * ============================================================
   */

  const [file, setFile] =
    useState<File | null>(null);

  /*
   * ============================================================
   * PARSED TRANSACTIONS
   * ============================================================
   */

  const [transactions, setTransactions] =
    useState<ImportedTransaction[]>([]);

  /*
   * ============================================================
   * VALIDATED TRANSACTIONS
   * ============================================================
   */

  const [validatedTransactions, setValidatedTransactions] =
    useState<ValidatedTransaction[]>([]);

  /*
   * ============================================================
   * TRANSACTIONS READY FOR IMPORT
   * ============================================================
   */

  const [transactionsForImport, setTransactionsForImport] =
    useState<ValidatedTransaction[]>([]);

  /*
   * ============================================================
   * DUPLICATE DECISIONS
   * ============================================================
   */

  const [duplicateDecisions, setDuplicateDecisions] =
    useState<DuplicateDecision[]>([]);

  /*
   * ============================================================
   * IMPORT STEP
   * ============================================================
   */

  const [step, setStep] = useState<
    | "upload"
    | "preview"
    | "validation"
    | "duplicate"
    | "database-duplicate-check"
  >("upload");

  /*
   * ============================================================
   * IMPORTING STATE
   * ============================================================
   */

  const [isImporting, setIsImporting] =
    useState(false);

  /*
   * ============================================================
   * DATABASE DUPLICATE CHECK STATE
   * ============================================================
   */

  const [selectedAccountId, setSelectedAccountId] =
    useState("");

  const [accounts, setAccounts] =
    useState<AccountOption[]>([]);

  const [accountsLoading, setAccountsLoading] =
    useState(true);

  const [databaseDuplicateMatches, setDatabaseDuplicateMatches] =
    useState<DatabaseDuplicateMatch[]>([]);

  /*
   * ============================================================
   * LOAD ACCOUNTS
   * ============================================================
   *
   * The account is selected on the first import screen.
   * The selected account applies to the entire import file.
   */

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        setAccountsLoading(true);

        const response = await api.get('/api/transactions/accounts');

        const rawAccounts =
          response.data?.accounts ??
          response.data?.data ??
          response.data ??
          [];

        if (!Array.isArray(rawAccounts)) {
          throw new Error("Invalid accounts response.");
        }

        const normalizedAccounts: AccountOption[] =
          rawAccounts
            .map((account: any) => ({
              id: String(account?.id ?? ""),
              name:
                String(
                  account?.name ??
                    account?.accountName ??
                    account?.account_name ??
                    ""
                ).trim(),
              currency:
                account?.currency ??
                account?.currencyCode ??
                account?.currency_code ??
                undefined,
            }))
            .filter(
              (account: AccountOption) =>
                Boolean(account.id) &&
                Boolean(account.name)
            );

        setAccounts(normalizedAccounts);
      } catch (error) {
        console.error("Failed to load accounts:", error);
        setAccounts([]);
        alert(
          "Unable to load accounts. Please refresh the page and try again."
        );
      } finally {
        setAccountsLoading(false);
      }
    };

    loadAccounts();
  }, []);

  /*
   * ============================================================
   * ACCOUNT SELECTION
   * ============================================================
   */

  const handleAccountChange = (accountId: string) => {
    setSelectedAccountId(accountId);

    /*
     * Changing the account invalidates any previous
     * database-duplicate result because the same transaction
     * may exist in one account but not another.
     */
    setDatabaseDuplicateMatches([]);
  };

  /*
   * ============================================================
   * FILE SELECTED
   * ============================================================
   */

  const handleFileSelected = (
    selectedFile: File
  ) => {
    setFile(selectedFile);

    setTransactions([]);

    setValidatedTransactions([]);

    setTransactionsForImport([]);

    setDuplicateDecisions([]);
    setDatabaseDuplicateMatches([]);

    setStep("upload");
  };

  /*
   * ============================================================
   * CSV -> PREVIEW
   * ============================================================
   */

  const handlePreview = () => {
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    setStep("preview");
  };

  /*
   * ============================================================
   * MAPPING CONFIRMED
   * ============================================================
   */

  const handleConfirmMapping = (
    mappedTransactions: ImportedTransaction[]
  ) => {
    console.log(
      "Mapped transactions:",
      mappedTransactions
    );

    setTransactions(
      mappedTransactions
    );

    setStep("validation");
  };

  /*
   * ============================================================
   * VALIDATION -> DUPLICATE DETECTION
   * ============================================================
   */

  const handleValidationContinue = (
    validTransactions: ValidatedTransaction[]
  ) => {
    console.log(
      "Validated transactions:",
      validTransactions
    );

    const transactionsWithDuplicates =
      markDuplicateTransactions(
        validTransactions
      );

    console.log(
      "Transactions after duplicate detection:",
      transactionsWithDuplicates
    );

    setValidatedTransactions(
      transactionsWithDuplicates
    );

    setStep("duplicate");
  };

  /*
   * ============================================================
   * FINAL IMPORT
   *
   * IMPORTANT:
   *
   * selectedAccountId is ONE account for the
   * ENTIRE imported file.
   *
   * The transaction.account value from the CSV
   * is NOT used to determine the database account.
   * ============================================================
   */

  /*
   * ============================================================
   * ACCOUNT SELECTION -> DATABASE DUPLICATE CHECK
   * ============================================================
   *
   * This runs after file-level duplicate detection and after
   * the user selects one account for the whole import.
   */


  /*
   * ============================================================
   * TRANSACTION DATA / BANK STATEMENT CONTINUE
   * ============================================================
   *
   * The account is already selected on the first screen.
   * The CSV account column, if present, is informational only.
   */

  const handleTransactionDataContinue = async (
    selectedFile: File
  ) => {
    if (!selectedAccountId) {
      alert(
        "Please select an account before continuing."
      );
      return;
    }

    try {
      setIsImporting(true);

      const csvText =
        await selectedFile.text();

      const parsedTransactions =
        parseTransactionDataCSV(csvText);

      const selectedAccount =
        accounts.find(
          (account) =>
            account.id === selectedAccountId
        );

      if (!selectedAccount) {
        throw new Error(
          "The selected account could not be found. Please select the account again."
        );
      }

      /*
       * Transaction Data mode does not go through the normal
       * CSV mapping/validation screens. We create the same
       * ValidatedTransaction structure directly.
       *
       * If the CSV already contains a category, preserve it.
       * Otherwise use the existing rule-based categorizer.
       */
      const transactionsForDatabaseCheck:
        ValidatedTransaction[] =
        await Promise.all(
          parsedTransactions.map(
            async (transaction, index) => {
              let category =
                transaction.category?.trim();

              if (!category) {
                const suggestedCategory =
                  await Promise.resolve(
                    suggestCategoryByRules(
                      transaction.title,
                      transaction.type
                    )
                  );

                if (suggestedCategory) {
                  category =
                    String(suggestedCategory).trim();
                }
              }

              return {
                row: index + 1,
                data: {
                  ...transaction,
                  account:
                    selectedAccount.name,
                  category,
                },
                errors: [],
                isValid: true,
                excluded: false,
              };
            }
          )
        );

      const missingCategories =
        transactionsForDatabaseCheck.filter(
          (transaction) =>
            !transaction.data.category?.trim()
        );

      if (missingCategories.length > 0) {
        throw new Error(
          `Could not automatically determine a category for row ${missingCategories[0].row} ("${missingCategories[0].data.title}"). Please add a Category column to the transaction CSV or use the normal CSV import flow.`
        );
      }

      setTransactionsForImport(
        transactionsForDatabaseCheck
      );

      await handleAccountMappingContinue(
        selectedAccountId,
        transactionsForDatabaseCheck
      );
    } catch (error: any) {
      console.error(
        "Transaction data processing failed:",
        error
      );

      alert(
        error?.message ||
          "Failed to read transaction data."
      );
    } finally {
      setIsImporting(false);
    }
  };

  const handleAccountMappingContinue = async (
    accountId: string,
    transactionsToCheck: ValidatedTransaction[]
  ) => {
    if (!accountId) {
      alert("Please select an account before continuing.");
      return;
    }

    if (transactionsToCheck.length === 0) {
      alert("There are no transactions to check.");
      return;
    }

    try {
      setIsImporting(true);
      setSelectedAccountId(accountId);

      console.log(
        "Transactions being checked against database:",
        transactionsToCheck
      );

      const response = await api.post(
        "/api/transactions/check-existing",
        {
          transactions: transactionsToCheck.map(
            (validatedTransaction) => ({
              row: validatedTransaction.row,
              accountId,
              date: validatedTransaction.data.date,
              title: validatedTransaction.data.title,
              amount: validatedTransaction.data.amount,
              type:
                validatedTransaction.data.type.toUpperCase() ===
                "INCOME"
                  ? "INCOME"
                  : "EXPENSE",
            })
          ),
        }
      );

      const matches: DatabaseDuplicateMatch[] =
        response.data?.existingTransactions ?? [];

      const actualDuplicates = matches.filter(
        (match) => match.exists
      );

      console.log(
        "Database duplicate check result:",
        matches
      );

      console.log(
        "Actual database duplicates:",
        actualDuplicates
      );

      setDatabaseDuplicateMatches(actualDuplicates);

      if (actualDuplicates.length > 0) {
        setStep("database-duplicate-check");
        return;
      }

      // No database duplicates.
      // Import the exact transaction array that was checked.
      await handleImportTransactions(
        transactionsToCheck,
        duplicateDecisions,
        accountId
      );

    } catch (error: any) {
      console.error(
        "Database duplicate check failed:",
        error
      );

      const backendMessage =
        error?.response?.data?.error;

      alert(
        backendMessage ||
          error?.message ||
          "Failed to check existing transactions."
      );
    } finally {
      setIsImporting(false);
    }
  };

  /*
   * ============================================================
   * FINAL IMPORT
   * ============================================================
   */

  const handleImportTransactions = async (
    uniqueTransactions: ValidatedTransaction[],
    decisions: DuplicateDecision[],
    selectedAccountId: string
  ) => {
    if (!selectedAccountId) {
      alert(
        "Please select an account before importing."
      );

      return;
    }

    if (uniqueTransactions.length === 0) {
      alert(
        "There are no transactions to import."
      );

      return;
    }

    try {
      setIsImporting(true);

      console.log(
        "Transactions selected for import:",
        uniqueTransactions
      );

      console.log(
        "Duplicate decisions:",
        decisions
      );

      console.log(
        "Selected account ID:",
        selectedAccountId
      );

      /*
       * ========================================================
       * 1. FETCH CATEGORIES
       * ========================================================
       */

      const categoriesResponse =
        await api.get(
          "/api/transactions/categories"
        );

      /*
       * ========================================================
       * 2. FETCH SUBCATEGORIES
       * ========================================================
       */

      const subcategoriesResponse =
        await api.get(
          "/api/transactions/subcategories"
        );

      const categories =
        categoriesResponse.data;

      const subcategories =
        subcategoriesResponse.data;

      console.log(
        "Categories:",
        categories
      );

      console.log(
        "Subcategories:",
        subcategories
      );

      /*
       * ========================================================
       * 3. CONVERT FRONTEND TRANSACTIONS
       *    INTO BACKEND TRANSACTION FORMAT
       * ========================================================
       */

      const transactionsToImport =
        uniqueTransactions.map(
          (validatedTransaction) => {
            const transaction =
              validatedTransaction.data;

            /*
             * IMPORTANT:
             *
             * DO NOT search for an account
             * using transaction.account.
             *
             * The user already selected ONE
             * account for the entire import.
             */

            const accountId =
              selectedAccountId;

            /*
             * ==================================================
             * FIND CATEGORY
             * ==================================================
             */

            const category =
              transaction.category
                ? categories.find(
                    (cat: any) =>
                      String(cat?.name ?? "")
                        .toLowerCase()
                        .trim() ===
                      String(transaction.category ?? "")
                        .toLowerCase()
                        .trim()
                  )
                : null;

            if (!category) {
              throw new Error(
                `Category "${transaction.category}" was not found.`
              );
            }

            /*
             * ==================================================
             * FIND SUBCATEGORY
             *
             * Current frontend import model does not
             * contain a subcategory field.
             *
             * Therefore use the first subcategory
             * belonging to the selected category.
             * ==================================================
             */

            const categorySubcategories =
              subcategories.filter(
                (sub: any) =>
                  String(sub?.categoryId) ===
                  String(category.id)
              );

            if (
              categorySubcategories.length ===
              0
            ) {
              throw new Error(
                `No subcategory found for category "${category.name}".`
              );
            }

            const subcategory =
              categorySubcategories[0];

            /*
             * ==================================================
             * CONVERT TRANSACTION TYPE
             * ==================================================
             */

            const backendType =
              transaction.type.toUpperCase();

            /*
             * ==================================================
             * FIND DUPLICATE DECISION
             * ==================================================
             */

            const decision =
              decisions.find(
                (item) =>
                  item.row ===
                  validatedTransaction.row
              );

            /*
             * ==================================================
             * ADD ANYWAY INFORMATION
             * ==================================================
             */

            const importedWithOverride =
              decision?.action ===
              "add-anyway";

            const overrideNote =
              importedWithOverride
                ? decision?.note ?? null
                : null;

            /*
             * ==================================================
             * FINAL BACKEND OBJECT
             * ==================================================
             *
             * accountId is ALWAYS the selected account.
             * ==================================================
             */

            return {
              accountId,

              categoryId:
                category.id,

              subcategoryId:
                subcategory.id,

              amount:
                transaction.amount,

              type:
                backendType,

              date:
                transaction.date,

              title:
                transaction.title,

              importedWithOverride,

              overrideNote,
            };
          }
        );

      console.log(
        "Final transactions sent to backend:",
        transactionsToImport
      );

      /*
       * ========================================================
       * 4. SEND TRANSACTIONS TO BACKEND
       * ========================================================
       *
       * Each POST creates one transaction.
       *
       * Since every object contains the same
       * selected accountId, every transaction
       * is inserted into the selected account.
       *
       * The backend transaction route also updates
       * the account balance.
       * ========================================================
       */

      const createdTransactions: any[] = [];

      for (
        const transaction
        of transactionsToImport
      ) {
        const response =
          await api.post(
            "/api/transactions",
            transaction
          );

        createdTransactions.push(
          response.data
        );
      }

      /*
       * ========================================================
       * 5. SUCCESS
       * ========================================================
       */

      console.log(
        "Imported transactions:",
        createdTransactions
      );

      alert(
        `${createdTransactions.length} transactions imported successfully.`
      );

      /*
       * ========================================================
       * 6. RESET IMPORT FLOW
       * ========================================================
       */

      setFile(null);

      setTransactions([]);

      setValidatedTransactions([]);

      setTransactionsForImport([]);

      setDuplicateDecisions([]);
      setSelectedAccountId("");
      setDatabaseDuplicateMatches([]);

      setStep("upload");
    } catch (error: any) {
      console.error(
        "Transaction import failed:",
        error
      );

      /*
       * Axios errors normally contain the backend
       * response under error.response.data.
       */

      const backendMessage =
        error?.response?.data?.error;

      alert(
        backendMessage ||
          error?.message ||
          "Failed to import transactions."
      );
    } finally {
      setIsImporting(false);
    }
  };

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <main className="page-container">
      <h1 className="page-title">
        Import
      </h1>

      {/* ======================================================
          STEP 1: FILE UPLOAD
          ====================================================== */}

      {step === "upload" && (
        <FileUpload
          mode={importMode}
          onModeChange={setImportMode}
          onFileSelected={
            handleFileSelected
          }
          onPreview={handlePreview}
          onTransactionContinue={
            handleTransactionDataContinue
          }

          accounts={accounts}
          selectedAccountId={selectedAccountId}
          onAccountChange={handleAccountChange}
          accountsLoading={accountsLoading}
        />
      )}

      {/* ======================================================
          STEP 2: CSV PREVIEW + MAPPING
          ====================================================== */}

      {step === "preview" &&
        file &&
        importMode === "csv" && (
          <FilePreview
            file={file}
            onBack={() =>
              setStep("upload")
            }
            onConfirmMapping={
              handleConfirmMapping
            }
          />
        )}

      {/* ======================================================
          STEP 3: VALIDATION + CATEGORIZATION
          ====================================================== */}

      {step === "validation" && (
        <ImportValidation
          transactions={
            transactions
          }

          onBack={() =>
            setStep("preview")
          }

          onContinue={
            handleValidationContinue
          }

          onCategorize={async (
            transaction
          ) => {
            return suggestCategoryByRules(
              transaction.title,
              transaction.type
            );
          }}
        />
      )}

      {/* ======================================================
          STEP 4: DUPLICATE DETECTION
          ====================================================== */}

      {step === "duplicate" && (
        <DuplicateDetection
          transactions={
            validatedTransactions
          }

          onBack={() =>
            setStep("validation")
          }

          onContinue={(
            uniqueTransactions,
            decisions
          ) => {
            console.log(
              "Unique transactions:",
              uniqueTransactions
            );

            console.log(
              "Duplicate decisions:",
              decisions
            );

            setDuplicateDecisions(
              decisions
            );

            setTransactionsForImport(
              uniqueTransactions
            );

            /*
            * IMPORTANT:
            *
            * Do NOT read transactionsForImport here.
            * React state updates asynchronously.
            *
            * Pass uniqueTransactions directly to the
            * database duplicate check.
            */
            void handleAccountMappingContinue(
              selectedAccountId,
              uniqueTransactions
            );
          }}
        />
      )}

      {/* ======================================================
          STEP 5: DATABASE DUPLICATE CHECK
          ====================================================== */}

      {step === "database-duplicate-check" && (
        <section
          style={{
            width: "100%",
            maxWidth: "1100px",
            margin: "0 auto",
            boxSizing: "border-box",
          }}
        >
          {/* Main card - follows the same visual language as the
              existing Duplicate Detection section. */}
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #dedede",
              borderRadius: "16px",
              padding: "2rem",
              boxSizing: "border-box",
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

            {/* Duplicate summary - red warning style matching
                the duplicate detection page. */}
            <div
              style={{
                marginBottom: "1.5rem",
                padding: "1rem 1.25rem",
                borderRadius: "12px",
                border: "1px solid #f3b5b5",
                backgroundColor: "#fff6f6",
                color: "#c5221f",
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  fontSize: "1rem",
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
                {databaseDuplicateMatches.length === 1 ? "" : "s"}{" "}
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
                You can continue and import them again, or remove
                these duplicate rows from the current import batch.
              </div>
            </div>

            {/* Matching transactions */}
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

                const importedDate = imported?.date
                  ? String(imported.date).split("T")[0]
                  : "-";

                const existingDate = existing?.date
                  ? String(existing.date).split("T")[0]
                  : "-";

                return (
                  <div
                    key={`${match.row}-${existing?.id ?? "existing"}`}
                    style={{
                      border: "1px solid #f1b8b8",
                      borderRadius: "14px",
                      padding: "1.25rem",
                      backgroundColor: "#fff9f9",
                      boxSizing: "border-box",
                    }}
                  >
                    {/* Row header */}
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
                      <strong
                        style={{
                          fontSize: "1.05rem",
                          color: "#111827",
                        }}
                      >
                        Row {match.row}
                      </strong>

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

                    {/* Imported vs database records */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(2, minmax(0, 1fr))",
                        gap: "1rem",
                      }}
                    >
                      {/* Imported file */}
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
                            {importedDate}
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

                      {/* Existing database record */}
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
                            {existingDate}
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

            {/* Bottom actions */}
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
                onClick={() =>
                  setStep("upload")
                }
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

              {/* Import actions */}
              <div
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  flexWrap: "wrap",
                  justifyContent: "flex-end",
                }}
              >
                {/* Continue and keep database duplicates */}
                <button
                  type="button"
                  disabled={
                    !selectedAccountId ||
                    isImporting
                  }
                  onClick={() =>
                    handleImportTransactions(
                      transactionsForImport,
                      duplicateDecisions,
                      selectedAccountId
                    )
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
                    : "Continue to Import"}
                </button>

                {/* Remove database duplicates from the
                    current import batch and continue.

                    IMPORTANT:
                    This does NOT delete records from the
                    database. It only removes matching rows
                    from the current imported file. */}
                <button
                  type="button"
                  disabled={
                    !selectedAccountId ||
                    isImporting
                  }
                  onClick={async () => {
                    const databaseDuplicateRows =
                      new Set(
                        databaseDuplicateMatches.map(
                          (match) => match.row
                        )
                      );

                    const transactionsWithoutDatabaseDuplicates =
                      transactionsForImport.filter(
                        (transaction) =>
                          !databaseDuplicateRows.has(
                            transaction.row
                          )
                      );

                    const remainingDuplicateDecisions =
                      duplicateDecisions.filter(
                        (decision) =>
                          !databaseDuplicateRows.has(
                            decision.row
                          )
                      );

                    if (
                      transactionsWithoutDatabaseDuplicates.length ===
                      0
                    ) {
                      alert(
                        "All remaining transactions already exist in the selected account. Nothing new needs to be imported."
                      );
                      return;
                    }

                    const removedCount =
                      transactionsForImport.length -
                      transactionsWithoutDatabaseDuplicates.length;

                    console.log(
                      "Database duplicate rows removed from current import:",
                      [...databaseDuplicateRows]
                    );

                    console.log(
                      "Transactions remaining after database duplicate removal:",
                      transactionsWithoutDatabaseDuplicates
                    );

                    setTransactionsForImport(
                      transactionsWithoutDatabaseDuplicates
                    );

                    setDuplicateDecisions(
                      remainingDuplicateDecisions
                    );

                    setDatabaseDuplicateMatches(
                      []
                    );

                    alert(
                      `${removedCount} database duplicate${
                        removedCount === 1
                          ? ""
                          : "s"
                      } removed from the import. ${
                        transactionsWithoutDatabaseDuplicates.length
                      } transaction${
                        transactionsWithoutDatabaseDuplicates.length ===
                        1
                          ? ""
                          : "s"
                      } will now be imported.`
                    );

                    await handleImportTransactions(
                      transactionsWithoutDatabaseDuplicates,
                      remainingDuplicateDecisions,
                      selectedAccountId
                    );
                  }}
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
                    : `Delete ${
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
      )}

      {/* ======================================================
          IMPORTING INDICATOR
          ====================================================== */}

      {isImporting && (
        <div
          style={{
            marginTop: "1rem",
            textAlign: "center",
            fontWeight: 600,
            color: "var(--color-text-dark)",
          }}
        >
          Importing transactions...
        </div>
      )}
    </main>
  );
}

export default Import;