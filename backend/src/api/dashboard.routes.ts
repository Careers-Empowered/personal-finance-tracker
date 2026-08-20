import { Router } from "express";
import { dashboardController } from "./dashboard.controller";

const dashboardRouter = Router();

dashboardRouter.get(
  "/",
  dashboardController.getDashboard,
);

dashboardRouter.get(
  "/date/:date",
  dashboardController.getTransactionsForDate,
);

export default dashboardRouter;