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

        categoryId: transaction.categoryId || "",

        subcategory_id: transaction.subcategoryId || "",

        amount: transaction.amount,

        type: transaction.type,

        date: new Date(transaction.date),

        Title: transaction.title,

        importedWithOverride:
          transaction.importedWithOverride ?? false,

        overrideNote:
          transaction.overrideNote ?? null,
      },
    });

    createdTransactions.push(created);

    // Adjust account balance
    const balanceAdj = transaction.type === "INCOME" ? transaction.amount : -transaction.amount;
    await prisma.account.update({
      where: { id: transaction.accountId },
      data: {
        balance: {
          increment: balanceAdj,
        },
      },
    });
  }

  return createdTransactions;
}