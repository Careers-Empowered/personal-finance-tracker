import { useState, useEffect } from "react";
import type { CSSProperties } from "react";

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

interface FilePreviewProps {
  file: File;
  onBack: () => void;
}

const REQUIRED_FIELDS = [
  "date",
  "description",
  "amount",
  "debit/credit",
  "account",
  "category",
];

function FilePreview({ file, onBack }: FilePreviewProps) {
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});

  useEffect(() => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        const lines = text.split("\n").filter((l) => l.trim() !== "");
        if (lines.length > 0) {
          const parsedHeaders = lines[0].split(",").map((h) => h.trim());
          const parsedRows = lines.slice(1, 6).map((line) =>
            line.split(",").map((c) => c.trim())
          );
          setHeaders(parsedHeaders);
          setRows(parsedRows);

          // Auto-map if names match
          const initialMapping: Record<string, string> = {};
          REQUIRED_FIELDS.forEach((field) => {
            const match = parsedHeaders.find(
              (h) => h.toLowerCase() === field.toLowerCase()
            );
            if (match) {
              initialMapping[field] = match;
            }
          });
          setMapping(initialMapping);
        }
      }
    };
    reader.readAsText(file);
  }, [file]);

  const handleMappingChange = (field: string, header: string) => {
    setMapping((prev) => ({
      ...prev,
      [field]: header,
    }));
  };

  return (
    <section
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid var(--color-divider)",
        borderRadius: "16px",
        padding: "2rem",
        maxWidth: "900px",
        width: "100%",
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
          File Preview & Mapping
        </h2>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.95rem",
            color: "var(--color-text-muted)",
          }}
        >
          Map the columns from your CSV to the required fields.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        {REQUIRED_FIELDS.map((field) => (
          <div key={field} style={{ display: "flex", flexDirection: "column" }}>
            <label
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.9rem",
                fontWeight: 600,
                color: "var(--color-text-dark)",
                marginBottom: "0.5rem",
                textTransform: "capitalize",
              }}
            >
              {field}
            </label>
            <select
              value={mapping[field] || ""}
              onChange={(e) => handleMappingChange(field, e.target.value)}
              style={{
                padding: "0.5rem",
                borderRadius: "8px",
                border: "1px solid var(--color-divider)",
                fontFamily: "var(--font-body)",
                fontSize: "0.95rem",
                backgroundColor: "#fff",
              }}
            >
              <option value="">Select column...</option>
              {headers.map((h, i) => (
                <option key={i} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <div style={{ overflowX: "auto", marginBottom: "2rem" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontFamily: "var(--font-body)",
            fontSize: "0.9rem",
          }}
        >
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th
                  key={i}
                  style={{
                    padding: "0.75rem",
                    textAlign: "left",
                    backgroundColor: "var(--color-background)",
                    borderBottom: "1px solid var(--color-divider)",
                    color: "var(--color-text-dark)",
                    fontWeight: 600,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td
                    key={j}
                    style={{
                      padding: "0.75rem",
                      borderBottom: "1px solid var(--color-divider)",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <button type="button" style={secondaryButtonStyle} onClick={onBack}>
          Back
        </button>
        <button
          type="button"
          style={primaryButtonStyle}
          onClick={() => console.log("Final mapping:", mapping)}
        >
          Confirm Mapping
        </button>
      </div>
    </section>
  );
}

export default FilePreview;
