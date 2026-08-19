import { categoryRepository } from "../repositories/category.repository";

function normalize(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s&-]/g, " ")
    .replace(/\s+/g, " ");
}

function scoreMatch(text: string, value: string): number {
  const normalizedText = normalize(text);
  const normalizedValue = normalize(value);

  if (!normalizedText || !normalizedValue) {
    return 0;
  }

  if (normalizedText === normalizedValue) {
    return 1;
  }

  if (normalizedText.includes(normalizedValue)) {
    return 0.9;
  }

  const words = normalizedValue.split(" ");

  const matchedWords = words.filter((word) =>
    normalizedText.includes(word),
  ).length;

  if (matchedWords === words.length) {
    return 0.85;
  }

  if (matchedWords > 0) {
    return 0.6;
  }

  return 0;
}

export const categoryMatcherService = {
  async matchCategory(
    description: string,
    type: "INCOME" | "EXPENSE",
  ) {
    const categories =
      await categoryRepository.findAll();

    const typedCategories = categories.filter(
      (category) => category.type === type,
    );

    let bestCategory:
      | (typeof typedCategories)[number]
      | null = null;

    let bestCategoryScore = 0;

    let bestSubcategory:
      | (typeof typedCategories)[number]["subcategories"][number]
      | null = null;

    let bestSubcategoryScore = 0;

    for (const category of typedCategories) {
      const categoryValues = [
        category.name,
        ...category.aliases,
      ];

      for (const value of categoryValues) {
        const score = scoreMatch(
          description,
          value,
        );

        if (score > bestCategoryScore) {
          bestCategoryScore = score;
          bestCategory = category;
        }
      }

      for (const subcategory of category.subcategories) {
        const subcategoryValues = [
          subcategory.name,
          ...subcategory.aliases,
        ];

        for (const value of subcategoryValues) {
          const score = scoreMatch(
            description,
            value,
          );

          if (score > bestSubcategoryScore) {
            bestSubcategoryScore = score;
            bestSubcategory = subcategory;
          }
        }
      }
    }

    if (
      bestSubcategory &&
      bestSubcategoryScore >= bestCategoryScore
    ) {
      const parentCategory =
        typedCategories.find(
          (category) =>
            category.id ===
            bestSubcategory!.categoryId,
        );

      return {
        categoryId:
          parentCategory?.id ?? null,
        categoryName:
          parentCategory?.name ?? null,
        subcategoryId: bestSubcategory.id,
        subcategoryName: bestSubcategory.name,
        confidence: bestSubcategoryScore,
      };
    }

    if (bestCategory) {
      return {
        categoryId: bestCategory.id,
        categoryName: bestCategory.name,
        subcategoryId: null,
        subcategoryName: null,
        confidence: bestCategoryScore,
      };
    }

    return {
      categoryId: null,
      categoryName: null,
      subcategoryId: null,
      subcategoryName: null,
      confidence: 0,
    };
  },
};