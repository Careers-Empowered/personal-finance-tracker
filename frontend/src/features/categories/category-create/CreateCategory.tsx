import {
  type FormEvent,
  type MouseEvent,
  useMemo,
  useState,
} from "react";

import axios from "axios";

import EditCategory from "../category-edit/EditCategory";
import DeleteCategory from "../category-delete/DeleteCategory";

import type { Subcategory } from "../subcategories/types/subcategory.types";
import { isDuplicateSubcategory } from "../subcategories/utils/subcategory.utils";

import {
  CATEGORY_COLORS,
  CATEGORY_ICONS,
} from "./categoryData";

import type {
  Category,
  CategoryType,
  CreateCategoryFormData,
  CreateCategoryProps,
} from "./categoryTypes";
import { downloadCategoryPdf } from "../utils/categoryPdf";

import { useCategories } from "../context/CategoryContext";

import "./CreateCategory.css";

/* =========================================
   SUBCATEGORY ICONS
   ========================================= */

const SUBCATEGORY_ICONS = [
  "🍽️",
  "🍔",
  "🍟",
  "☕",
  "🥡",
  "🚗",
  "🚌",
  "🚕",
  "🅿️",
  "🏠",
  "🔧",
  "🛠️",
  "🧹",
  "👕",
  "📱",
  "🎒",
  "👨‍⚕️",
  "💊",
  "💉",
  "🏥",
  "🎬",
  "🎮",
  "🎨",
  "💼",
  "🎁",
  "⏰",
  "💰",
  "📈",
  "📊",
  "📦",
];

/* =========================================
   SUBCATEGORY FORM TYPE
   ========================================= */

interface SubcategoryFormData {
  name: string;
  icon: string;
}

const DEFAULT_SUBCATEGORY_FORM: SubcategoryFormData = {
  name: "",
  icon: SUBCATEGORY_ICONS[0],
};

/* =========================================
   COMPONENT
   ========================================= */

const CreateCategory = ({
  onCategoryCreate,
}: CreateCategoryProps) => {
  /* =========================================
     SHARED CATEGORY / SUBCATEGORY STATE
     ========================================= */

  const {
    categories,
    setCategories,
    subcategories,
    setSubcategories,
  } = useCategories();

  /* =========================================
     CATEGORY FORM STATE
     ========================================= */

  const [categoryName, setCategoryName] =
    useState("");

  const [categoryType, setCategoryType] =
    useState<CategoryType>("expense");

  const [selectedIcon, setSelectedIcon] =
    useState(CATEGORY_ICONS[0]);

  const [selectedColor, setSelectedColor] =
    useState(CATEGORY_COLORS[0]);

  const [activeType, setActiveType] =
    useState<CategoryType>("expense");

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const [isFormOpen, setIsFormOpen] =
    useState(false);

  const [editingCategory, setEditingCategory] =
    useState<Category | null>(null);

  const [deletingCategory, setDeletingCategory] =
    useState<Category | null>(null);

  /* =========================================
     SUBCATEGORY UI STATE
     ========================================= */

  const [selectedCategoryId, setSelectedCategoryId] =
    useState<string | null>(null);

  const [selectedSubcategoryId, setSelectedSubcategoryId] =
    useState<string | null>(null);

  const [isSubcategoryFormOpen, setIsSubcategoryFormOpen] =
    useState(false);

  const [editingSubcategory, setEditingSubcategory] =
    useState<Subcategory | null>(null);

  const [subcategoryForm, setSubcategoryForm] =
    useState<SubcategoryFormData>(
      DEFAULT_SUBCATEGORY_FORM,
    );

  const [subcategoryError, setSubcategoryError] =
    useState("");

  /* =========================================
     VISIBLE CATEGORIES
     ========================================= */

  const visibleCategories = useMemo(() => {
    return categories.filter(
      (category) => category.type === activeType,
    );
  }, [categories, activeType]);

  /* =========================================
     SELECTED CATEGORY SUBCATEGORIES
     ========================================= */

  const selectedSubcategories = useMemo(() => {
    if (!selectedCategoryId) {
      return [];
    }

    return subcategories.filter(
      (subcategory) =>
        subcategory.categoryId ===
        selectedCategoryId,
    );
  }, [subcategories, selectedCategoryId]);

  /* =========================================
     SELECTED SUBCATEGORY
     ========================================= */

  const selectedSubcategory = useMemo(() => {
    if (!selectedSubcategoryId) {
      return null;
    }

    return (
      subcategories.find(
        (subcategory) =>
          subcategory.id ===
          selectedSubcategoryId,
      ) ?? null
    );
  }, [
    subcategories,
    selectedSubcategoryId,
  ]);

  /* =========================================
     CATEGORY FORM
     ========================================= */

  const resetForm = () => {
    setCategoryName("");
    setCategoryType("expense");
    setSelectedIcon(CATEGORY_ICONS[0]);
    setSelectedColor(CATEGORY_COLORS[0]);
    setErrorMessage("");
  };

  const handleOpenForm = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    resetForm();
    setIsFormOpen(false);
  };

  const handleCategoryNameChange = (
    value: string,
  ) => {
    setCategoryName(value);

    if (errorMessage) {
      setErrorMessage("");
    }

    if (successMessage) {
      setSuccessMessage("");
    }
  };

  /* =========================================
     CATEGORY DUPLICATE CHECK
     ========================================= */

  const isDuplicateCategory = (
    name: string,
    type: CategoryType,
    currentCategoryId?: string,
  ): boolean => {
    const normalizedName = name
      .trim()
      .toLowerCase();

    return categories.some(
      (category) =>
        category.id !== currentCategoryId &&
        category.type === type &&
        category.name
          .trim()
          .toLowerCase() === normalizedName,
    );
  };

 

  /* =========================================
     CREATE CATEGORY
     ========================================= */
