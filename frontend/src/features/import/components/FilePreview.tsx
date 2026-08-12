import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import type { ImportedTransaction } from "../types/import";

interface FilePreviewProps {
  file: File;
  onBack: () => void;
  onConfirmMapping: (transactions: ImportedTransaction[]) => void;
}

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

const REQUIRED_FIELDS = [
  "date",
  "description",
  "amount",
  "debit/credit",
  "account",
  "category",
];

function parseCSVLine(line: string): string[] {
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

function FilePreview({
  file,
  onBack,
  onConfirmMapping,
}: FilePreviewProps) {
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  useEffect(() => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target?.result as string;

      if (!text) {
        setError("Unable to read the file.");
        return;
      }

      const lines = text
        .split(/\r?\n/)
        .filter((line) => line.trim() !== "");

      if (lines.length === 0) {
        setError("The file is empty.");
        return;
      }

      const parsedHeaders = parseCSVLine(lines[0]);

      const parsedRows = lines
        .slice(1)
        .map((line) => parseCSVLine(line));

      setHeaders(parsedHeaders);
      setRows(parsedRows);

      const initialMapping: Record<string, string> = {};

      REQUIRED_FIELDS.forEach((field) => {
        const match = parsedHeaders.find(
          (header) =>
            header.trim().toLowerCase() ===
            field.trim().toLowerCase()
        );

        if (match) {
          initialMapping[field] = match;
        }
      });

      setMapping(initialMapping);
    };

    reader.onerror = () => {
      setError("Unable to read the selected file.");
    };

    reader.readAsText(file);
  }, [file]);

  const handleMappingChange = (
    field: string,
    header: string
  ) => {
    setMapping((previous) => ({
      ...previous,
      [field]: header,
    }));
  };

  const getCellValue = (
    row: string[],
    field: string
  ): string => {
    const selectedHeader = mapping[field];

    if (!selectedHeader) {
      return "";
    }

    const columnIndex = headers.indexOf(selectedHeader);

    if (columnIndex === -1) {
      return "";
    }

    return row[columnIndex] ?? "";
  };

  const convertToTransactions = (): ImportedTransaction[] => {
    return rows.map((row) => {
      const rawDate = getCellValue(row, "date");
      const rawDescription = getCellValue(
        row,
        "description"
      );
      const rawAmount = getCellValue(row, "amount");
      const rawType = getCellValue(
        row,
        "debit/credit"
      );
      const rawAccount = getCellValue(row, "account");
      const rawCategory = getCellValue(
        row,
        "category"
      );

      const amountString = rawAmount
        .replace(/,/g, "")
        .replace(/[₹$€£]/g, "")
        .trim();

      const parsedAmount = Number(amountString);

      const normalizedType =
        rawType.trim().toLowerCase() === "credit"
          ? "income"
          : "expense";

      return {
        date: rawDate,
        title: rawDescription,
        amount: Math.abs(parsedAmount),
        type: normalizedType,
        account: rawAccount,
        category: rawCategory,
      };
    });
  };

  const handleConfirmMapping = () => {
    const missingFields = REQUIRED_FIELDS.filter(
      (field) => !mapping[field]
    );

    if (missingFields.length > 0) {
      setError(
        `Please map all required fields: ${missingFields.join(
          ", "
        )}`
      );
      return;
    }

    setError("");

    const transactions = convertToTransactions();

    onConfirmMapping(transactions);
  };

  return (
    <section
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid var(--color-divider)",
        borderRadius: "16px",
        padding: "2rem",
        maxWidth: "1000px",
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
          Map the columns from your CSV to the
          transaction fields.
        </p>
      </div>

      {error && (
        <div
          style={{
            marginBottom: "1.5rem",
            padding: "0.75rem 1rem",
            borderRadius: "8px",
            backgroundColor: "#fff5f4",
            border: "1px solid #e5c5c2",
            color: "#b42318",
            fontSize: "0.9rem",
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(2, minmax(0, 1fr))",
          gap: "1.25rem",
          marginBottom: "2rem",
        }}
      >
        {REQUIRED_FIELDS.map((field) => (
          <div
            key={field}
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
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
              onChange={(event) =>
                handleMappingChange(
                  field,
                  event.target.value
                )
              }
              style={{
                padding: "0.75rem",
                borderRadius: "8px",
                border:
                  "1px solid var(--color-divider)",
                fontFamily: "var(--font-body)",
                fontSize: "0.95rem",
                backgroundColor: "#ffffff",
              }}
            >
              <option value="">
                Select column...
              </option>

              {headers.map((header, index) => (
                <option
                  key={`${header}-${index}`}
                  value={header}
                >
                  {header}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <div
        style={{
          overflowX: "auto",
          marginBottom: "2rem",
        }}
      >
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
              {headers.map((header, index) => (
                <th
                  key={index}
                  style={{
                    padding: "0.75rem",
                    textAlign: "left",
                    backgroundColor:
                      "var(--color-background)",
                    borderBottom:
                      "1px solid var(--color-divider)",
                    color:
                      "var(--color-text-dark)",
                    fontWeight: 600,
                  }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {headers.map((_, columnIndex) => (
                  <td
                    key={columnIndex}
                    style={{
                      padding: "0.75rem",
                      borderBottom:
                        "1px solid var(--color-divider)",
                      color:
                        "var(--color-text-muted)",
                    }}
                  >
                    {row[columnIndex] ?? ""}
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
        <button
          type="button"
          style={secondaryButtonStyle}
          onClick={onBack}
        >
          Back
        </button>

        <button
          type="button"
          style={primaryButtonStyle}
          onClick={handleConfirmMapping}
        >
          Confirm Mapping
        </button>
      </div>
    </section>
  );
}

export default FilePreview;