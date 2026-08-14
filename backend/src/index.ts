import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import transactionsRouter from './api/transactions';

// Load environment variables from the root .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

const app = express();
const port = process.env.PORT || 3001;

// CORS setup
app.use(cors({
  origin: 'http://localhost:3000', // React dev server default port
  credentials: true
}));

// Body parsing middleware
app.use(express.json());

// Routes configuration
app.use('/api/transactions', transactionsRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// Start listening
app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
