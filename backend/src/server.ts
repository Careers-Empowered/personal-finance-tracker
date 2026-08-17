import express from "express";
import cors from "cors";
import categoryRoutes from "./api/category.routes";
import categoryMatcherRoutes from "./api/category-matcher.routes";

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

app.use(
  "/api/categories",
  categoryRoutes,
);

app.use(
  "/api/category-matcher",
  categoryMatcherRoutes,
);

const PORT =
  Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(
    `Backend API running on http://localhost:${PORT}`,
  );
});