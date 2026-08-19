import { prisma } from "../infrastructure/postgres/prisma";

export const accountRepository = {
  findAllByUserId(userId: string) {
    return prisma.account.findMany({
      where: { userId },
      orderBy: {
        createdAt: "asc",
      },
    });
  },

  findById(id: string) {
    return prisma.account.findUnique({
      where: { id },
    });
  },

  create(data: {
    userId: string;
    name: string;
    currency: string;
    balance: number;
    isPrimary: boolean;
  }) {
    return prisma.account.create({
      data: {
        userId: data.userId,
        name: data.name,
        currency: data.currency,
        balance: data.balance,
        isPrimary: data.isPrimary,
      },
    });
  },

  update(
    id: string,
    data: {
      name?: string;
      currency?: string;
      balance?: number;
      isPrimary?: boolean;
    },
  ) {
    return prisma.account.update({
      where: { id },
      data,
    });
  },

  updateBalance(id: string, balance: number) {
    return prisma.account.update({
      where: { id },
      data: { balance },
    });
  },

  delete(id: string) {
    return prisma.account.delete({
      where: { id },
    });
  },

  clearPrimaryFlag(userId: string) {
    return prisma.account.updateMany({
      where: { userId, isPrimary: true },
      data: { isPrimary: false },
    });
  },

  async transfer(
    sourceId: string,
    destId: string,
    sourceAmount: number,
    convertedAmount: number,
  ) {
    return prisma.$transaction(async (tx) => {
      const source = await tx.account.findUnique({ where: { id: sourceId } });
      const dest = await tx.account.findUnique({ where: { id: destId } });

      if (!source || !dest) {
        throw new Error("Source or destination account not found");
      }

      const newSourceBalance = Number(source.balance) - sourceAmount;
      const newDestBalance = Number(dest.balance) + convertedAmount;

      const updatedSource = await tx.account.update({
        where: { id: sourceId },
        data: { balance: newSourceBalance },
      });

      const updatedDest = await tx.account.update({
        where: { id: destId },
        data: { balance: newDestBalance },
      });

      return { updatedSource, updatedDest };
    });
  },
};
