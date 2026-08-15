import { Prisma } from '@prisma/client';
import { prisma } from '../../infrastructure/postgres/prismaClient';
import {
  CreateTransactionDTO,
  UpdateTransactionDTO,
  TransactionFilterQuery,
  TransactionSummaryResponse,
} from './types';

export class TransactionsService {
  /**
   * Fetch accounts belonging to the user
   */
  async getAccounts(userId: string) {
    const accounts = await prisma.account.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        currency: true,
        balance: true,
        isPrimary: true,
      },
    });

    return accounts.map((acc: any) => ({
      ...acc,
      balance: Number(acc.balance),
    }));
  }

  /**
   * Fetch categories (system defaults + user custom)
   */
  async getCategories(userId: string) {
    return prisma.category.findMany({
      where: {
        OR: [{ userId: null }, { userId }],
      },
      select: {
        id: true,
        name: true,
        type: true,
        icon: true,
        color: true,
        is_default: true,
      },
    });
  }

  /**
   * Fetch subcategories (optionally filtered by categoryId)
   */
  async getSubcategories(userId: string, categoryId?: string) {
    if (categoryId) {
      const categoryUUID = String(categoryId);
      const category = await prisma.category.findFirst({
        where: {
          id: categoryUUID,
          OR: [{ userId: null }, { userId }],
        },
      });

      if (!category) {
        throw new Error('CATEGORY_NOT_FOUND');
      }

      const subcategories = await prisma.subcategories.findMany({
        where: { category_id: categoryUUID },
        select: {
          id: true,
          name: true,
          icon: true,
          category_id: true,
        },
      });

      return subcategories.map((sub: any) => ({
        id: sub.id,
        name: sub.name,
        icon: sub.icon,
        categoryId: sub.category_id,
      }));
    }

    const subcategories = await prisma.subcategories.findMany({
      where: {
        categories: {
          OR: [{ userId: null }, { userId }],
        },
      },
      select: {
        id: true,
        name: true,
        icon: true,
        category_id: true,
      },
    });

    return subcategories.map((sub: any) => ({
      id: sub.id,
      name: sub.name,
      icon: sub.icon,
      categoryId: sub.category_id,
    }));
  }

  /**
   * Fetch paginated & filtered transactions for user
   */
  async getTransactions(userId: string, filters: TransactionFilterQuery) {
    const {
      type,
      categoryId,
      startDate,
      endDate,
      accountId,
      page = 1,
      limit = 20,
      search,
    } = filters;

    const where: Prisma.TransactionWhereInput = {
      account: { userId },
    };

    if (type && type !== 'ALL') {
      where.type = type;
    }

    if (categoryId) {
      where.categoryId = String(categoryId);
    }

    if (accountId) {
      where.accountId = String(accountId);
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.date.lte = end;
      }
    }

    if (search) {
      where.Title = {
        contains: search,
        mode: 'insensitive',
      };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take,
        orderBy: { date: 'desc' },
        include: {
          account: {
            select: { id: true, name: true },
          },
          category: {
            select: { id: true, name: true, type: true, icon: true, color: true },
          },
          subcategory: {
            select: { id: true, name: true },
          },
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    const formattedTransactions = transactions.map((tx: any) => ({
      id: tx.id,
      accountId: tx.accountId,
      categoryId: tx.categoryId,
      subcategoryId: tx.subcategory_id,
      amount: Number(tx.amount),
      type: tx.type,
      date: tx.date ? tx.date.toISOString().split('T')[0] : '',
      title: tx.Title,
      createdAt: tx.createdAt,
      updatedAt: tx.updatedAt,
      account: tx.account,
      category: tx.category,
      subcategory: tx.subcategory,
    }));

    return {
      data: formattedTransactions,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / take),
      },
    };
  }

  /**
   * Create new transaction & adjust account balance
   */
  async createTransaction(userId: string, dto: CreateTransactionDTO) {
    const { accountId, categoryId, subcategoryId, amount, type, date, title } = dto;

    const account = await prisma.account.findFirst({
      where: { id: accountId, userId },
    });

    if (!account) {
      throw new Error('ACCOUNT_NOT_FOUND');
    }

    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        OR: [{ userId: null }, { userId }],
      },
    });

    if (!category) {
      throw new Error('CATEGORY_NOT_FOUND');
    }

    let subcategoryRecord: any = null;
    if (subcategoryId) {
      subcategoryRecord = await prisma.subcategories.findFirst({
        where: { id: subcategoryId, category_id: categoryId },
      });
    }

    if (!subcategoryRecord) {
      subcategoryRecord = await prisma.subcategories.findFirst({
        where: { category_id: categoryId },
      });
    }

    if (!subcategoryRecord) {
      throw new Error('SUBCATEGORY_REQUIRED');
    }

    const numericAmount = new Prisma.Decimal(amount);
    const balanceAdjustment = type === 'INCOME' ? numericAmount : numericAmount.negated();

    return prisma.$transaction(async (tx) => {
      const newTransaction = await tx.transaction.create({
        data: {
          accountId,
          categoryId,
          subcategory_id: subcategoryRecord.id,
          amount: numericAmount,
          type,
          date: date ? new Date(date) : new Date(),
          Title: title,
        },
        include: {
          account: { select: { id: true, name: true } },
          category: { select: { id: true, name: true, type: true, icon: true, color: true } },
          subcategory: { select: { id: true, name: true } },
        },
      });

      await tx.account.update({
        where: { id: accountId },
        data: {
          balance: { increment: balanceAdjustment },
        },
      });

      return {
        id: newTransaction.id,
        accountId: newTransaction.accountId,
        categoryId: newTransaction.categoryId,
        subcategoryId: newTransaction.subcategory_id,
        amount: Number(newTransaction.amount),
        type: newTransaction.type,
        date: newTransaction.date.toISOString().split('T')[0],
        title: newTransaction.Title,
        createdAt: newTransaction.createdAt,
        updatedAt: newTransaction.updatedAt,
        account: newTransaction.account,
        category: newTransaction.category,
        subcategory: newTransaction.subcategory,
      };
    });
  }

  /**
   * Update existing transaction & adjust account balance
   */
  async updateTransaction(userId: string, id: string, dto: UpdateTransactionDTO) {
    const existingTx = await prisma.transaction.findUnique({
      where: { id },
      include: { account: true },
    });

    if (!existingTx) {
      throw new Error('TRANSACTION_NOT_FOUND');
    }

    if (existingTx.account.userId !== userId) {
      throw new Error('FORBIDDEN');
    }

    const targetAccountId = dto.accountId || existingTx.accountId;
    if (targetAccountId !== existingTx.accountId) {
      const newAccount = await prisma.account.findFirst({
        where: { id: targetAccountId, userId },
      });
      if (!newAccount) {
        throw new Error('ACCOUNT_NOT_FOUND');
      }
    }

    const targetCategoryId = dto.categoryId || existingTx.categoryId;
    let targetSubcategoryId = dto.subcategoryId || existingTx.subcategory_id;

    if (dto.categoryId && dto.categoryId !== existingTx.categoryId) {
      const sub = await prisma.subcategories.findFirst({
        where: { category_id: targetCategoryId },
      });
      if (sub) {
        targetSubcategoryId = sub.id;
      }
    }

    const newAmount = dto.amount !== undefined ? new Prisma.Decimal(dto.amount) : existingTx.amount;
    const newType = dto.type || existingTx.type;

    const oldAdjustment = existingTx.type === 'INCOME'
      ? existingTx.amount.negated()
      : existingTx.amount;

    const newAdjustment = newType === 'INCOME'
      ? newAmount
      : newAmount.negated();

    return prisma.$transaction(async (tx) => {
      if (existingTx.accountId === targetAccountId) {
        const netAdjustment = oldAdjustment.add(newAdjustment);
        await tx.account.update({
          where: { id: existingTx.accountId },
          data: { balance: { increment: netAdjustment } },
        });
      } else {
        await tx.account.update({
          where: { id: existingTx.accountId },
          data: { balance: { increment: oldAdjustment } },
        });
        await tx.account.update({
          where: { id: targetAccountId },
          data: { balance: { increment: newAdjustment } },
        });
      }

      const updatedTx = await tx.transaction.update({
        where: { id },
        data: {
          accountId: targetAccountId,
          categoryId: targetCategoryId,
          subcategory_id: targetSubcategoryId,
          amount: newAmount,
          type: newType,
          date: dto.date ? new Date(dto.date) : existingTx.date,
          Title: dto.title !== undefined ? dto.title : existingTx.Title,
        },
        include: {
          account: { select: { id: true, name: true } },
          category: { select: { id: true, name: true, type: true, icon: true, color: true } },
          subcategory: { select: { id: true, name: true } },
        },
      });

      return {
        id: updatedTx.id,
        accountId: updatedTx.accountId,
        categoryId: updatedTx.categoryId,
        subcategoryId: updatedTx.subcategory_id,
        amount: Number(updatedTx.amount),
        type: updatedTx.type,
        date: updatedTx.date.toISOString().split('T')[0],
        title: updatedTx.Title,
        createdAt: updatedTx.createdAt,
        updatedAt: updatedTx.updatedAt,
        account: updatedTx.account,
        category: updatedTx.category,
        subcategory: updatedTx.subcategory,
      };
    });
  }

  /**
   * Delete transaction & restore account balance
   */
  async deleteTransaction(userId: string, id: string) {
    const existingTx = await prisma.transaction.findUnique({
      where: { id },
      include: { account: true },
    });

    if (!existingTx) {
      throw new Error('TRANSACTION_NOT_FOUND');
    }

    if (existingTx.account.userId !== userId) {
      throw new Error('FORBIDDEN');
    }

    const refundAdjustment = existingTx.type === 'INCOME'
      ? existingTx.amount.negated()
      : existingTx.amount;

    await prisma.$transaction(async (tx) => {
      await tx.account.update({
        where: { id: existingTx.accountId },
        data: { balance: { increment: refundAdjustment } },
      });

      await tx.transaction.delete({
        where: { id },
      });
    });

    return { success: true, message: 'Transaction deleted successfully' };
  }

  /**
   * Summary of totals
   */
  async getTransactionSummary(userId: string): Promise<TransactionSummaryResponse> {
    const userAccounts = await prisma.account.findMany({
      where: { userId },
      select: { id: true },
    });

    const accountIds = userAccounts.map((a: any) => a.id);

    const aggregates = await prisma.transaction.groupBy({
      by: ['type'],
      where: { accountId: { in: accountIds } },
      _sum: { amount: true },
      _count: { id: true },
    });

    let totalIncome = 0;
    let totalExpense = 0;
    let incomeCount = 0;
    let expenseCount = 0;

    for (const group of aggregates) {
      const sum = group._sum.amount ? Number(group._sum.amount) : 0;
      if (group.type === 'INCOME') {
        totalIncome = sum;
        incomeCount = group._count.id;
      } else if (group.type === 'EXPENSE') {
        totalExpense = sum;
        expenseCount = group._count.id;
      }
    }

    return {
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense,
      incomeCount,
      expenseCount,
    };
  }
}

export const transactionsService = new TransactionsService();
