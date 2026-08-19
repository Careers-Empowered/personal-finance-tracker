import type { Request, Response } from "express";
import { categoryService } from "../application/category.service";

function getAliases(
  value: unknown,
): string[] | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!Array.isArray(value)) {
    return undefined;
  }

  return value.filter(
    (alias): alias is string =>
      typeof alias === "string",
  );
}

// =========================================
// GET ALL CATEGORIES
// =========================================

export async function getCategories(
  _req: Request,
  res: Response,
) {
  try {
    const categories =
      await categoryService.getCategories();

    res.status(200).json({
      data: categories,
    });
  } catch (error) {
    console.error(
      "Failed to fetch categories:",
      error,
    );

    res.status(500).json({
      error: "Failed to fetch categories",
    });
  }
}

// =========================================
// GET CATEGORY BY ID
// =========================================

export async function getCategoryById(
  req: Request,
  res: Response,
) {
  try {
    const { id } = req.params;

    if (typeof id !== "string") {
      res.status(400).json({
        error: "Invalid category ID",
      });
      return;
    }

    const category =
      await categoryService.getCategoryById(id);

    if (!category) {
      res.status(404).json({
        error: "Category not found",
      });
      return;
    }

    res.status(200).json({
      data: category,
    });
  } catch (error) {
    console.error(
      "Failed to fetch category:",
      error,
    );

    res.status(500).json({
      error: "Failed to fetch category",
    });
  }
}

// =========================================
// CREATE CATEGORY
// =========================================

export async function createCategory(
  req: Request,
  res: Response,
) {
  try {
    const {
      name,
      type,
      icon,
      color,
      aliases,
    } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim()
    ) {
      res.status(400).json({
        error: "Category name is required",
      });
      return;
    }

    if (
      type !== "INCOME" &&
      type !== "EXPENSE"
    ) {
      res.status(400).json({
        error:
          "Category type must be INCOME or EXPENSE",
      });
      return;
    }

    if (
      aliases !== undefined &&
      !Array.isArray(aliases)
    ) {
      res.status(400).json({
        error: "Aliases must be an array",
      });
      return;
    }

    const category =
      await categoryService.createCategory({
        name: name.trim(),
        type,
        icon,
        color,
        aliases: getAliases(aliases),
      });

    res.status(201).json({
      data: category,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "CATEGORY_ALREADY_EXISTS"
    ) {
      res.status(409).json({
        error:
          "A category with this name and type already exists",
      });
      return;
    }

    console.error(
      "Failed to create category:",
      error,
    );

    res.status(500).json({
      error: "Failed to create category",
    });
  }
}

// =========================================
// UPDATE CATEGORY
// =========================================

