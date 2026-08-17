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
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
  const [editRowValues, setEditRowValues] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(50);

  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  const handleToggleSelectAll = () => {
    if (selectedRows.size === rows.length && rows.length > 0) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(rows.map((_, i) => i)));
    }
  };

  const handleToggleSelectRow = (index: number) => {
    const next = new Set(selectedRows);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setSelectedRows(next);
  };

  const handleDeleteSelected = () => {
    setRows(prev => prev.filter((_, i) => !selectedRows.has(i)));
    setSelectedRows(new Set());
    setEditingRowIndex(null);
    // Reset to page 1 if current page becomes empty
    setCurrentPage(1);
  };

  const handleDeleteRow = (index: number) => {
    setRows(prev => prev.filter((_, i) => i !== index));
    if (selectedRows.has(index)) {
      const next = new Set(selectedRows);
      next.delete(index);
      setSelectedRows(next);
    }
    if (editingRowIndex === index) {
      setEditingRowIndex(null);
    }
  };

  const handleStartEdit = (rowIndex: number, row: string[]) => {
    setEditingRowIndex(rowIndex);
    setEditRowValues([...row]);
  };

  const handleSaveEdit = (rowIndex: number) => {
    setRows(prev => {
      const newRows = [...prev];
      newRows[rowIndex] = [...editRowValues];
      return newRows;
    });
    setEditingRowIndex(null);
  };

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

      const SMART_ALIASES: Record<string, string[]> = {
        "date": ["date", "txn date", "transaction date", "time", "timestamp", "value date"],
        "description": ["description", "desc", "memo", "title", "name", "payee", "merchant", "narration", "particulars", "remarks", "details"],
        "amount": ["amount", "value", "total", "price"],
        "debit/credit": ["debit/credit", "type", "transaction type", "dr/cr"],
        "account": ["account", "account number", "acct", "card"],
        "category": ["category", "cat", "group", "classification"],
      };

      const initialMapping: Record<string, string> = {};

      REQUIRED_FIELDS.forEach((field) => {
        const aliases = SMART_ALIASES[field] || [field];
        const match = parsedHeaders.find(
          (header) => aliases.includes(header.trim().toLowerCase())
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

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "var(--color-text-muted)", margin: 0 }}>
          {rows.length} rows loaded.
        </p>
        {selectedRows.size > 0 && (
          <button
            onClick={handleDeleteSelected}
            style={{ ...secondaryButtonStyle, padding: "0.4rem 0.8rem", color: "#d93025", border: "1px solid #d93025", backgroundColor: "#fff5f4" }}
          >
            Delete {selectedRows.size} Selected
          </button>
        )}
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
              <th style={{ padding: "0.75rem", borderBottom: "1px solid var(--color-divider)", backgroundColor: "var(--color-background)", width: "40px" }}>
                <input 
                  type="checkbox" 
                  checked={rows.length > 0 && selectedRows.size === rows.length} 
                  onChange={handleToggleSelectAll} 
                />
              </th>
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
              <th
                style={{
                  padding: "0.75rem",
                  textAlign: "left",
                  backgroundColor: "var(--color-background)",
                  borderBottom: "1px solid var(--color-divider)",
                  color: "var(--color-text-dark)",
                  fontWeight: 600,
                }}
              >
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {(() => {
              const actualPageSize = pageSize === -1 ? Math.max(1, rows.length) : pageSize;
              const paginatedRows = rows.slice((currentPage - 1) * actualPageSize, currentPage * actualPageSize);

              return paginatedRows.map((row, localIndex) => {
                const globalIndex = (currentPage - 1) * actualPageSize + localIndex;
                const isEditing = editingRowIndex === globalIndex;
                const isSelected = selectedRows.has(globalIndex);
                
                return (
                  <tr key={globalIndex} style={{ backgroundColor: isSelected ? "#f8f9fa" : "transparent" }}>
                    <td style={{ padding: "0.75rem", borderBottom: "1px solid var(--color-divider)" }}>
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={() => handleToggleSelectRow(globalIndex)}
                      />
                    </td>
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
                        {isEditing ? (
                          <input
                            type="text"
                            value={editRowValues[columnIndex] ?? ""}
                            onChange={(e) => {
                              const newVals = [...editRowValues];
                              newVals[columnIndex] = e.target.value;
                              setEditRowValues(newVals);
                            }}
                            style={{ width: "100%", padding: "4px" }}
                          />
                        ) : (
                          row[columnIndex] ?? ""
                        )}
                      </td>
                    ))}
                    <td
                      style={{
                        padding: "0.75rem",
                        borderBottom: "1px solid var(--color-divider)",
                      }}
                    >
                      {isEditing ? (
                        <button
                          onClick={() => handleSaveEdit(globalIndex)}
                          style={{ cursor: "pointer", background: "none", border: "1px solid var(--color-primary)", color: "var(--color-primary)", padding: "4px 8px", borderRadius: "4px", fontSize: "0.8rem", fontWeight: 600 }}
                        >
                          Save
                        </button>
                      ) : (
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button
                            onClick={() => handleStartEdit(globalIndex, row)}
                            style={{ cursor: "pointer", background: "none", border: "1px solid var(--color-divider)", padding: "4px 8px", borderRadius: "4px", fontSize: "0.8rem" }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteRow(globalIndex)}
                            style={{ cursor: "pointer", background: "none", border: "1px solid #d93025", color: "#d93025", padding: "4px 8px", borderRadius: "4px", fontSize: "0.8rem" }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              });
            })()}
          </tbody>
        </table>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", padding: "0 1rem" }}>
        <button 
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          style={{ ...secondaryButtonStyle, padding: "0.5rem 1rem", opacity: currentPage === 1 ? 0.5 : 1 }}
        >
          Previous
        </button>
        
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <select 
            value={pageSize} 
            onChange={e => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            style={{ padding: "0.25rem 0.5rem", borderRadius: "4px", border: "1px solid var(--color-divider)", fontFamily: "var(--font-body)" }}
          >
            <option value={10}>10 rows</option>
            <option value={20}>20 rows</option>
            <option value={50}>50 rows</option>
            <option value={100}>100 rows</option>
            <option value={-1}>All</option>
          </select>
          <span style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "var(--color-text-muted)" }}>
            Page {currentPage} of {Math.max(1, Math.ceil(rows.length / (pageSize === -1 ? Math.max(1, rows.length) : pageSize)))}
          </span>
        </div>

        <button 
          onClick={() => setCurrentPage(p => Math.min(Math.ceil(rows.length / (pageSize === -1 ? Math.max(1, rows.length) : pageSize)), p + 1))}
          disabled={currentPage >= Math.ceil(rows.length / (pageSize === -1 ? Math.max(1, rows.length) : pageSize))}
          style={{ ...secondaryButtonStyle, padding: "0.5rem 1rem", opacity: currentPage >= Math.ceil(rows.length / (pageSize === -1 ? Math.max(1, rows.length) : pageSize)) ? 0.5 : 1 }}
        >
          Next
        </button>
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