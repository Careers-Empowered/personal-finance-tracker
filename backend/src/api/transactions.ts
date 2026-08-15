import { Router, Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../infrastructure/postgres/prismaClient';
import {
  authMiddleware,
  AuthenticatedRequest,
} from '../security/authMiddleware';

const router = Router();

// Apply authentication middleware to all transaction routes
router.use(authMiddleware);


// ============================================================
// 1. FETCH ACCOUNTS
// GET /api/transactions/accounts
// ============================================================

router.get(
  '/accounts',
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId!;

      const accounts = await prisma.account.findMany({
        where: {
          userId,
        },
        select: {
          id: true,
          name: true,
          currency: true,
          balance: true,
          isPrimary: true,
        },
      });

      const formattedAccounts = accounts.map((acc: any) => ({
        ...acc,
        balance: Number(acc.balance),
      }));

      return res.json(formattedAccounts);
    } catch (error) {
      console.error('Fetch accounts error:', error);

      return res.status(500).json({
        error: 'Internal Server Error',
      });
    }
  }
);


// ============================================================
// 2. FETCH CATEGORIES
// GET /api/transactions/categories
// ============================================================

router.get(
  '/categories',
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId!;

      const categories = await prisma.category.findMany({
        where: {
          OR: [
            { userId: null },
            { userId },
          ],
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

      return res.json(categories);
    } catch (error) {
      console.error('Fetch categories error:', error);

      return res.status(500).json({
        error: 'Internal Server Error',
      });
    }
  }
);


// ============================================================
// 3. FETCH SUBCATEGORIES
// GET /api/transactions/subcategories
// GET /api/transactions/subcategories?categoryId=...
// ============================================================

router.get(
  '/subcategories',
  async (req: AuthenticatedRequest, res: Response) => {
    const { categoryId } = req.query;

    try {
      const userId = req.userId!;

      // If categoryId is supplied
      if (categoryId) {
        const categoryUUID = String(categoryId);

        // Make sure category belongs to the user
        // or is a default category.
        const category = await prisma.category.findFirst({
          where: {
            id: categoryUUID,
            OR: [
              { userId: null },
              { userId },
            ],
          },
        });

        if (!category) {
          return res.status(404).json({
            error: 'Category not found',
          });
        }

        const subcategories =
          await prisma.subcategories.findMany({
            where: {
              category_id: categoryUUID,
            },
            select: {
              id: true,
              name: true,
              category_id: true,
            },
          });

        const formatted = subcategories.map(
          (sub: any) => ({
            id: sub.id,
            name: sub.name,
            categoryId: sub.category_id,
          })
        );

        return res.json(formatted);
      }

      // Return all subcategories available
      // to the current user.
      const subcategories =
        await prisma.subcategories.findMany({
          where: {
            categories: {
              OR: [
                { userId: null },
                { userId },
              ],
            },
          },
          select: {
            id: true,
            name: true,
            category_id: true,
          },
        });

      const formatted = subcategories.map(
        (sub: any) => ({
          id: sub.id,
          name: sub.name,
          categoryId: sub.category_id,
        })
      );

      return res.json(formatted);
    } catch (error) {
      console.error(
        'Fetch subcategories error:',
        error
      );

      return res.status(500).json({
        error: 'Internal Server Error',
      });
    }
  }
);


// ============================================================
// 4. LIST TRANSACTIONS
// GET /api/transactions
// ============================================================

router.get(
  '/',
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId!;

      const transactions =
        await prisma.transaction.findMany({
          where: {
            account: {
              userId,
            },
          },

          include: {
            account: {
              select: {
                id: true,
                name: true,
              },
            },

            category: {
              select: {
                id: true,
                name: true,
                type: true,
                icon: true,
                color: true,
              },
            },

            subcategory: {
              select: {
                id: true,
                name: true,
              },
            },
          },

          orderBy: {
            date: 'desc',
          },
        });

      const formattedTransactions =
        transactions.map((tx: any) => ({
          id: tx.id,

          accountId: tx.accountId,

          categoryId: tx.categoryId,
          subcategoryId: tx.subcategory_id,

          amount: Number(tx.amount),

          type: tx.type,

          date: tx.date
            .toISOString()
            .split('T')[0],

          title: tx.Title,

          // ========================================
          // IMPORT OVERRIDE INFORMATION
          // ========================================

          importedWithOverride:
            tx.importedWithOverride,

          overrideNote:
            tx.overrideNote,

          createdAt: tx.createdAt,

          updatedAt: tx.updatedAt,

          account: tx.account,

          category: tx.category,

          subcategory:
            tx.subcategory
              ? {
                  id: tx.subcategory.id,
                  name: tx.subcategory.name,
                }
              : null,
        }));

      return res.json(formattedTransactions);
    } catch (error) {
      console.error(
        'List transactions error:',
        error
      );

      return res.status(500).json({
        error: 'Internal Server Error',
      });
    }
  }
);


