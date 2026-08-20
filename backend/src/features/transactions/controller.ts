import { Response } from 'express';
import { AuthenticatedRequest } from '../../security/authMiddleware';
import { transactionsService } from './service';
import { TransactionType } from '@prisma/client';

export class TransactionsController {
  /**
   * GET /api/transactions/accounts
   */
  async getAccounts(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId!;
      const accounts = await transactionsService.getAccounts(userId);
      return res.json(accounts);
    } catch (error: any) {
      console.error('Fetch accounts error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * GET /api/transactions/categories
   */
  async getCategories(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId!;
      const categories = await transactionsService.getCategories(userId);
      return res.json(categories);
    } catch (error: any) {
      console.error('Fetch categories error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * POST /api/transactions/categories
   */
  async createCategory(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId!;
      const { name, type, icon, color } = req.body;

      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({
          error: 'Category name is required',
        });
      }

      const catType = type === 'INCOME' ? 'INCOME' : 'EXPENSE';

      const result = await transactionsService.createCategory(userId, {
        name: name.trim(),
        type: catType,
        icon,
        color,
      });

      return res.status(201).json(result);
    } catch (error: any) {
      console.error('Create category error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * GET /api/transactions/subcategories
   */
  async getSubcategories(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId!;
      const { categoryId } = req.query;

      const subcategories = await transactionsService.getSubcategories(
        userId,
        categoryId ? String(categoryId) : undefined
      );

      return res.json(subcategories);
    } catch (error: any) {
      if (error.message === 'CATEGORY_NOT_FOUND') {
        return res.status(404).json({
          error: 'Category not found',
        });
      }

      console.error('Fetch subcategories error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
      });
    }
  }

  /**
   * POST /api/transactions/subcategories
   */
  async createSubcategory(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId!;
      const { categoryId, name, icon } = req.body;

      if (!categoryId || typeof categoryId !== 'string') {
        return res.status(400).json({
          error: 'categoryId is required',
        });
      }

      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({
          error: 'Subcategory name is required',
        });
      }

      const result = await transactionsService.createSubcategory(userId, {
        categoryId,
        name: name.trim(),
        icon,
      });

      return res.status(201).json(result);
    } catch (error: any) {
      console.error('Create subcategory error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
      });
    }
  }