const handleSubmit = async (
  event: FormEvent<HTMLFormElement>,
) => {
  event.preventDefault();

  const trimmedName = categoryName.trim();

  if (!trimmedName) {
    setErrorMessage(
      "Please enter a category name.",
    );
    return;
  }

  if (
    isDuplicateCategory(
      trimmedName,
      categoryType,
    )
  ) {
    setErrorMessage(
      "This category already exists.",
    );
    return;
  }

  try {
    const response = await axios.post(
      "http://localhost:3000/api/categories",
      {
        name: trimmedName,
        type:
          categoryType === "income"
            ? "INCOME"
            : "EXPENSE",
        icon: selectedIcon,
        color: selectedColor,
      },
    );

    const savedCategory = response.data.data;

    const newCategory: Category = {
      id: savedCategory.id,
      name: savedCategory.name,
      type:
        savedCategory.type === "INCOME"
          ? "income"
          : "expense",
      icon: savedCategory.icon ?? selectedIcon,
      color: savedCategory.color ?? selectedColor,
      isCustom: true,
    };

    setCategories((currentCategories) => [
      ...currentCategories,
      newCategory,
    ]);

    onCategoryCreate?.(newCategory);

    setActiveType(categoryType);
    setSelectedCategoryId(null);
    setSelectedSubcategoryId(null);

    setSuccessMessage(
      `"${trimmedName}" category created successfully.`,
    );

    handleCloseForm();
  } catch (error) {
    console.error(
      "Failed to create category:",
      error,
    );

    setErrorMessage(
      "Failed to create category. Please try again.",
    );
  }
};
  


   

  

  /* =========================================
     EDIT CATEGORY
     ========================================= */

  const handleEditCategory = async (
  category: Category,
  formData: CreateCategoryFormData,
) => {
  const trimmedName = formData.name.trim();

  if (!trimmedName) {
    return;
  }

  if (
    isDuplicateCategory(
      trimmedName,
      formData.type,
      category.id,
    )
  ) {
    setSuccessMessage(
      "Another category with this name already exists.",
    );

    setEditingCategory(null);
    return;
  }

  try {
    const response = await axios.put(
      `http://localhost:3000/api/categories/${category.id}`,
      {
        name: trimmedName,
        type:
          formData.type === "income"
            ? "INCOME"
            : "EXPENSE",
        icon: formData.icon,
        color: formData.color,
      },
    );

    const savedCategory =
      response.data.data;

    const updatedCategory: Category = {
      ...category,
      id: savedCategory.id,
      name: savedCategory.name,
      type:
        savedCategory.type === "INCOME"
          ? "income"
          : "expense",
      icon:
        savedCategory.icon ??
        formData.icon,
      color:
        savedCategory.color ??
        formData.color,
      isCustom: !savedCategory.isDefault,
    };

    setCategories(
      (currentCategories) =>
        currentCategories.map(
          (currentCategory) =>
            currentCategory.id ===
            category.id
              ? updatedCategory
              : currentCategory,
        ),
    );

    setActiveType(formData.type);

    setSuccessMessage(
      `"${trimmedName}" category updated successfully.`,
    );

    setEditingCategory(null);
  } catch (error) {
    console.error(
      "Failed to update category:",
      error,
    );

    setErrorMessage(
      "Failed to update category. Please try again.",
    );
  }
};

  /* =========================================
     DELETE CATEGORY
     ========================================= */

 const handleDeleteCategory = async (
  categoryId: string,
) => {
  const categoryToDelete =
    categories.find(
      (category) =>
        category.id === categoryId,
    );

  if (!categoryToDelete) {
    return;
  }

  try {
    await axios.delete(
      `http://localhost:3000/api/categories/${categoryId}`,
    );

    setCategories(
      (currentCategories) =>
        currentCategories.filter(
          (category) =>
            category.id !== categoryId,
        ),
    );

    setSubcategories(
      (currentSubcategories) =>
        currentSubcategories.filter(
          (subcategory) =>
            subcategory.categoryId !==
            categoryId,
        ),
    );

    if (
      selectedCategoryId === categoryId
    ) {
      setSelectedCategoryId(null);
      setSelectedSubcategoryId(null);
    }

    setSuccessMessage(
      `"${categoryToDelete.name}" category deleted successfully.`,
    );

    setDeletingCategory(null);
  } catch (error) {
    console.error(
      "Failed to delete category:",
      error,
    );

    setErrorMessage(
      "Failed to delete category. Please try again.",
    );
  }
};

  /* =========================================
     CATEGORY CLICK
     ========================================= */

  const handleCategoryClick = (
    categoryId: string,
  ) => {
    setSelectedSubcategoryId(null);

    setSelectedCategoryId((currentId) =>
      currentId === categoryId
        ? null
        : categoryId,
    );
  };

  /* =========================================
     SUBCATEGORY CLICK
     ========================================= */

  const handleSubcategoryClick = (
    event: MouseEvent<HTMLDivElement>,
    subcategoryId: string,
  ) => {
    event.stopPropagation();

    setSelectedSubcategoryId((currentId) =>
      currentId === subcategoryId
        ? null
        : subcategoryId,
    );
  };

  /* =========================================
     OPEN ADD SUBCATEGORY
     ========================================= */

  const handleOpenAddSubcategory = (
    event?: MouseEvent<HTMLButtonElement>,
  ) => {
    event?.stopPropagation();

    if (!selectedCategoryId) {
      return;
    }

    setEditingSubcategory(null);

    setSubcategoryForm({
      ...DEFAULT_SUBCATEGORY_FORM,
    });

    setSubcategoryError("");
    setIsSubcategoryFormOpen(true);
  };

  /* =========================================
     OPEN EDIT SUBCATEGORY
     ========================================= */

  const handleOpenEditSubcategory = (
    event: MouseEvent<HTMLButtonElement>,
    subcategory: Subcategory,
  ) => {
    event.stopPropagation();

    setEditingSubcategory(subcategory);

    setSubcategoryForm({
      name: subcategory.name,
      icon:
        subcategory.icon ||
        SUBCATEGORY_ICONS[0],
    });

    setSubcategoryError("");
    setIsSubcategoryFormOpen(true);
  };

  /* =========================================
     CLOSE SUBCATEGORY FORM
     ========================================= */

  const handleCloseSubcategoryForm = () => {
    setIsSubcategoryFormOpen(false);
    setEditingSubcategory(null);

    setSubcategoryForm({
      ...DEFAULT_SUBCATEGORY_FORM,
    });

    setSubcategoryError("");
  };

  /* =========================================
     SUBCATEGORY NAME CHANGE
     ========================================= */

  const handleSubcategoryNameChange = (
    value: string,
  ) => {
    setSubcategoryForm((currentForm) => ({
      ...currentForm,
      name: value,
    }));

    if (subcategoryError) {
      setSubcategoryError("");
    }
  };

  /* =========================================
     SUBCATEGORY ICON CHANGE
     ========================================= */

  const handleSubcategoryIconChange = (
    icon: string,
  ) => {
    setSubcategoryForm((currentForm) => ({
      ...currentForm,
      icon,
    }));

    if (subcategoryError) {
      setSubcategoryError("");
    }
  };

  /* =========================================
   SAVE SUBCATEGORY
   ========================================= */