// ============================================================
// 5. CREATE TRANSACTION
// POST /api/transactions
// ============================================================

router.post(
  '/',
  async (req: AuthenticatedRequest, res: Response) => {
    const {
      accountId,
      categoryId,
      subcategoryId,
      amount,
      type,
      date,
      title,

      // ========================================
      // IMPORT DUPLICATE OVERRIDE FIELDS
      // ========================================

      importedWithOverride = false,
      overrideNote = null,
    } = req.body;

    const userId = req.userId!;


    // ========================================================
    // 1. BASIC VALIDATION
    // ========================================================

    if (
      !accountId ||
      !categoryId ||
      !subcategoryId ||
      !amount ||
      !type ||
      !date ||
      !title
    ) {
      return res.status(400).json({
        error: 'All fields are required',
      });
    }


    // ========================================================
    // 2. AMOUNT VALIDATION
    // ========================================================

    const parsedAmount = Number(amount);

    if (
      isNaN(parsedAmount) ||
      parsedAmount <= 0
    ) {
      return res.status(400).json({
        error: 'Amount must be a positive number',
      });
    }


    // ========================================================
    // 3. TYPE VALIDATION
    // ========================================================

    if (
      type !== 'INCOME' &&
      type !== 'EXPENSE'
    ) {
      return res.status(400).json({
        error: 'Invalid transaction type',
      });
    }


    // ========================================================
    // 4. IMPORT OVERRIDE VALIDATION
    // ========================================================

    if (
      typeof importedWithOverride !== 'boolean'
    ) {
      return res.status(400).json({
        error:
          'importedWithOverride must be a boolean',
      });
    }


    // Add Anyway requires a note.
    if (
      importedWithOverride &&
      typeof overrideNote !== 'string'
    ) {
      return res.status(400).json({
        error:
          'A note is required when Add Anyway is selected',
      });
    }


    // Clean the note before storing it.
    const cleanedOverrideNote =
      importedWithOverride &&
      typeof overrideNote === 'string'
        ? overrideNote.trim()
        : null;


    // Prevent an empty Add Anyway note.
    if (
      importedWithOverride &&
      (!cleanedOverrideNote ||
        cleanedOverrideNote.length === 0)
    ) {
      return res.status(400).json({
        error:
          'Override note cannot be empty',
      });
    }


    // ========================================================
    // 5. DATE VALIDATION
    // ========================================================

    const parsedDate = new Date(date);

    if (
      isNaN(parsedDate.getTime())
    ) {
      return res.status(400).json({
        error: 'Invalid date format',
      });
    }


    try {

      // ======================================================
      // 6. VALIDATE ACCOUNT OWNERSHIP
      // ======================================================

      const account =
        await prisma.account.findUnique({
          where: {
            id: accountId,
          },
        });

      if (!account) {
        return res.status(404).json({
          error: 'Account not found',
        });
      }

      if (
        account.userId !== userId
      ) {
        return res.status(403).json({
          error:
            'Forbidden: Account belongs to another user',
        });
      }


      // ======================================================
      // 7. VALIDATE CATEGORY
      // ======================================================

      const category =
        await prisma.category.findUnique({
          where: {
            id: categoryId,
          },
        });

      if (!category) {
        return res.status(404).json({
          error: 'Category not found',
        });
      }

      if (
        category.userId &&
        category.userId !== userId
      ) {
        return res.status(403).json({
          error:
            'Forbidden: Category belongs to another user',
        });
      }


      // ======================================================
      // 8. VALIDATE SUBCATEGORY
      // ======================================================

      const subcategory =
        await prisma.subcategories.findUnique({
          where: {
            id: subcategoryId,
          },
        });

      if (!subcategory) {
        return res.status(404).json({
          error: 'Subcategory not found',
        });
      }

      if (
        subcategory.category_id !==
        categoryId
      ) {
        return res.status(400).json({
          error:
            'Subcategory does not belong to the selected category',
        });
      }


      // ======================================================
      // 9. DATABASE TRANSACTION
      // ======================================================

      const result =
        await prisma.$transaction(
          async (
            tx: Prisma.TransactionClient
          ) => {

            // ----------------------------------------------
            // Create transaction
            // ----------------------------------------------

            const createdTx =
              await tx.transaction.create({
                data: {
                  accountId,

                  categoryId,

                  subcategory_id:
                    subcategoryId,

                  amount:
                    parsedAmount,

                  type,

                  date:
                    parsedDate,

                  Title:
                    title.trim(),

                  // ----------------------------------------
                  // Import duplicate override information
                  // ----------------------------------------

                  importedWithOverride,

                  overrideNote:
                    cleanedOverrideNote,
                },

                include: {
                  account: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },

                  category: {
                    select: {
                      id: true,
                      name: true,
                      type: true,
                      icon: true,
                      color: true,
                    },
                  },

                  subcategory: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              });


            // ----------------------------------------------
            // Update account balance
            // ----------------------------------------------

            const balanceOffset =
              type === 'INCOME'
                ? parsedAmount
                : -parsedAmount;

            await tx.account.update({
              where: {
                id: accountId,
              },

              data: {
                balance: {
                  increment:
                    balanceOffset,
                },
              },
            });


            return createdTx;
          }
        );


      // ======================================================
      // 10. FORMAT RESPONSE
      // ======================================================

      const resObj =
        result as any;

      const formattedTx = {
        id: resObj.id,

        accountId:
          resObj.accountId,

        categoryId:
          resObj.categoryId,

        subcategoryId:
          resObj.subcategory_id,

        amount:
          Number(resObj.amount),

        type:
          resObj.type,

        date:
          resObj.date
            .toISOString()
            .split('T')[0],

        title:
          resObj.Title,

        // ================================================
        // IMPORT OVERRIDE INFORMATION
        // ================================================

        importedWithOverride:
          resObj.importedWithOverride,

        overrideNote:
          resObj.overrideNote,

        createdAt:
          resObj.createdAt,

        updatedAt:
          resObj.updatedAt,

        account:
          resObj.account,

        category:
          resObj.category,

        subcategory:
          resObj.subcategory
            ? {
                id:
                  resObj.subcategory.id,
                name:
                  resObj.subcategory.name,
              }
            : null,
      };


      return res
        .status(201)
        .json(formattedTx);

    } catch (error) {

      console.error(
        'Create transaction error:',
        error
      );

      return res.status(500).json({
        error: 'Internal Server Error',
      });
    }
  }
);


