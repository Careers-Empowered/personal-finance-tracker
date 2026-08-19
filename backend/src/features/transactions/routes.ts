import { Router } from 'express';
import { authMiddleware } from '../../security/authMiddleware';
import { transactionsController } from './controller';

const router = Router();

// Apply authMiddleware to all routes
router.use(authMiddleware);

// Accounts & Categories Lookups
router.get('/accounts', (req, res) => transactionsController.getAccounts(req, res));
router.get('/categories', (req, res) => transactionsController.getCategories(req, res));
router.post('/categories', (req, res) => transactionsController.createCategory(req, res));
router.get('/subcategories', (req, res) => transactionsController.getSubcategories(req, res));
router.post('/subcategories', (req, res) => transactionsController.createSubcategory(req, res));

// Summary & Aggregates
router.get('/summary', (req, res) => transactionsController.getSummary(req, res));

// Transactions CRUD
router.get('/', (req, res) => transactionsController.getTransactions(req, res));
router.post('/', (req, res) => transactionsController.createTransaction(req, res));
router.put('/:id', (req, res) => transactionsController.updateTransaction(req, res));
router.delete('/:id', (req, res) => transactionsController.deleteTransaction(req, res));

export default router;
