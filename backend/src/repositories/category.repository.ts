import { prisma } from "../infrastructure/postgres/prisma";

export const categoryRepository = {
  findAll() {
    return prisma.category.findMany({
      orderBy: [
        {
          type: "asc",
        },
        {
          name: "asc",
        },
      ],
      include: {
        subcategories: {
          orderBy: {
            name: "asc",
          },
        },
      },
    });
  },

  findById(id: string) {
    return prisma.category.findUnique({
      where: { id },
      include: {
        subcategories: {
          orderBy: {
            name: "asc",
          },
        },
      },
    });
  },

  create(data: {
    name: string;
    type: "INCOME" | "EXPENSE";
    icon?: string;
    color?: string;
  }) {
    return prisma.category.create({
      data: {
        name: data.name,
        type: data.type,
        icon: data.icon ?? null,
        color: data.color ?? null,
        isDefault: false,
      },
      include: {
        subcategories: true,
      },
    });
  },

  updateCategory(
    id: string,
    data: {
      name: string;
      type: "INCOME" | "EXPENSE";
      icon?: string;
      color?: string;
    },
  ) {
    return prisma.category.update({
      where: {
        id,
      },
      data: {
        name: data.name,
        type: data.type,
        icon: data.icon ?? null,
        color: data.color ?? null,
      },
      include: {
        subcategories: true,
      },
    });
  },

  deleteCategory(id: string) {
    return prisma.category.delete({
      where: {
        id,
      },
    });
  },

  createSubcategory(data: {
    categoryId: string;
    name: string;
    icon?: string;
  }) {
    return prisma.subcategory.create({
      data: {
        categoryId: data.categoryId,
        name: data.name,
        icon: data.icon ?? null,
        userId: null,
        color: null,
        isDefault: false,
      },
    });
  },

  updateSubcategory(
    id: string,
    data: {
      name: string;
      icon?: string;
    },
  ) {
    return prisma.subcategory.update({
      where: {
        id,
      },
      data: {
        name: data.name,
        icon: data.icon ?? null,
      },
    });
  },

  deleteSubcategory(id: string) {
    return prisma.subcategory.delete({
      where: {
        id,
      },
    });
  },
};