export async function updateCategory(
  req: Request,
  res: Response,
) {
  try {
    const { id } = req.params;

    const {
      name,
      type,
      icon,
      color,
      aliases,
    } = req.body;

    if (typeof id !== "string") {
      res.status(400).json({
        error: "Invalid category ID",
      });
      return;
    }

    if (
      typeof name !== "string" ||
      !name.trim()
    ) {
      res.status(400).json({
        error: "Category name is required",
      });
      return;
    }

    if (
      type !== "INCOME" &&
      type !== "EXPENSE"
    ) {
      res.status(400).json({
        error:
          "Category type must be INCOME or EXPENSE",
      });
      return;
    }

    if (
      aliases !== undefined &&
      !Array.isArray(aliases)
    ) {
      res.status(400).json({
        error: "Aliases must be an array",
      });
      return;
    }

    const existingCategory =
      await categoryService.getCategoryById(id);

    if (!existingCategory) {
      res.status(404).json({
        error: "Category not found",
      });
      return;
    }

    const category =
      await categoryService.updateCategory(
        id,
        {
          name: name.trim(),
          type,
          icon,
          color,
          aliases: getAliases(aliases),
        },
      );

    res.status(200).json({
      data: category,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "CATEGORY_ALREADY_EXISTS"
    ) {
      res.status(409).json({
        error:
          "A category with this name and type already exists",
      });
      return;
    }

    console.error(
      "Failed to update category:",
      error,
    );

    res.status(500).json({
      error: "Failed to update category",
    });
  }
}

// =========================================
// DELETE CATEGORY
// =========================================

export async function deleteCategory(
  req: Request,
  res: Response,
) {
  try {
    const { id } = req.params;

    if (typeof id !== "string") {
      res.status(400).json({
        error: "Invalid category ID",
      });
      return;
    }

    const existingCategory =
      await categoryService.getCategoryById(id);

    if (!existingCategory) {
      res.status(404).json({
        error: "Category not found",
      });
      return;
    }

    const deletedCategory =
      await categoryService.deleteCategory(id);

    res.status(200).json({
      data: deletedCategory,
    });
  } catch (error) {
    console.error(
      "Failed to delete category:",
      error,
    );

    res.status(500).json({
      error: "Failed to delete category",
    });
  }
}

// =========================================
// CREATE SUBCATEGORY
// =========================================

export async function createSubcategory(
  req: Request,
  res: Response,
) {
  try {
    const {
      id: categoryId,
    } = req.params;

    const {
      name,
      icon,
      aliases,
    } = req.body;

    if (typeof categoryId !== "string") {
      res.status(400).json({
        error: "Invalid category ID",
      });
      return;
    }

    if (
      typeof name !== "string" ||
      !name.trim()
    ) {
      res.status(400).json({
        error:
          "Subcategory name is required",
      });
      return;
    }

    if (
      aliases !== undefined &&
      !Array.isArray(aliases)
    ) {
      res.status(400).json({
        error: "Aliases must be an array",
      });
      return;
    }

    const category =
      await categoryService.getCategoryById(
        categoryId,
      );

    if (!category) {
      res.status(404).json({
        error: "Category not found",
      });
      return;
    }

    const subcategory =
      await categoryService.createSubcategory({
        categoryId,
        name: name.trim(),
        icon,
        aliases: getAliases(aliases),
      });

    res.status(201).json({
      data: subcategory,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "SUBCATEGORY_ALREADY_EXISTS"
    ) {
      res.status(409).json({
        error:
          "A subcategory with this name already exists in this category",
      });
      return;
    }

    console.error(
      "Failed to create subcategory:",
      error,
    );

    res.status(500).json({
      error: "Failed to create subcategory",
    });
  }
}

// =========================================
// UPDATE SUBCATEGORY
// =========================================

export async function updateSubcategory(
  req: Request,
  res: Response,
) {
  try {
    const {
      id: subcategoryId,
    } = req.params;

    const {
      name,
      icon,
      aliases,
    } = req.body;

    if (
      typeof subcategoryId !== "string"
    ) {
      res.status(400).json({
        error: "Invalid subcategory ID",
      });
      return;
    }

    if (
      typeof name !== "string" ||
      !name.trim()
    ) {
      res.status(400).json({
        error:
          "Subcategory name is required",
      });
      return;
    }

    if (
      aliases !== undefined &&
      !Array.isArray(aliases)
    ) {
      res.status(400).json({
        error: "Aliases must be an array",
      });
      return;
    }

    const subcategory =
      await categoryService.updateSubcategory(
        subcategoryId,
        {
          name: name.trim(),
          icon,
          aliases: getAliases(aliases),
        },
      );

    res.status(200).json({
      data: subcategory,
    });
  } catch (error) {
    console.error(
      "Failed to update subcategory:",
      error,
    );

    res.status(404).json({
      error: "Subcategory not found",
    });
  }
}

// =========================================
// DELETE SUBCATEGORY
// =========================================

export async function deleteSubcategory(
  req: Request,
  res: Response,
) {
  try {
    const {
      id: subcategoryId,
    } = req.params;

    if (
      typeof subcategoryId !== "string"
    ) {
      res.status(400).json({
        error: "Invalid subcategory ID",
      });
      return;
    }

    const deletedSubcategory =
      await categoryService.deleteSubcategory(
        subcategoryId,
      );

    res.status(200).json({
      data: deletedSubcategory,
    });
  } catch (error) {
    console.error(
      "Failed to delete subcategory:",
      error,
    );

    res.status(404).json({
      error: "Subcategory not found",
    });
  }
}