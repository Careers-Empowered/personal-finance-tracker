import type { Request, Response } from "express";
import { dashboardService } from "../application/dashboard.service";

export const dashboardController = {
  async getDashboard(
    req: Request,
    res: Response,
  ) {
    try {
      /*
       * For now we take userId from the request.
       * Once authentication middleware is connected,
       * this should come from the authenticated session.
       */
      const userId = req.query.userId;

      if (
        typeof userId !== "string" ||
        !userId
      ) {
        return res.status(400).json({
          message: "userId is required",
        });
      }

      const accountId =
        typeof req.query.accountId === "string"
          ? req.query.accountId
          : undefined;

      const startDate =
        typeof req.query.startDate === "string"
          ? req.query.startDate
          : undefined;

      const endDate =
        typeof req.query.endDate === "string"
          ? req.query.endDate
          : undefined;

      let parsedStartDate: Date | undefined;
      let parsedEndDate: Date | undefined;

      if (startDate) {
        parsedStartDate = new Date(
          `${startDate}T00:00:00`,
        );

        if (
          Number.isNaN(
            parsedStartDate.getTime(),
          )
        ) {
          return res.status(400).json({
            message: "Invalid startDate",
          });
        }
      }

      if (endDate) {
        parsedEndDate = new Date(
          `${endDate}T00:00:00`,
        );

        if (
          Number.isNaN(
            parsedEndDate.getTime(),
          )
        ) {
          return res.status(400).json({
            message: "Invalid endDate",
          });
        }

        // Make the selected end date inclusive
        parsedEndDate.setDate(
          parsedEndDate.getDate() + 1,
        );
      }

      if (
        parsedStartDate &&
        parsedEndDate &&
        parsedStartDate >= parsedEndDate
      ) {
        return res.status(400).json({
          message:
            "startDate must be before endDate",
        });
      }

      const dashboard =
        await dashboardService.getDashboard(
          userId,
          accountId,
          parsedStartDate,
          parsedEndDate,
        );

      return res.status(200).json(
        dashboard,
      );
    } catch (error) {
      if (
        error instanceof Error &&
        error.message ===
          "ACCOUNT_NOT_FOUND"
      ) {
        return res.status(404).json({
          message: "Account not found",
        });
      }

      console.error(
        "Failed to load dashboard:",
        error,
      );

      return res.status(500).json({
        message: "Failed to load dashboard",
      });
    }
  },

  async getTransactionsForDate(
    req: Request,
    res: Response,
  ) {
    try {
      const userId = req.query.userId;

      if (
        typeof userId !== "string" ||
        !userId
      ) {
        return res.status(400).json({
          message: "userId is required",
        });
      }

      const { date } = req.params;

      const parsedDate = new Date(
        `${date}T00:00:00`,
      );

      if (
        Number.isNaN(
          parsedDate.getTime(),
        )
      ) {
        return res.status(400).json({
          message: "Invalid date",
        });
      }

      const accountId =
        typeof req.query.accountId === "string"
          ? req.query.accountId
          : undefined;

      const transactions =
        await dashboardService.getTransactionsForDate(
          userId,
          parsedDate,
          accountId,
        );

      return res.status(200).json({
        date,
        transactions,
      });
    } catch (error) {
      console.error(
        "Failed to load transactions:",
        error,
      );

      return res.status(500).json({
        message:
          "Failed to load transactions",
      });
    }
  },
};