import type {
  ImportedTransaction,
  ValidatedTransaction,
} from "../types/import";

const createTransactionKey = (
  transaction: ImportedTransaction
): string => {
  return [
    transaction.date.trim(),
    transaction.title.trim().toLowerCase(),
    transaction.amount.toFixed(2),
    transaction.type,
    transaction.account.trim().toLowerCase(),
  ].join("|");
};

export const isDuplicateError = (
  error: { field: string; message: string }
): boolean => {
  return (
    error.field === "transaction" &&
    error.message.toLowerCase().includes("duplicate")
  );
};

export const markDuplicateTransactions = (
  rows: ValidatedTransaction[]
): ValidatedTransaction[] => {
  const seenTransactions = new Map<string, number>();

  return rows.map((row) => {
    // Remove previous duplicate errors before checking again.
    const nonDuplicateErrors = row.errors.filter(
      (error) => !isDuplicateError(error)
    );

    const cleanedRow: ValidatedTransaction = {
      ...row,
      errors: nonDuplicateErrors,
      isValid: nonDuplicateErrors.length === 0,
    };

    if (cleanedRow.excluded || !cleanedRow.isValid) {
      return cleanedRow;
    }

    const key = createTransactionKey(cleanedRow.data);

    const existingRow = seenTransactions.get(key);

    if (existingRow === undefined) {
      seenTransactions.set(key, cleanedRow.row);
      return cleanedRow;
    }

    return {
      ...cleanedRow,
      isValid: false,
      errors: [
        ...cleanedRow.errors,
        {
          field: "transaction",
          message: `Duplicate transaction detected. This transaction is the same as row ${existingRow}.`,
        },
      ],
    };
  });
};