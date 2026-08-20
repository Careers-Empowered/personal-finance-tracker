import { query } from '../../infrastructure/postgres/db';
import {
  CreateTransactionDTO,
  UpdateTransactionDTO,
  TransactionFilterQuery,
  TransactionSummaryResponse,
  CheckExistingTransactionInput,
} from './types';

export class TransactionsService {
  /**
   * Fetch accounts belonging to the user (or all accounts if fallback)
   */
  async getAccounts(userId: string) {
    const { rows } = await query(
      `SELECT id, name, currency, balance, is_primary as "isPrimary"
       FROM accounts
       WHERE user_id = $1 OR $1 IS NOT NULL
       ORDER BY name ASC`,
      [userId]
    );

    return rows.map((acc: any) => ({
      ...acc,
      balance: Number(acc.balance),
    }));
  }

  /**
   * Fetch categories (system defaults + user custom)
   */
  async getCategories(userId: string) {
    const { rows } = await query(
      `SELECT id, name, type, icon, color, is_default
       FROM categories
       WHERE user_id IS NULL OR user_id = $1
       ORDER BY name ASC`,
      [userId || null]
    );

    return rows;
  }

  /**
   * Create custom category & default subcategory for user
   */
  async createCategory(
    userId: string,
    data: { name: string; type: 'INCOME' | 'EXPENSE'; icon?: string; color?: string }
  ) {
    const { name, type, icon = '🏷️', color = '#eff6ff' } = data;

    const catRes = await query(
      `INSERT INTO categories (id, user_id, name, type, icon, color, is_default)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, false)
       RETURNING id, name, type, icon, color, is_default`,
      [userId || null, name, type, icon, color]
    );

    const newCategory = catRes.rows[0];

    const subRes = await query(
      `INSERT INTO subcategories (id, category_id, user_id, name, icon, color, is_default)
       VALUES (gen_random_uuid(), $1, $2, 'General', $3, $4, false)
       RETURNING id, name, icon, category_id as "categoryId"`,
      [newCategory.id, userId || null, icon, color]
    );

    const newSubcategory = subRes.rows[0];

    return {
      category: newCategory,
      subcategory: newSubcategory,
    };
  }

  /**
   * Create custom subcategory under a parent category
   */
  async createSubcategory(
    userId: string,
    data: { categoryId: string; name: string; icon?: string }
  ) {
    const { categoryId, name, icon = '•' } = data;

    const subRes = await query(
      `INSERT INTO subcategories (id, category_id, user_id, name, icon, is_default)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, false)
       RETURNING id, name, icon, category_id as "categoryId"`,
      [categoryId, userId || null, name, icon]
    );

    return subRes.rows[0];
  }

  /**
   * Fetch subcategories (optionally filtered by categoryId)
   */
  async getSubcategories(userId: string, categoryId?: string) {
    if (categoryId) {
      const { rows } = await query(
        `SELECT id, name, icon, category_id as "categoryId"
         FROM subcategories
         WHERE category_id = $1
         ORDER BY name ASC`,
        [categoryId]
      );
      return rows;
    }

    const { rows } = await query(
      `SELECT id, name, icon, category_id as "categoryId"
       FROM subcategories
       ORDER BY name ASC`
    );

    return rows;
  }

