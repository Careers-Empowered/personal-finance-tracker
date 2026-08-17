import type { Request, Response } from "express";
import { categoryMatcherService } from "../application/category-matcher.service";

export async function matchCategory(
  req: Request,
  res: Response,
) {
  try {
    const {
      description,
      type,
    } = req.body;

    if (
      typeof description !== "string" ||
      !description.trim()
    ) {
      res.status(400).json({
        error: "Description is required",
      });
      return;
    }

    if (
      type !== "INCOME" &&
      type !== "EXPENSE"
    ) {
      res.status(400).json({
        error:
          "Type must be INCOME or EXPENSE",
      });
      return;
    }

    const result =
      await categoryMatcherService.matchCategory(
        description,
        type,
      );

    res.status(200).json({
      data: result,
    });
  } catch (error) {
    console.error(
      "Failed to match category:",
      error,
    );

    res.status(500).json({
      error: "Failed to match category",
    });
  }
}