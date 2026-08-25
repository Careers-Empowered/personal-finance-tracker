import { useEffect, useState } from "react";

import FileUpload from "./components/FileUpload";
import FilePreview from "./components/FilePreview";
import ImportValidation from "./components/ImportValidation";
import DuplicateDetection from "./components/DuplicateDetection";
import CsvDatabaseDuplicateCheck from "./components/CsvDatabaseDuplicateCheck";
import BankStatementDatabaseDuplicateCheck from "./components/BankStatementDatabaseDuplicateCheck";

import { markDuplicateTransactions } from "./utils/duplicateDetection";

import type {
  ImportMode,
  ImportedTransaction,
  ValidatedTransaction,
  DuplicateDecision,
} from "./types/import";

import { suggestCategoryByRules } from "./categorization/ruleCategorizationService";
import { suggestCategory } from "./categorization/categorySuggestionService";

import api from "../../shared/utils/api";

import { parseBankStatement } from "./utils/bankStatementParser";


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
   * Bank Statement / Transaction Data has its own parser.
   * It does NOT use the normal CSV mapping or the old
   * transactionDataParser.
   *
   * The account selected on the first screen is always used
   * for every transaction in this file.
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

      const csvText = await selectedFile.text();

      // Dedicated parser for Transaction Data / Bank Statement.
      const parsedTransactions =
        parseBankStatement(csvText);

      if (parsedTransactions.length === 0) {
        throw new Error(
          "There are no transactions in the selected bank statement."
        );
      }

      const selectedAccount = accounts.find(
        (account) =>
          account.id === selectedAccountId
      );

      if (!selectedAccount) {
        throw new Error(
          "The selected account could not be found. Please select the account again."
        );
      }

      /*
       * Transaction Data / Bank Statement bypasses the
       * normal CSV mapping and validation screens.
       *
       * Category handling is still performed here because
       * category selection belongs to the import workflow,
       * not to the bank-statement parser.
       */
      const transactionsForDatabaseCheck:
        ValidatedTransaction[] =
        await Promise.all(
          parsedTransactions.map(
            async (transaction, index) => {
              let category =
                transaction.category?.trim();

              if (!category) {
                try {
                  const suggestedCategory =
                    await suggestCategory(
                      transaction.title,
                      transaction.type
                    );

                  if (suggestedCategory) {
                    category =
                      String(suggestedCategory).trim();
                  }
                } catch (error) {
                  console.warn(
                    "SLM category suggestion failed for bank statement row. Falling back to rules.",
                    error
                  );
                }
              }

              if (!category) {
                const suggestedCategory =
                  suggestCategoryByRules(
                    transaction.title,
                    transaction.type
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
                  account: selectedAccount.name,
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
          `Could not automatically determine a category for row ${missingCategories[0].row} ("${missingCategories[0].data.title}"). Please update the bank statement category mapping or use the normal CSV import flow.`
        );
      }

      setTransactionsForImport(
        transactionsForDatabaseCheck
      );

      // Immediately perform the database duplicate check
      // using the exact array that was just parsed.
      await handleAccountMappingContinue(
        selectedAccountId,
        transactionsForDatabaseCheck
      );
    } catch (error: any) {
      console.error(
        "Bank statement processing failed:",
        error
      );

      alert(
        error?.message ||
          "Failed to read bank statement."
      );
    } finally {
      setIsImporting(false);
    }
  };

  const handleAccountMappingContinue = async (
    accountId: string,
    transactionsToCheck: ValidatedTransaction[],
    decisions: DuplicateDecision[] = duplicateDecisions
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
        decisions,
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
            /*
            * Use the teammate's category suggestion
            * service first.
            *
            * If it cannot provide a category,
            * fall back to the existing rule-based
            * categorization.
            */
            try {
              const suggestedCategory =
                await suggestCategory(
                  transaction.title,
                  transaction.type
                );

              if (suggestedCategory) {
                return suggestedCategory;
              }
            } catch (error) {
              console.warn(
                "SLM category suggestion failed. Falling back to rules.",
                error
              );
            }

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
          * Pass the current decisions directly.
          * Do not wait for React state to update.
          */
          void handleAccountMappingContinue(
            selectedAccountId,
            uniqueTransactions,
            decisions
          );
        }}
        />
      )}

      {/* ======================================================
          STEP 5: DATABASE DUPLICATE CHECK
          ====================================================== */}

      {step === "database-duplicate-check" && (
        importMode === "csv" ? (
          <CsvDatabaseDuplicateCheck
            databaseDuplicateMatches={databaseDuplicateMatches}
            transactionsForImport={transactionsForImport}
            selectedAccountId={selectedAccountId}
            isImporting={isImporting}
            onBack={() => setStep("upload")}
            onExcludeDuplicates={async () => {
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

              setDatabaseDuplicateMatches([]);

              alert(
                `${removedCount} database duplicate${
                  removedCount === 1 ? "" : "s"
                } removed from the import. ${
                  transactionsWithoutDatabaseDuplicates.length
                } transaction${
                  transactionsWithoutDatabaseDuplicates.length === 1
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
            onContinueWithSelectedDuplicates={async (
              selectedDuplicateRows
            ) => {
              const selectedRows = new Set(
                selectedDuplicateRows
              );

              /*
              * Keep:
              *
              * 1. Every transaction that is NOT a database duplicate.
              * 2. Only the database duplicates explicitly selected
              *    by the user.
              */
              const transactionsToImport =
                transactionsForImport.filter(
                  (transaction) => {
                    const isDatabaseDuplicate =
                      databaseDuplicateMatches.some(
                        (match) =>
                          match.row ===
                          transaction.row
                      );

                    if (!isDatabaseDuplicate) {
                      return true;
                    }

                    return selectedRows.has(
                      transaction.row
                    );
                  }
                );

              /*
              * Keep duplicate decisions only for
              * transactions that are actually being imported.
              */
              const decisionsToImport =
                duplicateDecisions.filter(
                  (decision) =>
                    transactionsToImport.some(
                      (transaction) =>
                        transaction.row ===
                        decision.row
                    )
                );

              console.log(
                "Selected database duplicate rows:",
                selectedDuplicateRows
              );

              console.log(
                "Transactions being imported:",
                transactionsToImport
              );

              await handleImportTransactions(
                transactionsToImport,
                decisionsToImport,
                selectedAccountId
              );
            }}
          />
          
        ) : (
          <BankStatementDatabaseDuplicateCheck
            databaseDuplicateMatches={databaseDuplicateMatches}
            transactionsForImport={transactionsForImport}
            selectedAccountId={selectedAccountId}
            isImporting={isImporting}
            onBack={() => setStep("upload")}
            onExcludeDuplicates={async () => {
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

              setDatabaseDuplicateMatches([]);

              alert(
                `${removedCount} database duplicate${
                  removedCount === 1 ? "" : "s"
                } removed from the import. ${
                  transactionsWithoutDatabaseDuplicates.length
                } transaction${
                  transactionsWithoutDatabaseDuplicates.length === 1
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
          />
        )
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