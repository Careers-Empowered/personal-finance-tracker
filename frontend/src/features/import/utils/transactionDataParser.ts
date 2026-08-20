export interface ParsedTransactionData {
  transactionCount: number;
  earliestDate: Date;
  latestDate: Date;
}

const DATE_COLUMN_NAMES = [
  "date",
  "transaction date",
  "transaction_date",
  "txn date",
  "txn_date",
  "value date",
  "value_date",
];

function normalizeColumnName(column: string): string {
  return column
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function findDateColumn(headers: string[]): string | null {
  for (const header of headers) {
    const normalizedHeader = normalizeColumnName(header);

    if (DATE_COLUMN_NAMES.includes(normalizedHeader)) {
      return header;
    }
  }

  return null;
}

function parseDate(value: string): Date | null {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  const date = new Date(trimmedValue);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

export async function parseTransactionData(
  file: File
): Promise<ParsedTransactionData> {
  const text = await file.text();

  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new Error(
      "The transaction file does not contain enough data."
    );
  }

  const headers = lines[0].split(",").map((header) => header.trim());

  const dateColumn = findDateColumn(headers);

  if (!dateColumn) {
    throw new Error(
      "Unable to identify the transaction date column."
    );
  }

  const dateColumnIndex = headers.indexOf(dateColumn);

  const dates: Date[] = [];

  for (const line of lines.slice(1)) {
    const values = line.split(",");

    const dateValue = values[dateColumnIndex];

    if (!dateValue) {
      continue;
    }

    const date = parseDate(dateValue);

    if (date) {
      dates.push(date);
    }
  }

  if (dates.length === 0) {
    throw new Error(
      "No valid transaction dates were found in the file."
    );
  }

  const earliestDate = new Date(
    Math.min(...dates.map((date) => date.getTime()))
  );

  const latestDate = new Date(
    Math.max(...dates.map((date) => date.getTime()))
  );

  return {
    transactionCount: dates.length,
    earliestDate,
    latestDate,
  };
}