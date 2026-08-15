import { categoryRepository } from "../repositories/category.repository";

export const categoryService = {
  async getCategories() {
    return categoryRepository.findAll();
  },

  async getCategoryById(id: string) {
    return categoryRepository.findById(id);
  },

  async createCategory(data: {
    name: string;
    type: "INCOME" | "EXPENSE";
    icon?: string;
    color?: string;
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
      ...data,
      name: data.name.trim(),
    });
  },

  async updateCategory(
    id: string,
    data: {
      name: string;
      type: "INCOME" | "EXPENSE";
      icon?: string;
      color?: string;
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
        ...data,
        name: data.name.trim(),
      },
    );
  },

  async deleteCategory(id: string) {
    return categoryRepository.deleteCategory(id);
  },

  async createSubcategory(data: {
    categoryId: string;
    name: string;
    icon?: string;
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
      ...data,
      name: data.name.trim(),
    });
  },

  async updateSubcategory(
    id: string,
    data: {
      name: string;
      icon?: string;
    },
  ) {
    return categoryRepository.updateSubcategory(
      id,
      {
        ...data,
        name: data.name.trim(),
      },
    );
  },

  async deleteSubcategory(id: string) {
    return categoryRepository.deleteSubcategory(
      id,
    );
  },
};