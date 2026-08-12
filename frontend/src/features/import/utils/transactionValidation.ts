import type {
  ImportedTransaction,
  ValidatedTransaction,
  ValidationError,
} from "../types/import";

function isValidDate(date: string): boolean {
  if (!date || !date.trim()) {
    return false;
  }

  const parsedDate = new Date(date);

  return !Number.isNaN(parsedDate.getTime());
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
      message: "Invalid date.",
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