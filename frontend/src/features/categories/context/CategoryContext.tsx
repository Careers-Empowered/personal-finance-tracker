import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import axios from "axios";

import type { Category } from "../category-create/categoryTypes";
import { DEFAULT_CATEGORIES } from "../category-create/categoryData";

import type { Subcategory } from "../subcategories/types/subcategory.types";
import { mockSubcategories } from "../subcategories/data/subcategory.mock";

interface CategoryContextValue {
  categories: Category[];
  subcategories: Subcategory[];

  setCategories: React.Dispatch<
    React.SetStateAction<Category[]>
  >;

  setSubcategories: React.Dispatch<
    React.SetStateAction<Subcategory[]>
  >;

  addCategory: (category: Category) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (categoryId: string) => void;

  addSubcategory: (subcategory: Subcategory) => void;
  updateSubcategory: (subcategory: Subcategory) => void;
  deleteSubcategory: (subcategoryId: string) => void;

  loading: boolean;
  error: string | null;
}

const CategoryContext =
  createContext<CategoryContextValue | undefined>(
    undefined,
  );

interface CategoryProviderProps {
  children: React.ReactNode;
}

interface ApiSubcategory {
  id: string;
  categoryId: string;
  name: string;
  icon: string | null;
  color: string | null;
  isDefault: boolean;
}

interface ApiCategory {
  id: string;
  userId: string | null;
  name: string;
  type: "INCOME" | "EXPENSE";
  icon: string | null;
  color: string | null;
  isDefault: boolean;
  subcategories: ApiSubcategory[];
}

export const CategoryProvider: React.FC<
  CategoryProviderProps
> = ({ children }) => {
  const [categories, setCategories] =
    useState<Category[]>([]);

  const [subcategories, setSubcategories] =
    useState<Subcategory[]>([]);

  const [loading, setLoading] =
    useState<boolean>(true);

  const [error, setError] =
    useState<string | null>(null);

  /*
   * Load categories and subcategories
   * from the backend when the application starts.
   */
  useEffect(() => {
    let cancelled = false;

    const loadCategories = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          "http://localhost:3000/api/categories",
        );

        const apiCategories =
          response.data.data as ApiCategory[];

        if (cancelled) {
          return;
        }

        /*
         * Convert backend category format:
         *
         * INCOME  -> income
         * EXPENSE -> expense
         */
        const mappedCategories: Category[] =
          apiCategories.map((category) => ({
            id: category.id,
            name: category.name,
            type:
              category.type === "INCOME"
                ? "income"
                : "expense",
            icon: category.icon ?? "",
            color: category.color ?? "",
            isCustom: !category.isDefault,
          }));

        /*
         * The backend currently does not expose
         * createdAt / updatedAt for subcategories.
         *
         * The frontend type requires them, so we
         * provide timestamps when mapping API data.
         */
        const now =
          new Date().toISOString();

        const mappedSubcategories: Subcategory[] =
          apiCategories.flatMap(
            (category) =>
              category.subcategories.map(
                (subcategory) => ({
                  id: subcategory.id,
                  name: subcategory.name,
                  categoryId:
                    subcategory.categoryId,
                  icon:
                    subcategory.icon ?? "",
                  createdAt: now,
                  updatedAt: now,
                }),
              ),
          );

        setCategories(mappedCategories);
        setSubcategories(
          mappedSubcategories,
        );
      } catch (requestError) {
        console.error(
          "Failed to load categories:",
          requestError,
        );

        if (cancelled) {
          return;
        }

        /*
         * Keep the application usable if the
         * backend is temporarily unavailable.
         */
        setCategories(DEFAULT_CATEGORIES);
        setSubcategories(mockSubcategories);

        setError(
          "Unable to load categories from the server.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * CATEGORY OPERATIONS
   */

  const addCategory = (
    category: Category,
  ) => {
    setCategories((current) => [
      ...current,
      category,
    ]);
  };

  const updateCategory = (
    category: Category,
  ) => {
    setCategories((current) =>
      current.map((item) =>
        item.id === category.id
          ? category
          : item,
      ),
    );
  };

  const deleteCategory = (
    categoryId: string,
  ) => {
    setCategories((current) =>
      current.filter(
        (category) =>
          category.id !== categoryId,
      ),
    );

    /*
     * Remove all subcategories belonging
     * to the deleted category from local state.
     */
    setSubcategories((current) =>
      current.filter(
        (subcategory) =>
          subcategory.categoryId !==
          categoryId,
      ),
    );
  };

  /*
   * SUBCATEGORY OPERATIONS
   */

  const addSubcategory = (
    subcategory: Subcategory,
  ) => {
    setSubcategories((current) => [
      ...current,
      subcategory,
    ]);
  };

  const updateSubcategory = (
    subcategory: Subcategory,
  ) => {
    setSubcategories((current) =>
      current.map((item) =>
        item.id === subcategory.id
          ? subcategory
          : item,
      ),
    );
  };

  const deleteSubcategory = (
    subcategoryId: string,
  ) => {
    setSubcategories((current) =>
      current.filter(
        (subcategory) =>
          subcategory.id !==
          subcategoryId,
      ),
    );
  };

  const value = useMemo(
    () => ({
      categories,
      subcategories,

      setCategories,
      setSubcategories,

      addCategory,
      updateCategory,
      deleteCategory,

      addSubcategory,
      updateSubcategory,
      deleteSubcategory,

      loading,
      error,
    }),
    [
      categories,
      subcategories,
      loading,
      error,
    ],
  );

  return (
    <CategoryContext.Provider
      value={value}
    >
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategories =
  (): CategoryContextValue => {
    const context =
      useContext(CategoryContext);

    if (!context) {
      throw new Error(
        "useCategories must be used inside CategoryProvider",
      );
    }

    return context;
  };