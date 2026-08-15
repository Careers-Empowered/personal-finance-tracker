import { prisma } from "../../infrastructure/postgres/prismaClient";
import type { ImportTransactionInput } from "../../domain/imports/importTypes";

export async function importTransactions(
  transactions: ImportTransactionInput[]
) {
  if (!transactions.length) {
    throw new Error("No transactions provided.");
  }

  const createdTransactions = [];

  for (const transaction of transactions) {
    const created = await prisma.transaction.create({
      data: {
        accountId: transaction.accountId,

        categoryId: transaction.categoryId ?? null,

        subcategory_id: transaction.subcategoryId ?? null,

        amount: transaction.amount,

        type: transaction.type,

        date: new Date(transaction.date),

        Title: transaction.title,

        importId: transaction.importId ?? null,

        importedWithOverride:
          transaction.importedWithOverride ?? false,

        overrideNote:
          transaction.overrideNote ?? null,
      },
    });

    createdTransactions.push(created);
  }

  return createdTransactions;
}