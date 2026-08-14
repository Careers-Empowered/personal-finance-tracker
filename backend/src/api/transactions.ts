import { Router, Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../infrastructure/postgres/prismaClient';
import { authMiddleware, AuthenticatedRequest } from '../security/authMiddleware';

const router = Router();

// Apply authMiddleware to all routes here
router.use(authMiddleware);

/**
 * 1. Fetch Accounts
 * GET /api/transactions/accounts
 */
router.get('/accounts', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const accounts = await prisma.account.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        currency: true,
        balance: true,
        isPrimary: true
      }
    });

    // Map Decimal to number
    const formattedAccounts = accounts.map((acc: any) => ({
      ...acc,
      balance: Number(acc.balance)
    }));

    return res.json(formattedAccounts);
  } catch (error) {
    console.error('Fetch accounts error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * 2. Fetch Categories (default + custom)
 * GET /api/transactions/categories
 */
router.get('/categories', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const categories = await prisma.category.findMany({
      where: {
        OR: [
          { userId: null },
          { userId }
        ]
      },
      select: {
        id: true,
        name: true,
        type: true,
        icon: true,
        color: true,
        is_default: true
      }
    });

    return res.json(categories);
  } catch (error) {
    console.error('Fetch categories error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * 3. Fetch Subcategories (filtering by categoryId optionally)
 * GET /api/transactions/subcategories
 */
router.get('/subcategories', async (req: AuthenticatedRequest, res: Response) => {
  const { categoryId } = req.query;

  try {
    const userId = req.userId!;

    if (categoryId) {
      const categoryUUID = String(categoryId);
      // Validate that category is available to user (default or owned by user)
      const category = await prisma.category.findFirst({
        where: {
          id: categoryUUID,
          OR: [
            { userId: null },
            { userId }
          ]
        }
      });

      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }

      const subcategories = await prisma.subcategories.findMany({
        where: { category_id: categoryUUID },
        select: {
          id: true,
          name: true,
          category_id: true
        }
      });

      // Map to camelCase categoryId for frontend consistency if needed
      const formatted = subcategories.map((sub: any) => ({
        id: sub.id,
        name: sub.name,
        categoryId: sub.category_id
      }));

      return res.json(formatted);
    }

    // Return all subcategories of categories available to the user
    const subcategories = await prisma.subcategories.findMany({
      where: {
        categories: {
          OR: [
            { userId: null },
            { userId }
          ]
        }
      },
      select: {
        id: true,
        name: true,
        category_id: true
      }
    });

    const formatted = subcategories.map((sub: any) => ({
      id: sub.id,
      name: sub.name,
      categoryId: sub.category_id
    }));

    return res.json(formatted);
  } catch (error) {
    console.error('Fetch subcategories error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * 4. List Transactions
 * GET /api/transactions
 */
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const transactions = await prisma.transaction.findMany({
      where: {
        account: {
          userId
        }
      },
      include: {
        account: {
          select: { id: true, name: true }
        },
        category: {
          select: { id: true, name: true, type: true, icon: true, color: true }
        },
        subcategory: {
          select: { id: true, name: true }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    // Format fields for frontend (including subcategory mapping)
    const formattedTransactions = transactions.map((tx: any) => ({
      id: tx.id,
      accountId: tx.accountId,
      categoryId: tx.categoryId,
      subcategoryId: tx.subcategory_id,
      amount: Number(tx.amount),
      type: tx.type,
      date: tx.date.toISOString().split('T')[0],
      title: tx.Title,
      createdAt: tx.createdAt,
      updatedAt: tx.updatedAt,
      account: tx.account,
      category: tx.category,
      subcategory: tx.subcategory ? {
        id: tx.subcategory.id,
        name: tx.subcategory.name
      } : null
    }));

    return res.json(formattedTransactions);
  } catch (error) {
    console.error('List transactions error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * 5. Create Transaction
 * POST /api/transactions
 */
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  const { accountId, categoryId, subcategoryId, amount, type, date, title } = req.body;
  const userId = req.userId!;

  // 1. Validation
  if (!accountId || !categoryId || !subcategoryId || !amount || !type || !date || !title) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const parsedAmount = Number(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ error: 'Amount must be a positive number' });
  }

  if (type !== 'INCOME' && type !== 'EXPENSE') {
    return res.status(400).json({ error: 'Invalid transaction type' });
  }

  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    return res.status(400).json({ error: 'Invalid date format' });
  }

  try {
    // 2. Validate account ownership
    const account = await prisma.account.findUnique({
      where: { id: accountId }
    });
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }
    if (account.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden: Account belongs to another user' });
    }

    // 3. Validate category availability
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    if (category.userId && category.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden: Category belongs to another user' });
    }

    // 4. Validate subcategory belongs to category
    const subcategory = await prisma.subcategories.findUnique({
      where: { id: subcategoryId }
    });
    if (!subcategory) {
      return res.status(404).json({ error: 'Subcategory not found' });
    }
    if (subcategory.category_id !== categoryId) {
      return res.status(400).json({ error: 'Subcategory does not belong to the selected category' });
    }

    // 5. Database transaction: Create transaction and adjust account balance
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const createdTx = await tx.transaction.create({
        data: {
          accountId,
          categoryId,
          subcategory_id: subcategoryId,
          amount: parsedAmount,
          type,
          date: parsedDate,
          Title: title.trim()
        },
        include: {
          account: { select: { id: true, name: true } },
          category: { select: { id: true, name: true, type: true, icon: true, color: true } },
          subcategory: { select: { id: true, name: true } }
        }
      });

      const balanceOffset = type === 'INCOME' ? parsedAmount : -parsedAmount;
      await tx.account.update({
        where: { id: accountId },
        data: {
          balance: {
            increment: balanceOffset
          }
        }
      });

      return createdTx;
    });

    const resObj = result as any;
    const formattedTx = {
      id: resObj.id,
      accountId: resObj.accountId,
      categoryId: resObj.categoryId,
      subcategoryId: resObj.subcategory_id,
      amount: Number(resObj.amount),
      type: resObj.type,
      date: resObj.date.toISOString().split('T')[0],
      title: resObj.Title,
      createdAt: resObj.createdAt,
      updatedAt: resObj.updatedAt,
      account: resObj.account,
      category: resObj.category,
      subcategory: resObj.subcategory ? {
        id: resObj.subcategory.id,
        name: resObj.subcategory.name
      } : null
    };

    return res.status(201).json(formattedTx);
  } catch (error) {
    console.error('Create transaction error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * 6. Edit Transaction
 * PUT /api/transactions/:id
 */
router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { accountId, categoryId, subcategoryId, amount, type, date, title } = req.body;
  const userId = req.userId!;

  // 1. Validation
  if (!accountId || !categoryId || !subcategoryId || !amount || !type || !date || !title) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const parsedAmount = Number(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ error: 'Amount must be a positive number' });
  }

  if (type !== 'INCOME' && type !== 'EXPENSE') {
    return res.status(400).json({ error: 'Invalid transaction type' });
  }

  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    return res.status(400).json({ error: 'Invalid date format' });
  }

  try {
    // 2. Fetch existing transaction and check authorization
    const existingTx = await prisma.transaction.findUnique({
      where: { id },
      include: { account: true }
    });

    if (!existingTx) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (existingTx.account.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden: Transaction belongs to another user' });
    }

    // 3. Validate new account ownership
    const account = await prisma.account.findUnique({
      where: { id: accountId }
    });
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }
    if (account.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden: Account belongs to another user' });
    }

    // 4. Validate new category availability
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    if (category.userId && category.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden: Category belongs to another user' });
    }

    // 5. Validate new subcategory
    const subcategory = await prisma.subcategories.findUnique({
      where: { id: subcategoryId }
    });
    if (!subcategory) {
      return res.status(404).json({ error: 'Subcategory not found' });
    }
    if (subcategory.category_id !== categoryId) {
      return res.status(400).json({ error: 'Subcategory does not belong to the selected category' });
    }

    // 6. DB transaction: reverse old balance effect, apply new balance effect, update transaction
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Revert old effect
      const oldAmount = Number(existingTx.amount);
      const oldRevertOffset = existingTx.type === 'INCOME' ? -oldAmount : oldAmount;
      await tx.account.update({
        where: { id: existingTx.accountId },
        data: {
          balance: {
            increment: oldRevertOffset
          }
        }
      });

      // Apply new effect
      const newBalanceOffset = type === 'INCOME' ? parsedAmount : -parsedAmount;
      await tx.account.update({
        where: { id: accountId },
        data: {
          balance: {
            increment: newBalanceOffset
          }
        }
      });

      // Update transaction
      const updatedTx = await tx.transaction.update({
        where: { id },
        data: {
          accountId,
          categoryId,
          subcategory_id: subcategoryId,
          amount: parsedAmount,
          type,
          date: parsedDate,
          Title: title.trim()
        },
        include: {
          account: { select: { id: true, name: true } },
          category: { select: { id: true, name: true, type: true, icon: true, color: true } },
          subcategory: { select: { id: true, name: true } }
        }
      });

      return updatedTx;
    });

    const resObj = result as any;
    const formattedTx = {
      id: resObj.id,
      accountId: resObj.accountId,
      categoryId: resObj.categoryId,
      subcategoryId: resObj.subcategory_id,
      amount: Number(resObj.amount),
      type: resObj.type,
      date: resObj.date.toISOString().split('T')[0],
      title: resObj.Title,
      createdAt: resObj.createdAt,
      updatedAt: resObj.updatedAt,
      account: resObj.account,
      category: resObj.category,
      subcategory: resObj.subcategory ? {
        id: resObj.subcategory.id,
        name: resObj.subcategory.name
      } : null
    };

    return res.json(formattedTx);
  } catch (error) {
    console.error('Update transaction error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * 7. Delete Transaction
 * DELETE /api/transactions/:id
 */
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.userId!;

  try {
    // 1. Fetch transaction and check ownership
    const existingTx = await prisma.transaction.findUnique({
      where: { id },
      include: { account: true }
    });

    if (!existingTx) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (existingTx.account.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden: Transaction belongs to another user' });
    }

    // 2. DB transaction: reverse balance effect, delete transaction
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const amount = Number(existingTx.amount);
      const revertOffset = existingTx.type === 'INCOME' ? -amount : amount;

      // Revert account balance
      await tx.account.update({
        where: { id: existingTx.accountId },
        data: {
          balance: {
            increment: revertOffset
          }
        }
      });

      // Delete transaction record
      await tx.transaction.delete({
        where: { id }
      });
    });

    return res.status(200).json({ success: true, message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
