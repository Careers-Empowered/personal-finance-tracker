import { prisma } from "../infrastructure/postgres/prisma";

export const dashboardRepository = {
  findAccountsByUserId(userId: string) {
    return prisma.account.findMany({
      where: {
        userId,
      },
      orderBy: [
        {
          isPrimary: "desc",
        },
        {
          name: "asc",
        },
      ],
    });
  },

  findAccountById(userId: string, accountId: string) {
    return prisma.account.findFirst({
      where: {
        id: accountId,
        userId,
      },
    });
  },

  findTransactions(
    userId: string,
    options: {
      accountId?: string;
      startDate?: Date;
      endDate?: Date;
    } = {},
  ) {
    return prisma.transaction.findMany({
      where: {
        account: {
          userId,
        },

        ...(options.accountId
          ? {
              accountId: options.accountId,
            }
          : {}),

        ...(options.startDate || options.endDate
          ? {
              date: {
                ...(options.startDate
                  ? { gte: options.startDate }
                  : {}),

                ...(options.endDate
                  ? { lt: options.endDate }
                  : {}),
              },
            }
          : {}),
      },

    include: {
    account: true,
    category: true,
    subcategory: true,
    },

      orderBy: {
        date: "desc",
      },
    });
  },

  findTransactionsForDate(
    userId: string,
    date: Date,
    accountId?: string,
  ) {
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    return prisma.transaction.findMany({
      where: {
        account: {
          userId,
        },

        ...(accountId
          ? {
              accountId,
            }
          : {}),

        date: {
          gte: date,
          lt: nextDate,
        },
      },

      include: {
        account: true,
        category: true,
          subcategory: true,
      },

      orderBy: {
        date: "desc",
      },
    });
  },
};