import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import transactionsRouter from './api/transactions';

// Load environment variables from backend or root .env file
dotenv.config();
dotenv.config({ path: path.join(__dirname, '../../.env') });

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());

app.use('/api/transactions', transactionsRouter);

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    time: new Date(),
  });
});

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});