  /**
   * Fetch paginated & filtered transactions
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

    let queryText = `
  SELECT 
    t.id,
    t.account_id as "accountId",
    t.category_id as "categoryId",
    t.subcategory_id as "subcategoryId",
    t.amount,
    t.type,
    t.date,
    t."Title" as title,
    t.created_at as "createdAt",
    t.updated_at as "updatedAt",
    t.imported_with_override as "importedWithOverride",
    t.override_note as "overrideNote",
    json_build_object('id', a.id, 'name', a.name) as account,
    json_build_object(
      'id', c.id,
      'name', c.name,
      'type', c.type,
      'icon', c.icon,
      'color', c.color
    ) as category,
    CASE
      WHEN s.id IS NOT NULL
      THEN json_build_object('id', s.id, 'name', s.name)
      ELSE NULL
    END as subcategory
  FROM transactions t
  LEFT JOIN accounts a ON t.account_id = a.id
  LEFT JOIN categories c ON t.category_id = c.id
  LEFT JOIN subcategories s ON t.subcategory_id = s.id
  WHERE 1=1
`;

    const queryParams: any[] = [];

    if (type && type !== 'ALL') {
      queryParams.push(type);
      queryText += ` AND t.type = $${queryParams.length}`;
    }

    if (categoryId) {
      queryParams.push(categoryId);
      queryText += ` AND t.category_id = $${queryParams.length}`;
    }

    if (accountId) {
      queryParams.push(accountId);
      queryText += ` AND t.account_id = $${queryParams.length}`;
    }

    if (startDate) {
      queryParams.push(startDate);
      queryText += ` AND t.date >= $${queryParams.length}`;
    }

    if (endDate) {
      queryParams.push(endDate);
      queryText += ` AND t.date <= $${queryParams.length}`;
    }

    if (search) {
      queryParams.push(`%${search}%`);
      queryText += ` AND t."Title" ILIKE $${queryParams.length}`;
    }

    queryText += ` ORDER BY t.date DESC`;

    const { rows } = await query(queryText, queryParams);

    const formattedTransactions = rows.map((tx: any) => ({
  id: tx.id,
  accountId: tx.accountId,
  categoryId: tx.categoryId,
  subcategoryId: tx.subcategoryId,
  amount: Number(tx.amount),
  type: tx.type,
  date: tx.date ? new Date(tx.date).toISOString().split('T')[0] : '',
  title: tx.title,
  createdAt: tx.createdAt,
  updatedAt: tx.updatedAt,

  // Import override information
  importedWithOverride: tx.importedWithOverride ?? false,
  overrideNote: tx.overrideNote ?? null,

  // Relations
  account: tx.account,
  category: tx.category,
  subcategory: tx.subcategory,
}));

    return {
      data: formattedTransactions,
      pagination: {
        total: rows.length,
        page: Number(page),
        limit: Number(limit),
        totalPages: 1,
      },
    };
  }

  /**
   * Create new transaction & adjust account balance
   */
  /**
   * Check if transactions already exist in the database (for duplicate detection)
   */
  async checkExisting(inputs: CheckExistingTransactionInput[]) {
    const results: Array<{
      row: number;
      exists: boolean;
      existingTransaction?: any;
    }> = [];

    for (const item of inputs) {
      const { row, accountId, date, title, amount, type } = item;

      const txDate = new Date(date);
      const nextDay = new Date(txDate);
      nextDay.setDate(nextDay.getDate() + 1);

      const { rows } = await query(
        `SELECT t.id, t.account_id as "accountId", t."Title" as title, t.amount, t.type, t.date,
                json_build_object('id', a.id, 'name', a.name) as account
         FROM transactions t
         LEFT JOIN accounts a ON a.id = t.account_id
         WHERE t.account_id = $1
           AND t.date >= $2 AND t.date < $3
           AND LOWER(t."Title") = LOWER($4)
           AND t.amount = $5
           AND t.type = $6
         LIMIT 1`,
        [accountId, txDate, nextDay, title, amount, type]
      );

      if (rows.length > 0) {
        results.push({ row, exists: true, existingTransaction: rows[0] });
      } else {
        results.push({ row, exists: false });
      }
    }

    return results;
  }

  /**
   * Create new transaction & adjust account balance
   */
  async createTransaction(userId: string, dto: CreateTransactionDTO) {
    const { accountId, categoryId, subcategoryId, amount, type, date, title, importedWithOverride, overrideNote } = dto;

    let subId = subcategoryId && typeof subcategoryId === 'string' && subcategoryId.trim() !== '' ? subcategoryId.trim() : null;

    if (!subId) {
      const subRes = await query('SELECT id FROM subcategories WHERE category_id = $1 LIMIT 1', [categoryId]);
      if (subRes.rows.length > 0) {
        subId = subRes.rows[0].id;
      }
    }

    if (!subId) {
      const subRes = await query('SELECT id FROM subcategories LIMIT 1');
      if (subRes.rows.length > 0) {
        subId = subRes.rows[0].id;
      }
    }

    const txDate = date ? new Date(date) : new Date();

    const insertRes = await query(
      `INSERT INTO transactions (id, account_id, category_id, subcategory_id, amount, type, date, "Title", imported_with_override, override_note, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
       RETURNING id, account_id as "accountId", category_id as "categoryId", subcategory_id as "subcategoryId", amount, type, date, "Title" as title, imported_with_override as "importedWithOverride", override_note as "overrideNote", created_at as "createdAt", updated_at as "updatedAt"`,
      [accountId, categoryId, subId, amount, type, txDate, title, importedWithOverride ?? false, overrideNote ?? null]
    );

    const newTx = insertRes.rows[0];

    const balanceAdj = type === 'INCOME' ? amount : -amount;
    await query('UPDATE accounts SET balance = balance + $1 WHERE id = $2', [balanceAdj, accountId]);

    const detailsRes = await query(
      `SELECT
         json_build_object('id', a.id, 'name', a.name) as account,
         json_build_object('id', c.id, 'name', c.name, 'type', c.type, 'icon', c.icon, 'color', c.color) as category,
         CASE WHEN s.id IS NOT NULL THEN json_build_object('id', s.id, 'name', s.name) ELSE NULL END as subcategory
       FROM accounts a
       LEFT JOIN categories c ON c.id = $2
       LEFT JOIN subcategories s ON s.id = $3
       WHERE a.id = $1`,
      [accountId, categoryId, subId]
    );

    const rels = detailsRes.rows[0] || {};

    return {
      ...newTx,
      amount: Number(newTx.amount),
      date: newTx.date ? new Date(newTx.date).toISOString().split('T')[0] : '',
      account: rels.account,
      category: rels.category,
      subcategory: rels.subcategory,
    };
  }

