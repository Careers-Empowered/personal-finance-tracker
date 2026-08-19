import express from "express";
import cors from "cors";

import categoryRoutes from "./api/category.routes";
import accountRoutes from "./api/account.routes";
import transactionsRouter from "./api/transactions";
import { prisma } from "./infrastructure/postgres/prisma";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
  });
});

app.use("/api/categories", categoryRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/transactions", transactionsRouter);

const PORT = Number(process.env.PORT) || 3000;

async function bootstrap() {
  try {
    // Ensure dummy user exists for accounts
    const DUMMY_USER_ID = "9a1b181c-d789-4d6b-873f-c12140a32456";
    await prisma.user.upsert({
      where: { id: DUMMY_USER_ID },
      update: {},
      create: {
        id: DUMMY_USER_ID,
        email: "dummy@finance.local",
        passwordHash: "dummy",
      }
    });

    app.listen(PORT, () => {
      console.log(`Backend API running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

bootstrap();