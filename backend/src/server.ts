import express from "express";
import cors from "cors";

import dashboardRoutes from "./api/dashboard.routes";

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

app.use("/api/dashboard", dashboardRoutes);

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`Backend API running on http://localhost:${PORT}`);
});