import type {
  ImportedTransaction,
  ValidatedTransaction,
  ValidationError,
} from "../types/import";

/**
 * Transactions must use a strict ISO 8601 date format (YYYY-MM-DD).
 *
 * The previous implementation relied solely on `new Date(date)`,
 * which happily parses many non-standard/ambiguous formats
 * (e.g. "01/15/2024", "15-01-2024", "2024") as "valid" — and
 * silently rolls invalid days forward (e.g. "2024-02-30" becomes
 * March 1st) instead of failing. That meant a date "fixed" by the
 * user into an inconsistent format would pass validation anyway.
 */
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isValidDate(date: string): boolean {
  if (!date || !date.trim()) {
    return false;
  }

  const trimmed = date.trim();

  if (!ISO_DATE_PATTERN.test(trimmed)) {
    return false;
  }

  const [year, month, day] = trimmed.split("-").map(Number);

  if (month < 1 || month > 12) {
    return false;
  }

  if (day < 1 || day > 31) {
    return false;
  }

  const parsedDate = new Date(trimmed);

  if (Number.isNaN(parsedDate.getTime())) {
    return false;
  }

  /*
   * Guard against JS Date's silent rollover, e.g.
   * new Date("2024-02-30") -> March 1st instead of throwing.
   * Comparing parsed parts back against the input catches this.
   */
  return (
    parsedDate.getUTCFullYear() === year &&
    parsedDate.getUTCMonth() + 1 === month &&
    parsedDate.getUTCDate() === day
  );
}

export function validateTransaction(
  transaction: ImportedTransaction,
  row: number
): ValidatedTransaction {
  const errors: ValidationError[] = [];

  // Date
  if (!transaction.date || !transaction.date.trim()) {
    errors.push({
      field: "date",
      message: "Date is required.",
    });
  } else if (!isValidDate(transaction.date)) {
    errors.push({
      field: "date",
      message: "Invalid date. Use the format YYYY-MM-DD.",
    });
  }

  // Title / Description
  if (!transaction.title || !transaction.title.trim()) {
    errors.push({
      field: "title",
      message: "Description is required.",
    });
  }

  // Amount
  if (
    transaction.amount === undefined ||
    transaction.amount === null ||
    Number.isNaN(Number(transaction.amount))
  ) {
    errors.push({
      field: "amount",
      message: "Amount must be a valid number.",
    });
  } else if (Number(transaction.amount) <= 0) {
    errors.push({
      field: "amount",
      message: "Amount must be greater than 0.",
    });
  }

  // Type
  if (
    transaction.type !== "income" &&
    transaction.type !== "expense"
  ) {
    errors.push({
      field: "type",
      message: "Type must be income or expense.",
    });
  }

  // Account
  if (!transaction.account || !transaction.account.trim()) {
    errors.push({
      field: "account",
      message: "Account is required.",
    });
  }

  /*
   * Category is NOT NULL in the database.
   *
   * A missing category must NOT be treated as a valid transaction —
   * otherwise it can pass Import Validation and break (or corrupt
   * data) at persistence time. The UI still gives it a lighter-weight
   * "needs categorization" treatment rather than lumping it in with
   * genuinely malformed rows (see ImportValidation.tsx).
   */
  if (!transaction.category || !transaction.category.trim()) {
    errors.push({
      field: "category",
      message: "Category is required.",
    });
  }

  return {
    row,
    data: transaction,
    errors,
    isValid: errors.length === 0,
    excluded: false,
  };
}

export function validateTransactions(
  transactions: ImportedTransaction[]
): ValidatedTransaction[] {
  return transactions.map((transaction, index) =>
    validateTransaction(transaction, index + 1)
  );
}