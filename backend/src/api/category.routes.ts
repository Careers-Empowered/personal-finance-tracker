import { Router } from "express";

import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
} from "./category.controller";

const router = Router();

router.get("/", getCategories);

router.post("/", createCategory);

router.put("/:id", updateCategory);

router.delete("/:id", deleteCategory);

router.post(
  "/:id/subcategories",
  createSubcategory,
);

router.put(
  "/subcategories/:id",
  updateSubcategory,
);

router.delete(
  "/subcategories/:id",
  deleteSubcategory,
);

router.get("/:id", getCategoryById);

export default router;