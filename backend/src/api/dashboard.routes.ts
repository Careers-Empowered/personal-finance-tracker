import { Router } from "express";

import { dashboardController } from "./dashboard.controller";
import { authMiddleware } from "../security/auth.middleware";

const dashboardRouter = Router();

dashboardRouter.get(
  "/",
  authMiddleware,
  dashboardController.getDashboard,
);

dashboardRouter.get(
  "/date/:date",
  authMiddleware,
  dashboardController.getTransactionsForDate,
);

export default dashboardRouter;