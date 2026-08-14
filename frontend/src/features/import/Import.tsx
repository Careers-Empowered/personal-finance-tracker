import { useState } from "react";

import FileUpload from "./components/FileUpload";
import FilePreview from "./components/FilePreview";
import ImportValidation from "./components/ImportValidation";

import type {
  ImportMode,
  ImportedTransaction,
  ValidatedTransaction,
} from "./types/import";

function Import() {
  const [importMode, setImportMode] =
    useState<ImportMode>("csv");

  const [file, setFile] =
    useState<File | null>(null);

  const [transactions, setTransactions] =
    useState<ImportedTransaction[]>([]);

  const [step, setStep] = useState<
    "upload" | "preview" | "validation"
  >("upload");

  /*
   * --------------------------------------------------
   * FILE SELECTED
   * --------------------------------------------------
   */

  const handleFileSelected = (
    selectedFile: File
  ) => {
    setFile(selectedFile);
    setTransactions([]);
    setStep("upload");
  };

  /*
   * --------------------------------------------------
   * NORMAL CSV -> PREVIEW
   * --------------------------------------------------
   */

  const handlePreview = () => {
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    /*
     * This is ONLY used by the normal CSV flow.
     */
    setStep("preview");
  };

  /*
   * --------------------------------------------------
   * TRANSACTION DATA -> CONTINUE
   * --------------------------------------------------
   */

  const handleTransactionContinue = () => {
    if (!file) {
      return;
    }

    /*
     * For now we keep the transaction-data
     * flow on the same page.
     *
     * Later this can navigate to the next
     * transaction-import step.
     */
    console.log(
      "Continue with transaction data:",
      file.name
    );
  };

  /*
   * --------------------------------------------------
   * MAPPING CONFIRMED
   * --------------------------------------------------
   */

  const handleConfirmMapping = (
    mappedTransactions: ImportedTransaction[]
  ) => {
    console.log(
      "Mapped transactions:",
      mappedTransactions
    );

    setTransactions(mappedTransactions);
    setStep("validation");
  };

  /*
   * --------------------------------------------------
   * VALIDATION CONTINUE
   * --------------------------------------------------
   */

  const handleContinue = (
    validatedTransactions: ValidatedTransaction[]
  ) => {
    console.log(
      "Validated transactions:",
      validatedTransactions
    );

    alert(
      `${validatedTransactions.length} valid transactions are ready for duplicate detection.`
    );
  };

  return (
    <main className="page-container">
      <h1 className="page-title">
        Import
      </h1>

      {/* ==========================================
          STEP 1: FILE UPLOAD
          ========================================== */}

      {step === "upload" && (
        <FileUpload
          mode={importMode}
          onModeChange={setImportMode}
          onFileSelected={handleFileSelected}
          onPreview={handlePreview}
          onTransactionContinue={
            handleTransactionContinue
          }
        />
      )}

      {/* ==========================================
          STEP 2: NORMAL CSV PREVIEW + MAPPING
          ========================================== */}

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

      {/* ==========================================
          STEP 3: VALIDATION
          ========================================== */}

      {step === "validation" && (
        <ImportValidation
          transactions={transactions}
          onBack={() =>
            setStep("preview")
          }
          onContinue={handleContinue}
        />
      )}
    </main>
  );
}

export default Import;