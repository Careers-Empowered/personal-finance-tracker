import type { ImportedTransaction } from "../types/import";

function normalizeHeader(value: string): string {
  return value
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const character = line[i];

    if (character === '"') {
      if (insideQuotes && line[i + 1] === '"') {
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

function parseDate(value: string): string | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  // DD/MM/YYYY or DD-MM-YYYY
  const match = trimmed.match(
    /^(\d{1,2})[/-](\d{1,2})[/-](\d{2}|\d{4})$/
  );

  if (match) {
    const day = Number(match[1]);
    const month = Number(match[2]);

    let year = Number(match[3]);

    if (match[3].length === 2) {
      year += year >= 50 ? 1900 : 2000;
    }

    const date = new Date(year, month - 1, day);

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

  const parsed = new Date(trimmed);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString().split("T")[0];
}

function parseAmount(value: string): number {
  const cleaned = value
    .replace(/,/g, "")
    .replace(/[₹$€£]/g, "")
    .replace(/\s/g, "")
    .trim();

  if (!cleaned) {
    return 0;
  }

  if (cleaned.startsWith("(") && cleaned.endsWith(")")) {
    const numberValue = Number(cleaned.slice(1, -1));

    return Number.isFinite(numberValue)
      ? numberValue
      : 0;
  }

  const numberValue = Number(cleaned);

  return Number.isFinite(numberValue)
    ? numberValue
    : 0;
}

/**
 * Parses Transaction Data / Bank Statement files.
 *
 * Required columns:
 *   Date
 *   Details
 *   Debit
 *   Credit
 *
 * Other columns such as:
 *   Ref No/Cheque No
 *   Balance
 *
 * are intentionally ignored.
 */
export function parseBankStatement(
  csvText: string
): ImportedTransaction[] {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new Error(
      "The bank statement does not contain any transaction data."
    );
  }

  const headers = parseCSVLine(lines[0]).map(
    normalizeHeader
  );

  const dateIndex = headers.indexOf("date");
  const detailsIndex = headers.indexOf("details");
  const debitIndex = headers.indexOf("debit");
  const creditIndex = headers.indexOf("credit");

  const missingColumns: string[] = [];

  if (dateIndex === -1) {
    missingColumns.push("Date");
  }

  if (detailsIndex === -1) {
    missingColumns.push("Details");
  }

  if (debitIndex === -1) {
    missingColumns.push("Debit");
  }

  if (creditIndex === -1) {
    missingColumns.push("Credit");
  }

  if (missingColumns.length > 0) {
    throw new Error(
      `Unsupported bank statement format. Missing required column(s): ${missingColumns.join(
        ", "
      )}. Required columns are Date, Details, Debit, Credit.`
    );
  }

  const transactions: ImportedTransaction[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);

    const rawDate = values[dateIndex] ?? "";
    const details = values[detailsIndex]?.trim() ?? "";
    const debit = parseAmount(values[debitIndex] ?? "");
    const credit = parseAmount(values[creditIndex] ?? "");

    const date = parseDate(rawDate);

    // Ignore completely empty rows.
    if (
      !rawDate &&
      !details &&
      debit === 0 &&
      credit === 0
    ) {
      continue;
    }

    if (!date) {
      throw new Error(
        `Invalid transaction date at row ${i + 1}: "${rawDate}".`
      );
    }

    if (!details) {
      throw new Error(
        `Transaction details are missing at row ${i + 1}.`
      );
    }

    if (debit > 0 && credit > 0) {
      throw new Error(
        `Both Debit and Credit contain values at row ${
          i + 1
        }. Only one should contain a value.`
      );
    }

    if (debit === 0 && credit === 0) {
      throw new Error(
        `Neither Debit nor Credit contains a value at row ${
          i + 1
        }.`
      );
    }

    const isDebit = debit > 0;
    const amount = isDebit ? debit : credit;

    transactions.push({
      date,
      title: details,
      amount,
      type: isDebit ? "expense" : "income",
      category: "Banking",
      account: "",
    });
  }

  if (transactions.length === 0) {
    throw new Error(
      "No valid transactions were found in the bank statement."
    );
  }

  return transactions;
}