const handleSaveSubcategory = async (
  event: FormEvent<HTMLFormElement>,
) => {
  event.preventDefault();

  if (!selectedCategoryId) {
    setSubcategoryError(
      "Please select a category first.",
    );
    return;
  }

  const trimmedName =
    subcategoryForm.name.trim();

  if (!trimmedName) {
    setSubcategoryError(
      "Subcategory name is required.",
    );
    return;
  }

  if (!subcategoryForm.icon) {
    setSubcategoryError(
      "Please select an icon.",
    );
    return;
  }

  const duplicate =
    isDuplicateSubcategory(
      subcategories,
      trimmedName,
      selectedCategoryId,
      editingSubcategory?.id,
    );

  if (duplicate) {
    setSubcategoryError(
      "A subcategory with this name already exists in this category.",
    );
    return;
  }

  const now = new Date().toISOString();

   if (editingSubcategory) {
    try {
      const response = await axios.put(
        `http://localhost:3000/api/categories/subcategories/${editingSubcategory.id}`,
        {
          name: trimmedName,
          icon: subcategoryForm.icon,
        },
      );

      const savedSubcategory =
        response.data.data;

      const updatedSubcategory: Subcategory = {
        ...editingSubcategory,
        id: savedSubcategory.id,
        name: savedSubcategory.name,
        categoryId:
          savedSubcategory.categoryId,
        icon:
          savedSubcategory.icon ??
          subcategoryForm.icon,
        updatedAt: now,
      };

      setSubcategories(
        (currentSubcategories) =>
          currentSubcategories.map(
            (subcategory) =>
              subcategory.id ===
              editingSubcategory.id
                ? updatedSubcategory
                : subcategory,
          ),
      );

      setSelectedSubcategoryId(
        editingSubcategory.id,
      );

      setSuccessMessage(
        `"${trimmedName}" subcategory updated successfully.`,
      );
    } catch (error) {
      console.error(
        "Failed to update subcategory:",
        error,
      );

      setSubcategoryError(
        "Failed to update subcategory. Please try again.",
      );

      return;
    }
  } 
 else {
    try {
      const response = await axios.post(
        `http://localhost:3000/api/categories/${selectedCategoryId}/subcategories`,
        {
          name: trimmedName,
          icon: subcategoryForm.icon,
        },
      );

      const savedSubcategory =
        response.data.data;

      const newSubcategory: Subcategory = {
        id: savedSubcategory.id,
        name: savedSubcategory.name,
        categoryId:
          savedSubcategory.categoryId,
        icon:
          savedSubcategory.icon ??
          subcategoryForm.icon,
        createdAt: now,
        updatedAt: now,
      };

      setSubcategories(
        (currentSubcategories) => [
          ...currentSubcategories,
          newSubcategory,
        ],
      );

      setSelectedSubcategoryId(
        newSubcategory.id,
      );

      setSuccessMessage(
        `"${trimmedName}" subcategory added successfully.`,
      );
    } catch (error) {
      console.error(
        "Failed to create subcategory:",
        error,
      );

      setSubcategoryError(
        "Failed to create subcategory. Please try again.",
      );

      return;
    }
  }

  handleCloseSubcategoryForm();
};
  /* =========================================
     DELETE SUBCATEGORY
     ========================================= */

  const handleDeleteSubcategory = async (
  event: MouseEvent<HTMLButtonElement>,
  subcategory: Subcategory,
) => {
  event.stopPropagation();

  const confirmed = window.confirm(
    `Are you sure you want to delete "${subcategory.name}"?`,
  );

  if (!confirmed) {
    return;
  }

  try {
    await axios.delete(
      `http://localhost:3000/api/categories/subcategories/${subcategory.id}`,
    );

    setSubcategories(
      (currentSubcategories) =>
        currentSubcategories.filter(
          (currentSubcategory) =>
            currentSubcategory.id !==
            subcategory.id,
        ),
    );

    if (
      selectedSubcategoryId ===
      subcategory.id
    ) {
      setSelectedSubcategoryId(null);
    }

    if (
      editingSubcategory?.id ===
      subcategory.id
    ) {
      setEditingSubcategory(null);
    }

    setSuccessMessage(
      `"${subcategory.name}" subcategory deleted successfully.`,
    );
  } catch (error) {
    console.error(
      "Failed to delete subcategory:",
      error,
    );

    setSubcategoryError(
      "Failed to delete subcategory. Please try again.",
    );
  }
};

  /* =========================================
     CHANGE ACTIVE CATEGORY TYPE
     ========================================= */

  const handleTypeChange = (
    type: CategoryType,
  ) => {
    setActiveType(type);
    setSelectedCategoryId(null);
    setSelectedSubcategoryId(null);
    setSuccessMessage("");
  };

  /* =========================================
     RENDER
     ========================================= */

  return (
    <section className="category-create">
      {/* =====================================
          HEADER
          ===================================== */}

      <header className="category-create__header">
        <div>
          <span className="category-create__label">
            FINANCIAL MANAGEMENT
          </span>

          <h1>Categories</h1>

          <p>
            Organize your income and expenses
            with custom categories.
          </p>
        </div>

        <button
          type="button"
          className="category-create__add-button"
          onClick={handleOpenForm}
        >
          + Add Category
        </button>

<button
  type="button"
  className="category-create__download-button"
  onClick={() =>
    downloadCategoryPdf(
      categories,
      subcategories,
      selectedCategoryId,
    )
  }
  aria-label="Download categories PDF"
  title="Download categories PDF"
>
  <span
    className="category-create__download-icon"
    aria-hidden="true"
  >
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 4V15"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      <path
        d="M7.5 11L12 15.5L16.5 11"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M5 20H19"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  </span>
</button>

      </header>

      {/* =====================================
          SUCCESS MESSAGE
          ===================================== */}

      {successMessage && (
        <div
          className="category-create__success"
          role="status"
        >
          {successMessage}
        </div>
      )}

      {/* =====================================
          EXPENSE / INCOME TABS
          ===================================== */}

      <div className="category-create__tabs">
        <button
          type="button"
          className={
            activeType === "expense"
              ? "category-create__tab category-create__tab--active"
              : "category-create__tab"
          }
          onClick={() =>
            handleTypeChange("expense")
          }
        >
          Expense
        </button>

        <button
          type="button"
          className={
            activeType === "income"
              ? "category-create__tab category-create__tab--active"
              : "category-create__tab"
          }
          onClick={() =>
            handleTypeChange("income")
          }
        >
          Income
        </button>
      </div>

      {/* =====================================
          CATEGORY LIST
          ===================================== */}

      <div className="category-create__list">
        {visibleCategories.map((category) => {
          const isSelected =
            selectedCategoryId === category.id;

          return (
            <div
              key={category.id}
              className="category-create__category-wrapper"
            >
              {/* CATEGORY CARD */}

              <article
                className={
                  isSelected
                    ? "category-create__card category-create__card--selected"
                    : "category-create__card"
                }
                onClick={() =>
                  handleCategoryClick(
                    category.id,
                  )
                }
              >
                {/* ICON */}

                <div
                  className="category-create__icon"
                  style={{
                    backgroundColor:
                      category.color,
                  }}
                >
                  {category.icon}
                </div>

                {/* DETAILS */}

                <div className="category-create__details">
                  <h3>{category.name}</h3>

                  <span>
                    {category.isCustom
                      ? "Custom category"
                      : "Default category"}
                  </span>
                </div>

                {/* CATEGORY EDIT / DELETE */}

                {category.isCustom && (
                  <div
                    className="category-create__card-actions"
                    onClick={(event) =>
                      event.stopPropagation()
                    }
                  >
                    <button
                      type="button"
                      className="category-create__edit-button"
                      onClick={(event) => {
                        event.stopPropagation();

                        setEditingCategory(
                          category,
                        );
                      }}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="category-create__delete-button"
                      onClick={(event) => {
                        event.stopPropagation();

                        setDeletingCategory(
                          category,
                        );
                      }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </article>

              {/* =================================
                  SUBCATEGORY PANEL
                  ================================= */}

              {isSelected && (
                <div
                  className="category-create__subcategories"
                  onClick={(event) =>
                    event.stopPropagation()
                  }
                >
                  {/* HEADER */}

                  <div className="category-create__subcategories-header">
                    <div>
                      <h4>
                        Subcategories
                      </h4>

                      <span>
                        {
                          selectedSubcategories.length
                        }{" "}
                        {selectedSubcategories.length ===
                        1
                          ? "subcategory"
                          : "subcategories"}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="category-create__add-subcategory-button"
                      onClick={
                        handleOpenAddSubcategory
                      }
                    >
                      + Add Subcategory
                    </button>
                  </div>

                  {/* LIST */}

                  {selectedSubcategories.length >
                  0 ? (
                    <div className="category-create__subcategory-list">
                      {selectedSubcategories.map(
                        (subcategory) => {
                          const isSubcategorySelected =
                            selectedSubcategoryId ===
                            subcategory.id;

                          return (
                            <div
                              key={subcategory.id}
                              className={
                                isSubcategorySelected
                                  ? "category-create__subcategory-item category-create__subcategory-item--selected"
                                  : "category-create__subcategory-item"
                              }
                              onClick={(event) =>
                                handleSubcategoryClick(
                                  event,
                                  subcategory.id,
                                )
                              }
                              role="button"
                              tabIndex={0}
                              aria-pressed={
                                isSubcategorySelected
                              }
                              onKeyDown={(
                                event,
                              ) => {
                                if (
                                  event.key ===
                                    "Enter" ||
                                  event.key ===
                                    " "
                                ) {
                                  event.preventDefault();

                                  setSelectedSubcategoryId(
                                    (currentId) =>
                                      currentId ===
                                      subcategory.id
                                        ? null
                                        : subcategory.id,
                                  );
                                }
                              }}
                            >
                              {/* SUBCATEGORY ICON */}

                              <div
                                className="category-create__subcategory-icon"
                                aria-hidden="true"
                              >
                                {
                                  subcategory.icon
                                }
                              </div>

                              {/* SUBCATEGORY DETAILS */}

                              <div className="category-create__subcategory-info">
                                <span className="category-create__subcategory-name">
                                  {
                                    subcategory.name
                                  }
                                </span>

                                <span className="category-create__subcategory-description">
                                  {
                                    category.name
                                  }
                                </span>
                              </div>

                              {/* ACTIONS */}

                              <div
                                className="category-create__subcategory-actions"
                                onClick={(event) =>
                                  event.stopPropagation()
                                }
                              >
                                <button
                                  type="button"
                                  className="category-create__subcategory-edit"
                                  onClick={(
                                    event,
                                  ) =>
                                    handleOpenEditSubcategory(
                                      event,
                                      subcategory,
                                    )
                                  }
                                  aria-label={`Edit ${subcategory.name}`}
                                >
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  className="category-create__subcategory-delete"
                                  onClick={(
                                    event,
                                  ) =>
                                    handleDeleteSubcategory(
                                      event,
                                      subcategory,
                                    )
                                  }
                                  aria-label={`Delete ${subcategory.name}`}
                                >
                                  Delete
                                </button>
                              </div>

                              {/* INDICATOR */}

                              <div
                                className="category-create__subcategory-indicator"
                                aria-hidden="true"
                              >
                                {isSubcategorySelected
                                  ? "✓"
                                  : "›"}
                              </div>
                            </div>
                          );
                        },
                      )}
                    </div>
                  ) : (
                    /* EMPTY SUBCATEGORY STATE */

                    <div className="category-create__no-subcategories">
                      <div>
                        <strong>
                          No subcategories yet
                        </strong>

                        <span>
                          Add one to organize this
                          category.
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={
                          handleOpenAddSubcategory
                        }
                      >
                        + Add Subcategory
                      </button>
                    </div>
                  )}

                  {/* SELECTED SUBCATEGORY */}

                  {selectedSubcategory && (
                    <div className="category-create__selected-subcategory">
                      <div className="category-create__selected-subcategory-icon">
                        {
                          selectedSubcategory.icon
                        }
                      </div>

                      <div>
                        <strong>
                          {
                            selectedSubcategory.name
                          }
                        </strong>

                        <span>
                          Selected subcategory
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* =====================================
          EMPTY CATEGORY STATE
          ===================================== */}

      {visibleCategories.length === 0 && (
        <div className="category-create__empty">
          <div className="category-create__empty-icon">
            📂
          </div>

          <h3>
            No {activeType} categories
          </h3>

          <p>
            Create your first{" "}
            {activeType} category to get started.
          </p>

          <button
            type="button"
            onClick={handleOpenForm}
          >
            + Add Category
          </button>
        </div>
      )}

      {/* =====================================
          ADD / EDIT SUBCATEGORY MODAL
          ===================================== */}

      {isSubcategoryFormOpen && (
        <div
          className="category-create__overlay"
          role="presentation"
          onMouseDown={
            handleCloseSubcategoryForm
          }
        >
          <div
            className="category-create__modal category-create__subcategory-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="subcategory-form-title"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="category-create__modal-header">
              <div>
                <h2 id="subcategory-form-title">
                  {editingSubcategory
                    ? "Edit Subcategory"
                    : "Add Subcategory"}
                </h2>

                <p>
                  {editingSubcategory
                    ? "Update this subcategory."
                    : "Create a new subcategory for this category."}
                </p>
              </div>

              <button
                type="button"
                className="category-create__close"
                onClick={
                  handleCloseSubcategoryForm
                }
                aria-label="Close subcategory form"
              >
                ×
              </button>
            </div>

            <form
              className="category-create__form"
              onSubmit={
                handleSaveSubcategory
              }
            >
              {/* NAME */}

              <div className="category-create__field">
                <label htmlFor="subcategory-name">
                  Subcategory Name
                </label>

                <input
                  id="subcategory-name"
                  type="text"
                  value={
                    subcategoryForm.name
                  }
                  onChange={(event) =>
                    handleSubcategoryNameChange(
                      event.target.value,
                    )
                  }
                  placeholder="Example: Fast Food"
                  autoFocus
                />
              </div>

              {/* CATEGORY */}

              <div className="category-create__field">
                <span className="category-create__field-label">
                  Category
                </span>

                <input
                  type="text"
                  value={
                    categories.find(
                      (category) =>
                        category.id ===
                        selectedCategoryId,
                    )?.name ?? ""
                  }
                  readOnly
                />
              </div>

              {/* ICON */}

              <div className="category-create__field">
                <span className="category-create__field-label">
                  Icon
                </span>

                <div className="category-create__icons category-create__subcategory-icons">
                  {SUBCATEGORY_ICONS.map(
                    (icon) => (
                      <button
                        key={icon}
                        type="button"
                        className={
                          subcategoryForm.icon ===
                          icon
                            ? "category-create__icon-option category-create__icon-option--selected"
                            : "category-create__icon-option"
                        }
                        onClick={() =>
                          handleSubcategoryIconChange(
                            icon,
                          )
                        }
                        aria-label={`Select ${icon} icon`}
                        aria-pressed={
                          subcategoryForm.icon ===
                          icon
                        }
                      >
                        {icon}
                      </button>
                    ),
                  )}
                </div>
              </div>

              {/* ERROR */}

              {subcategoryError && (
                <p
                  className="category-create__error"
                  role="alert"
                >
                  {subcategoryError}
                </p>
              )}

              {/* ACTIONS */}

              <div className="category-create__actions">
                <button
                  type="button"
                  className="category-create__cancel"
                  onClick={
                    handleCloseSubcategoryForm
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="category-create__submit"
                >
                  {editingSubcategory
                    ? "Update Subcategory"
                    : "Add Subcategory"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================
          CREATE CATEGORY MODAL
          ===================================== */}

      {isFormOpen && (
        <div
          className="category-create__overlay"
          role="presentation"
          onMouseDown={handleCloseForm}
        >
          <div
            className="category-create__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-category-title"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="category-create__modal-header">
              <div>
                <h2 id="create-category-title">
                  Create Category
                </h2>

                <p>
                  Add a new income or expense
                  category.
                </p>
              </div>

              <button
                type="button"
                className="category-create__close"
                onClick={handleCloseForm}
                aria-label="Close create category form"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="category-create__form"
            >
              {/* CATEGORY NAME */}

              <div className="category-create__field">
                <label htmlFor="category-name">
                  Category Name
                </label>

                <input
                  id="category-name"
                  type="text"
                  value={categoryName}
                  onChange={(event) =>
                    handleCategoryNameChange(
                      event.target.value,
                    )
                  }
                  placeholder="Example: Pet Care"
                  autoFocus
                />
              </div>

              {/* CATEGORY TYPE */}

              <div className="category-create__field">
                <label htmlFor="category-type">
                  Category Type
                </label>

                <select
                  id="category-type"
                  value={categoryType}
                  onChange={(event) =>
                    setCategoryType(
                      event.target
                        .value as CategoryType,
                    )
                  }
                >
                  <option value="expense">
                    Expense
                  </option>

                  <option value="income">
                    Income
                  </option>
                </select>
              </div>

              {/* CATEGORY ICON */}

              <div className="category-create__field">
                <span className="category-create__field-label">
                  Icon
                </span>

                <div className="category-create__icons">
                  {CATEGORY_ICONS.map(
                    (icon) => (
                      <button
                        key={icon}
                        type="button"
                        className={
                          selectedIcon ===
                          icon
                            ? "category-create__icon-option category-create__icon-option--selected"
                            : "category-create__icon-option"
                        }
                        onClick={() =>
                          setSelectedIcon(icon)
                        }
                        aria-label={`Select ${icon} icon`}
                        aria-pressed={
                          selectedIcon ===
                          icon
                        }
                      >
                        {icon}
                      </button>
                    ),
                  )}
                </div>
              </div>

              {/* CATEGORY COLOR */}

              <div className="category-create__field">
                <span className="category-create__field-label">
                  Color
                </span>

                <div className="category-create__colors">
                  {CATEGORY_COLORS.map(
                    (color) => (
                      <button
                        key={color}
                        type="button"
                        className={
                          selectedColor ===
                          color
                            ? "category-create__color category-create__color--selected"
                            : "category-create__color"
                        }
                        style={{
                          backgroundColor:
                            color,
                        }}
                        onClick={() =>
                          setSelectedColor(
                            color,
                          )
                        }
                        aria-label={`Select ${color} color`}
                        aria-pressed={
                          selectedColor ===
                          color
                        }
                      />
                    ),
                  )}
                </div>
              </div>

              {/* CATEGORY ERROR */}

              {errorMessage && (
                <p
                  className="category-create__error"
                  role="alert"
                >
                  {errorMessage}
                </p>
              )}

              {/* ACTIONS */}

              <div className="category-create__actions">
                <button
                  type="button"
                  className="category-create__cancel"
                  onClick={handleCloseForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="category-create__submit"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================
          EDIT CATEGORY
          ===================================== */}

      {editingCategory && (
        <EditCategory
          category={editingCategory}
          onSave={handleEditCategory}
          onCancel={() =>
            setEditingCategory(null)
          }
        />
      )}

      {/* =====================================
          DELETE CATEGORY
          ===================================== */}

      {deletingCategory && (
        <DeleteCategory
          category={deletingCategory}
          onDelete={handleDeleteCategory}
          onCancel={() =>
            setDeletingCategory(null)
          }
        />
      )}
    </section>
  );
};

export default CreateCategory;