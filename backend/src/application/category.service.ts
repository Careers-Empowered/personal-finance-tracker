import { categoryRepository } from "../repositories/category.repository";

function normalizeAliases(aliases?: string[]): string[] {
  if (!Array.isArray(aliases)) {
    return [];
  }

  return [
    ...new Set(
      aliases
        .filter(
          (alias): alias is string =>
            typeof alias === "string",
        )
        .map((alias) =>
          alias.trim().toLowerCase(),
        )
        .filter(Boolean),
    ),
  ];
}

export const categoryService = {
  // =========================================
  // GET ALL CATEGORIES
  // =========================================

  async getCategories() {
    return categoryRepository.findAll();
  },

  // =========================================
  // GET CATEGORY BY ID
  // =========================================

  async getCategoryById(id: string) {
    return categoryRepository.findById(id);
  },

  // =========================================
  // CREATE CATEGORY
  // =========================================

  async createCategory(data: {
    name: string;
    type: "INCOME" | "EXPENSE";
    icon?: string;
    color?: string;
    aliases?: string[];
  }) {
    const normalizedName =
      data.name.trim().toLowerCase();

    const categories =
      await categoryRepository.findAll();

    const duplicate = categories.some(
      (category) =>
        category.type === data.type &&
        category.name.trim().toLowerCase() ===
          normalizedName,
    );

    if (duplicate) {
      throw new Error(
        "CATEGORY_ALREADY_EXISTS",
      );
    }

    return categoryRepository.create({
      name: data.name.trim(),
      type: data.type,
      icon: data.icon,
      color: data.color,
      aliases: normalizeAliases(
        data.aliases,
      ),
    });
  },

  // =========================================
  // UPDATE CATEGORY
  // =========================================

  async updateCategory(
    id: string,
    data: {
      name: string;
      type: "INCOME" | "EXPENSE";
      icon?: string;
      color?: string;
      aliases?: string[];
    },
  ) {
    const normalizedName =
      data.name.trim().toLowerCase();

    const categories =
      await categoryRepository.findAll();

    const duplicate = categories.some(
      (category) =>
        category.id !== id &&
        category.type === data.type &&
        category.name.trim().toLowerCase() ===
          normalizedName,
    );

    if (duplicate) {
      throw new Error(
        "CATEGORY_ALREADY_EXISTS",
      );
    }

    return categoryRepository.updateCategory(
      id,
      {
        name: data.name.trim(),
        type: data.type,
        icon: data.icon,
        color: data.color,
        aliases: normalizeAliases(
          data.aliases,
        ),
      },
    );
  },

  // =========================================
  // DELETE CATEGORY
  // =========================================

  async deleteCategory(id: string) {
    return categoryRepository.deleteCategory(
      id,
    );
  },

  // =========================================
  // CREATE SUBCATEGORY
  // =========================================

  async createSubcategory(data: {
    categoryId: string;
    name: string;
    icon?: string;
    aliases?: string[];
  }) {
    const normalizedName =
      data.name.trim().toLowerCase();

    const category =
      await categoryRepository.findById(
        data.categoryId,
      );

    if (!category) {
      throw new Error(
        "CATEGORY_NOT_FOUND",
      );
    }

    const duplicate =
      category.subcategories.some(
        (subcategory) =>
          subcategory.name
            .trim()
            .toLowerCase() ===
          normalizedName,
      );

    if (duplicate) {
      throw new Error(
        "SUBCATEGORY_ALREADY_EXISTS",
      );
    }

    return categoryRepository.createSubcategory({
      categoryId: data.categoryId,
      name: data.name.trim(),
      icon: data.icon,
      aliases: normalizeAliases(
        data.aliases,
      ),
    });
  },

  // =========================================
  // UPDATE SUBCATEGORY
  // =========================================

  async updateSubcategory(
    id: string,
    data: {
      name: string;
      icon?: string;
      aliases?: string[];
    },
  ) {
    return categoryRepository.updateSubcategory(
      id,
      {
        name: data.name.trim(),
        icon: data.icon,
        aliases: normalizeAliases(
          data.aliases,
        ),
      },
    );
  },

  // =========================================
  // DELETE SUBCATEGORY
  // =========================================

  async deleteSubcategory(id: string) {
    return categoryRepository.deleteSubcategory(
      id,
    );
  },
};