  /**
   * POST /api/transactions/check-existing
   */
  async checkExisting(req: AuthenticatedRequest, res: Response) {
    try {
      const { transactions } = req.body;

      if (!Array.isArray(transactions) || transactions.length === 0) {
        return res.status(400).json({ error: 'transactions array is required' });
      }

      const results = await transactionsService.checkExisting(transactions);

      return res.json({ existingTransactions: results });
    } catch (error: any) {
      console.error('Check existing transactions error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * GET /api/transactions/summary
   */
  async getSummary(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId!;
      const summary =
        await transactionsService.getTransactionSummary(userId);

      return res.json(summary);
    } catch (error: any) {
      console.error('Fetch summary error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
      });
    }
  }

  /**
   * GET /api/transactions
   */
  async getTransactions(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId!;

      const {
        type,
        categoryId,
        startDate,
        endDate,
        accountId,
        page,
        limit,
        search,
      } = req.query;

      const result = await transactionsService.getTransactions(userId, {
        type: type as TransactionType | 'ALL',
        categoryId: categoryId ? String(categoryId) : undefined,
        startDate: startDate ? String(startDate) : undefined,
        endDate: endDate ? String(endDate) : undefined,
        accountId: accountId ? String(accountId) : undefined,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
        search: search ? String(search) : undefined,
      });

      return res.json(result.data);
    } catch (error: any) {
      console.error('Fetch transactions error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
      });
    }
  }

  /**
   * POST /api/transactions
   */
  async createTransaction(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId!;
      const { accountId, categoryId, subcategoryId, amount, type, date, title, importedWithOverride, overrideNote } = req.body;

      const {
        accountId,
        categoryId,
        subcategoryId,
        amount,
        type,
        date,
        title,
      } = req.body;

      if (
        !accountId ||
        !categoryId ||
        amount === undefined ||
        !type ||
        !title
      ) {
        return res.status(400).json({
          error:
            'Missing required fields: accountId, categoryId, amount, type, title',
        });
      }

      if (type !== 'INCOME' && type !== 'EXPENSE') {
        return res.status(400).json({
          error: 'Invalid transaction type',
        });
      }

      if (typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({
          error: 'Amount must be a positive number',
        });
      }

      const transaction = await transactionsService.createTransaction(userId, {
        accountId,
        categoryId,
        subcategoryId,
        amount,
        type,
        date,
        title,
        importedWithOverride: importedWithOverride ?? false,
        overrideNote: overrideNote ?? null,
      });

      return res.status(201).json(transaction);
    } catch (error: any) {
      if (error.message === 'ACCOUNT_NOT_FOUND') {
        return res.status(404).json({
          error: 'Account not found',
        });
      }

      if (error.message === 'CATEGORY_NOT_FOUND') {
        return res.status(404).json({
          error: 'Category not found',
        });
      }

      if (error.message === 'SUBCATEGORY_REQUIRED') {
        return res.status(400).json({
          error: 'Subcategory required',
        });
      }

      console.error('Create transaction error:', error);

      return res.status(500).json({
        error: 'Internal Server Error',
      });
    }
  }

  /**
   * PUT /api/transactions/:id
   */
  async updateTransaction(
    req: AuthenticatedRequest,
    res: Response
  ) {
    try {
      const { id } = req.params;

      // Express can type route params as string | string[].
      // Normalize it to the string expected by the service.
      const transactionId = Array.isArray(id) ? id[0] : id;

      const userId = req.userId!;

      const {
        accountId,
        categoryId,
        subcategoryId,
        amount,
        type,
        date,
        title,
      } = req.body;

      if (
        amount !== undefined &&
        (typeof amount !== 'number' || amount <= 0)
      ) {
        return res.status(400).json({
          error: 'Amount must be a positive number',
        });
      }

      if (type && type !== 'INCOME' && type !== 'EXPENSE') {
        return res.status(400).json({
          error: 'Invalid transaction type',
        });
      }

      const updatedTransaction =
        await transactionsService.updateTransaction(
          userId,
          transactionId,
          {
            accountId,
            categoryId,
            subcategoryId,
            amount,
            type,
            date,
            title,
          }
        );

      return res.json(updatedTransaction);
    } catch (error: any) {
      if (error.message === 'TRANSACTION_NOT_FOUND') {
        return res.status(404).json({
          error: 'Transaction not found',
        });
      }

      if (error.message === 'FORBIDDEN') {
        return res.status(403).json({
          error: 'Forbidden',
        });
      }

      if (error.message === 'ACCOUNT_NOT_FOUND') {
        return res.status(404).json({
          error: 'Account not found',
        });
      }

      console.error('Update transaction error:', error);

      return res.status(500).json({
        error: 'Internal Server Error',
      });
    }
  }

  /**
   * DELETE /api/transactions/:id
   */
  async deleteTransaction(
    req: AuthenticatedRequest,
    res: Response
  ) {
    try {
      const { id } = req.params;

      // Normalize the route parameter to a string.
      const transactionId = Array.isArray(id) ? id[0] : id;

      const userId = req.userId!;

      const result =
        await transactionsService.deleteTransaction(
          userId,
          transactionId
        );

      return res.status(200).json(result);
    } catch (error: any) {
      if (error.message === 'TRANSACTION_NOT_FOUND') {
        return res.status(404).json({
          error: 'Transaction not found',
        });
      }

      if (error.message === 'FORBIDDEN') {
        return res.status(403).json({
          error: 'Forbidden',
        });
      }

      console.error('Delete transaction error:', error);

      return res.status(500).json({
        error: 'Internal Server Error',
      });
    }
  }
}

export const transactionsController = new TransactionsController();