// ============================================================
// 6. EDIT TRANSACTION
// PUT /api/transactions/:id
// ============================================================

router.put(
  '/:id',
  async (
    req: AuthenticatedRequest,
    res: Response
  ) => {

    const { id } = req.params;

    const {
      accountId,
      categoryId,
      subcategoryId,
      amount,
      type,
      date,
      title,
    } = req.body;

    const userId = req.userId!;


    // ========================================================
    // 1. VALIDATION
    // ========================================================

    if (
      !accountId ||
      !categoryId ||
      !subcategoryId ||
      !amount ||
      !type ||
      !date ||
      !title
    ) {
      return res.status(400).json({
        error: 'All fields are required',
      });
    }


    const parsedAmount = Number(amount);

    if (
      isNaN(parsedAmount) ||
      parsedAmount <= 0
    ) {
      return res.status(400).json({
        error:
          'Amount must be a positive number',
      });
    }


    if (
      type !== 'INCOME' &&
      type !== 'EXPENSE'
    ) {
      return res.status(400).json({
        error:
          'Invalid transaction type',
      });
    }


    const parsedDate = new Date(date);

    if (
      isNaN(parsedDate.getTime())
    ) {
      return res.status(400).json({
        error:
          'Invalid date format',
      });
    }


    try {

      // ======================================================
      // 2. FETCH EXISTING TRANSACTION
      // ======================================================

      const existingTx =
        await prisma.transaction.findUnique({
          where: {
            id,
          },

          include: {
            account: true,
          },
        });


      if (!existingTx) {
        return res.status(404).json({
          error:
            'Transaction not found',
        });
      }


      if (
        existingTx.account.userId !==
        userId
      ) {
        return res.status(403).json({
          error:
            'Forbidden: Transaction belongs to another user',
        });
      }


      // ======================================================
      // 3. VALIDATE NEW ACCOUNT
      // ======================================================

      const account =
        await prisma.account.findUnique({
          where: {
            id: accountId,
          },
        });


      if (!account) {
        return res.status(404).json({
          error:
            'Account not found',
        });
      }


      if (
        account.userId !== userId
      ) {
        return res.status(403).json({
          error:
            'Forbidden: Account belongs to another user',
        });
      }


      // ======================================================
      // 4. VALIDATE CATEGORY
      // ======================================================

      const category =
        await prisma.category.findUnique({
          where: {
            id: categoryId,
          },
        });


      if (!category) {
        return res.status(404).json({
          error:
            'Category not found',
        });
      }


      if (
        category.userId &&
        category.userId !== userId
      ) {
        return res.status(403).json({
          error:
            'Forbidden: Category belongs to another user',
        });
      }


      // ======================================================
      // 5. VALIDATE SUBCATEGORY
      // ======================================================

      const subcategory =
        await prisma.subcategories.findUnique({
          where: {
            id: subcategoryId,
          },
        });


      if (!subcategory) {
        return res.status(404).json({
          error:
            'Subcategory not found',
        });
      }


      if (
        subcategory.category_id !==
        categoryId
      ) {
        return res.status(400).json({
          error:
            'Subcategory does not belong to the selected category',
        });
      }


      // ======================================================
      // 6. DATABASE TRANSACTION
      // ======================================================

      const result =
        await prisma.$transaction(
          async (
            tx: Prisma.TransactionClient
          ) => {

            // ----------------------------------------------
            // Reverse old account balance
            // ----------------------------------------------

            const oldAmount =
              Number(existingTx.amount);

            const oldRevertOffset =
              existingTx.type === 'INCOME'
                ? -oldAmount
                : oldAmount;

            await tx.account.update({
              where: {
                id:
                  existingTx.accountId,
              },

              data: {
                balance: {
                  increment:
                    oldRevertOffset,
                },
              },
            });


            // ----------------------------------------------
            // Apply new account balance
            // ----------------------------------------------

            const newBalanceOffset =
              type === 'INCOME'
                ? parsedAmount
                : -parsedAmount;

            await tx.account.update({
              where: {
                id: accountId,
              },

              data: {
                balance: {
                  increment:
                    newBalanceOffset,
                },
              },
            });


            // ----------------------------------------------
            // Update transaction
            // ----------------------------------------------

            const updatedTx =
              await tx.transaction.update({
                where: {
                  id,
                },

                data: {
                  accountId,

                  categoryId,

                  subcategory_id:
                    subcategoryId,

                  amount:
                    parsedAmount,

                  type,

                  date:
                    parsedDate,

                  Title:
                    title.trim(),
                },

                include: {
                  account: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },

                  category: {
                    select: {
                      id: true,
                      name: true,
                      type: true,
                      icon: true,
                      color: true,
                    },
                  },

                  subcategory: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              });


            return updatedTx;
          }
        );


      // ======================================================
      // 7. FORMAT RESPONSE
      // ======================================================

      const resObj =
        result as any;

      const formattedTx = {
        id:
          resObj.id,

        accountId:
          resObj.accountId,

        categoryId:
          resObj.categoryId,

        subcategoryId:
          resObj.subcategory_id,

        amount:
          Number(resObj.amount),

        type:
          resObj.type,

        date:
          resObj.date
            .toISOString()
            .split('T')[0],

        title:
          resObj.Title,

        // Preserve Add Anyway information
        importedWithOverride:
          resObj.importedWithOverride,

        overrideNote:
          resObj.overrideNote,

        createdAt:
          resObj.createdAt,

        updatedAt:
          resObj.updatedAt,

        account:
          resObj.account,

        category:
          resObj.category,

        subcategory:
          resObj.subcategory
            ? {
                id:
                  resObj.subcategory.id,
                name:
                  resObj.subcategory.name,
              }
            : null,
      };


      return res.json(
        formattedTx
      );

    } catch (error) {

      console.error(
        'Update transaction error:',
        error
      );

      return res.status(500).json({
        error:
          'Internal Server Error',
      });
    }
  }
);