  /**
   * Update existing transaction
   */
  async updateTransaction(userId: string, id: string, dto: UpdateTransactionDTO) {
    const existingRes = await query('SELECT * FROM transactions WHERE id = $1', [id]);
    if (existingRes.rows.length === 0) {
      throw new Error('TRANSACTION_NOT_FOUND');
    }

    const existing = existingRes.rows[0];
    const newAmount = dto.amount !== undefined ? dto.amount : Number(existing.amount);
    const newType = dto.type || existing.type;
    const newTitle = dto.title !== undefined ? dto.title : existing.Title;
    const newAccountId = dto.accountId || existing.account_id;
    const newCategoryId = dto.categoryId || existing.category_id;
    let subId = dto.subcategoryId && typeof dto.subcategoryId === 'string' && dto.subcategoryId.trim() !== '' ? dto.subcategoryId.trim() : existing.subcategory_id;
    if (!subId && newCategoryId) {
      const subRes = await query('SELECT id FROM subcategories WHERE category_id = $1 LIMIT 1', [newCategoryId]);
      if (subRes.rows.length > 0) {
        subId = subRes.rows[0].id;
      }
    }
    const newDate = dto.date ? new Date(dto.date) : existing.date;

    const updateRes = await query(
      `UPDATE transactions
       SET account_id = $1, category_id = $2, subcategory_id = $3, amount = $4, type = $5, date = $6, "Title" = $7, updated_at = NOW()
       WHERE id = $8
       RETURNING id, account_id as "accountId", category_id as "categoryId", subcategory_id as "subcategoryId", amount, type, date, "Title" as title, created_at as "createdAt", updated_at as "updatedAt"`,
      [newAccountId, newCategoryId, subId, newAmount, newType, newDate, newTitle, id]
    );

    const updatedTx = updateRes.rows[0];

    const detailsRes = await query(
      `SELECT
         json_build_object('id', a.id, 'name', a.name) as account,
         json_build_object('id', c.id, 'name', c.name, 'type', c.type, 'icon', c.icon, 'color', c.color) as category,
         CASE WHEN s.id IS NOT NULL THEN json_build_object('id', s.id, 'name', s.name) ELSE NULL END as subcategory
       FROM accounts a
       LEFT JOIN categories c ON c.id = $2
       LEFT JOIN subcategories s ON s.id = $3
       WHERE a.id = $1`,
      [newAccountId, newCategoryId, subId]
    );

    const rels = detailsRes.rows[0] || {};

    return {
      ...updatedTx,
      amount: Number(updatedTx.amount),
      date: updatedTx.date ? new Date(updatedTx.date).toISOString().split('T')[0] : '',
      account: rels.account,
      category: rels.category,
      subcategory: rels.subcategory,
    };
  }

  /**
   * Delete transaction
   */
  async deleteTransaction(userId: string, id: string) {
    const res = await query('DELETE FROM transactions WHERE id = $1 RETURNING id', [id]);
    if (res.rows.length === 0) {
      throw new Error('TRANSACTION_NOT_FOUND');
    }
    return { success: true, message: 'Transaction deleted successfully' };
  }

  /**
   * Summary of totals
   */
  async getTransactionSummary(userId: string): Promise<TransactionSummaryResponse> {
    const { rows } = await query(`
      SELECT
        type,
        SUM(amount) as total,
        COUNT(id) as count
      FROM transactions
      GROUP BY type
    `);

    let totalIncome = 0;
    let totalExpense = 0;
    let incomeCount = 0;
    let expenseCount = 0;

    for (const r of rows) {
      const sum = Number(r.total || 0);
      const cnt = Number(r.count || 0);
      if (r.type === 'INCOME') {
        totalIncome = sum;
        incomeCount = cnt;
      } else if (r.type === 'EXPENSE') {
        totalExpense = sum;
        expenseCount = cnt;
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
