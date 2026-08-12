// import React from 'react';

// const Import: React.FC = () => {
//   return <div className="page-container"><h1 className="page-title">Import</h1></div>;
// };

// export default Import;


import { useState } from "react";
import FileUpload from "./components/FileUpload";
import FilePreview from "./components/FilePreview";

function Import() {
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<"upload" | "preview">("upload");

  return (
    <main className="page-container">
      <h1 className="page-title">Import</h1>

      {step === "upload" && (
        <FileUpload
          onFileSelected={(f) => setFile(f)}
          onPreview={() => setStep("preview")}
        />
      )}

      {step === "preview" && file && (
        <FilePreview file={file} onBack={() => setStep("upload")} />
      )}
    </main>
  );
}

export default Import;