import type {
  Category,
  Subcategory,
} from "../types/subcategory.types";

/**
 * Get all subcategories belonging to a specific category.
 */
export function getSubcategoriesByCategory(
  subcategories: Subcategory[],
  categoryId: string,
): Subcategory[] {
  return subcategories.filter(
    (subcategory) => subcategory.categoryId === categoryId,
  );
}

/**
 * Find a category by its ID.
 */
export function getCategoryById(
  categories: Category[],
  categoryId: string,
): Category | undefined {
  return categories.find(
    (category) => category.id === categoryId,
  );
}

/**
 * Find a subcategory by its ID.
 */
export function getSubcategoryById(
  subcategories: Subcategory[],
  subcategoryId: string,
): Subcategory | undefined {
  return subcategories.find(
    (subcategory) => subcategory.id === subcategoryId,
  );
}

/**
 * Check whether a subcategory name already exists
 * inside the selected category.
 */
export function isDuplicateSubcategory(
  subcategories: Subcategory[],
  name: string,
  categoryId: string,
  excludeSubcategoryId?: string,
): boolean {
  const normalizedName = name.trim().toLowerCase();

  return subcategories.some(
    (subcategory) =>
      subcategory.categoryId === categoryId &&
      subcategory.name.trim().toLowerCase() === normalizedName &&
      subcategory.id !== excludeSubcategoryId,
  );
}

/**
 * Generate a unique ID for a new subcategory.
 */
export function generateSubcategoryId(): string {
  return `sub-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}