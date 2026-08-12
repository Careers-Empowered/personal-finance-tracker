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

function FileUpload({ onFileSelected }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  const handleFileChange = (
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

      setError(
        validationResult.error ?? "Invalid file."
      );

      event.target.value = "";

      return;
    }

    setSelectedFile(file);
    onFileSelected(file);
  };

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePreview = () => {
    if (!selectedFile) {
      return;
    }

    // Preview functionality will be implemented later.
    console.log("Preview file:", selectedFile.name);
  };

  const handleContinue = () => {
    if (!selectedFile) {
      return;
    }

    // Continue functionality will be implemented later.
    console.log("Continue with file:", selectedFile.name);
  };

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

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={handleFileChange}
        hidden
      />

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
            Select a CSV file to import
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
                }}
              >
                📄
              </div>

              <div>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    color: "var(--color-text-dark)",
                    margin: 0,
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

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "0.75rem",
              marginTop: "1.5rem",
            }}
          >
            <button
              type="button"
              style={secondaryButtonStyle}
              onClick={handlePreview}
            >
              Preview
            </button>

            <button
              type="button"
              style={primaryButtonStyle}
              onClick={handleContinue}
            >
              Continue
            </button>
          </div>
        </>
      )}

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