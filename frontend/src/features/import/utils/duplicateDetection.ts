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

export const markDuplicateTransactions = (
  rows: ValidatedTransaction[]
): ValidatedTransaction[] => {
  const seenTransactions = new Map<string, number>();

  return rows.map((row) => {
    if (!row.isValid || row.excluded) {
      return row;
    }

    const key = createTransactionKey(row.data);

    const existingRow = seenTransactions.get(key);

    if (existingRow === undefined) {
      seenTransactions.set(key, row.row);
      return row;
    }

    return {
      ...row,
      isValid: false,
      errors: [
        ...row.errors,
        {
          field: "transaction",
          message: `Duplicate transaction detected. This transaction is the same as row ${existingRow}.`,
        },
      ],
    };
  });
};