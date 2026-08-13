// import React from 'react';

// const Import: React.FC = () => {
//   return <div className="page-container"><h1 className="page-title">Import</h1></div>;
// };

// export default Import;


import { useState } from "react";

import FileUpload from "./components/FileUpload";
import FilePreview from "./components/FilePreview";
import ImportValidation from "./components/ImportValidation";

import DuplicateDetection from "./components/DuplicateDetection";

import { markDuplicateTransactions } from "./utils/duplicateDetection";
import type {
  ImportedTransaction,
  ValidatedTransaction,
} from "./types/import";

function Import() {
  const [file, setFile] = useState<File | null>(null);

  const [transactions, setTransactions] =
    useState<ImportedTransaction[]>([]);

  const [validatedTransactions, setValidatedTransactions] =
    useState<ValidatedTransaction[]>([]);

  const [step, setStep] = useState<
    "upload" | "preview" | "validation" | "duplicate"
  >("upload");

  const handleFileSelected = (selectedFile: File) => {
    setFile(selectedFile);
    setTransactions([]);
    setStep("upload");
  };

  const handlePreview = () => {
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    setStep("preview");
  };

  const handleConfirmMapping = (
    mappedTransactions: ImportedTransaction[]
  ) => {
    console.log("Mapped transactions:", mappedTransactions);

    setTransactions(mappedTransactions);
    setStep("validation");
  };

  const handleValidationContinue = (
  validTransactions: ValidatedTransaction[]
) => {
  console.log(
    "Validated transactions:",
    validTransactions
  );

  const transactionsWithDuplicates =
    markDuplicateTransactions(validTransactions);

  console.log(
    "Transactions after duplicate detection:",
    transactionsWithDuplicates
  );

  setValidatedTransactions(transactionsWithDuplicates);
  setStep("duplicate");
};

  return (
    <main className="page-container">
      <h1 className="page-title">Import</h1>

      {/* STEP 1: FILE UPLOAD */}
      {step === "upload" && (
        <FileUpload
          onFileSelected={handleFileSelected}
          onPreview={handlePreview}
        />
      )}

      {/* STEP 2: FILE PREVIEW + MAPPING */}
      {step === "preview" && file && (
        <FilePreview
          file={file}
          onBack={() => setStep("upload")}
          onConfirmMapping={handleConfirmMapping}
        />
      )}

      {/* STEP 3: VALIDATION */}
      {step === "validation" && (
        <ImportValidation
          transactions={transactions}
          onBack={() => setStep("preview")}
          onContinue={handleValidationContinue}
        />
      )}

      {step === "duplicate" && (
        <DuplicateDetection
          transactions={validatedTransactions}
          onBack={() => setStep("validation")}
          onContinue={(uniqueTransactions) => {
            console.log(
              "Unique transactions ready for import:",
              uniqueTransactions
            );

            alert(
              `${uniqueTransactions.length} unique transactions are ready to import.`
            );
          }}
        />
      )}
    </main>
  );
}

export default Import;