// ============================================================
// 7. DELETE TRANSACTION
// DELETE /api/transactions/:id
// ============================================================

router.delete(
  '/:id',
  async (
    req: AuthenticatedRequest,
    res: Response
  ) => {

    const { id } = req.params;

    const userId =
      req.userId!;


    try {

      // ======================================================
      // 1. FETCH TRANSACTION
      // ======================================================

      const existingTx =
        await prisma.transaction.findUnique({
          where: {
            id,
          },

          include: {
            account: true,
          },
        });


      if (!existingTx) {
        return res.status(404).json({
          error:
            'Transaction not found',
        });
      }


      // ======================================================
      // 2. CHECK OWNERSHIP
      // ======================================================

      if (
        existingTx.account.userId !==
        userId
      ) {
        return res.status(403).json({
          error:
            'Forbidden: Transaction belongs to another user',
        });
      }


      // ======================================================
      // 3. DELETE + REVERT BALANCE
      // ======================================================

      await prisma.$transaction(
        async (
          tx: Prisma.TransactionClient
        ) => {

          const amount =
            Number(existingTx.amount);

          const revertOffset =
            existingTx.type === 'INCOME'
              ? -amount
              : amount;


          // Revert account balance
          await tx.account.update({
            where: {
              id:
                existingTx.accountId,
            },

            data: {
              balance: {
                increment:
                  revertOffset,
              },
            },
          });


          // Delete transaction
          await tx.transaction.delete({
            where: {
              id,
            },
          });
        }
      );


      return res.status(200).json({
        success: true,
        message:
          'Transaction deleted successfully',
      });

    } catch (error) {

      console.error(
        'Delete transaction error:',
        error
      );

      return res.status(500).json({
        error:
          'Internal Server Error',
      });
    }
  }
);


export default router;