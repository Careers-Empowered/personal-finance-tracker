import { useState } from "react";

import FileUpload from "./components/FileUpload";
import FilePreview from "./components/FilePreview";
import ImportValidation from "./components/ImportValidation";
import DuplicateDetection from "./components/DuplicateDetection";
import AccountMapping from "./components/AccountMapping";

import { markDuplicateTransactions } from "./utils/duplicateDetection";

import type {
  ImportMode,
  ImportedTransaction,
  ValidatedTransaction,
  DuplicateDecision,
} from "./types/import";

import { suggestCategoryByRules } from "./categorization/ruleCategorizationService";

import api from "../../shared/utils/api";

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
    | "account-mapping"
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
                      cat.name
                        .toLowerCase()
                        .trim() ===
                      transaction.category!
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
                  sub.categoryId ===
                  category.id
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
             * Move to ONE account selection
             * for the entire file.
             */

            setStep(
              "account-mapping"
            );
          }}
        />
      )}

      {/* ======================================================
          STEP 5: SELECT ONE ACCOUNT
          ====================================================== */}

      {step === "account-mapping" && (
        <AccountMapping
          transactions={
            transactionsForImport
          }

          onBack={() =>
            setStep("duplicate")
          }

          onContinue={(
            selectedAccountId
          ) => {
            handleImportTransactions(
              transactionsForImport,
              duplicateDecisions,
              selectedAccountId
            );
          }}
        />
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