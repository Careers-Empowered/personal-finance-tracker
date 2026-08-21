import { prisma } from "../infrastructure/postgres/prisma";

export const categoryRepository = {
  // =========================================
  // GET ALL CATEGORIES
  // =========================================

  findAll(userId: string) {
    return prisma.category.findMany({
      where: {
        OR: [
          {
            is_default: true,
          },
          {
            userId: userId,
          },
        ],
      },
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
          where: {
            OR: [
              {
                is_default: true,
              },
              {
                user_id: userId,
              },
            ],
          },
          orderBy: {
            name: "asc",
          },
        },
      },
    });
  },

  // =========================================
  // GET CATEGORY BY ID
  // =========================================

  findById(id: string) {
    return prisma.category.findUnique({
      where: {
        id,
      },
      include: {
        subcategories: {
          orderBy: {
            name: "asc",
          },
        },
      },
    });
  },

  // =========================================
  // CREATE CATEGORY
  // =========================================

  create(data: {
    userId: string;
    name: string;
    type: "INCOME" | "EXPENSE";
    icon?: string;
    color?: string;
    aliases?: string[];
  }) {
    return prisma.category.create({
      data: {
        userId: data.userId,
        name: data.name,
        type: data.type,
        icon: data.icon ?? null,
        color: data.color ?? null,
        aliases: data.aliases ?? [],
        is_default: false,
      },
      include: {
        subcategories: true,
      },
    });
  },

  // =========================================
  // UPDATE CATEGORY
  // =========================================

  updateCategory(
    id: string,
    data: {
      name: string;
      type: "INCOME" | "EXPENSE";
      icon?: string;
      color?: string;
      aliases?: string[];
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
        aliases: data.aliases ?? [],
      },
      include: {
        subcategories: true,
      },
    });
  },

  // =========================================
  // DELETE CATEGORY
  // =========================================

  deleteCategory(id: string) {
    return prisma.category.delete({
      where: {
        id,
      },
    });
  },

  // =========================================
  // CREATE SUBCATEGORY
  // =========================================

  createSubcategory(data: {
    userId: string;
    categoryId: string;
    name: string;
    icon?: string;
    aliases?: string[];
  }) {
    return prisma.subcategory.create({
      data: {
        categories: {
          connect: {
            id: data.categoryId,
          },
        },

        users: {
          connect: {
            id: data.userId,
          },
        },

        name: data.name,
        icon: data.icon ?? null,
        aliases: data.aliases ?? [],
        color: null,
        is_default: false,
      },
    });
  },

  // =========================================
  // UPDATE SUBCATEGORY
  // =========================================

  updateSubcategory(
    id: string,
    data: {
      name: string;
      icon?: string;
      aliases?: string[];
    },
  ) {
    return prisma.subcategory.update({
      where: {
        id,
      },
      data: {
        name: data.name,
        icon: data.icon ?? null,
        aliases: data.aliases ?? [],
      },
    });
  },

  // =========================================
  // DELETE SUBCATEGORY
  // =========================================

  deleteSubcategory(id: string) {
    return prisma.subcategory.delete({
      where: {
        id,
      },
    });
  },
};