import { FormEvent, useMemo, useState } from "react";

import EditCategory from "../category-edit/EditCategory";
import DeleteCategory from "../category-delete/DeleteCategory";

import {
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  DEFAULT_CATEGORIES,
} from "./categoryData";

import {
  Category,
  CategoryType,
  CreateCategoryFormData,
  CreateCategoryProps,
} from "./categoryTypes";

import "./CreateCategory.css";

const CreateCategory = ({
  categories: initialCategories = DEFAULT_CATEGORIES,
  onCategoryCreate,
}: CreateCategoryProps) => {
  const [categories, setCategories] =
    useState<Category[]>(initialCategories);

  const [categoryName, setCategoryName] = useState("");

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

  const visibleCategories = useMemo(() => {
    return categories.filter(
      (category) => category.type === activeType
    );
  }, [categories, activeType]);

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
    value: string
  ) => {
    setCategoryName(value);

    if (errorMessage) {
      setErrorMessage("");
    }

    if (successMessage) {
      setSuccessMessage("");
    }
  };

  const isDuplicateCategory = (
    name: string,
    type: CategoryType,
    currentCategoryId?: string
  ) => {
    return categories.some(
      (category) =>
        category.id !== currentCategoryId &&
        category.type === type &&
        category.name.toLowerCase() ===
          name.toLowerCase()
    );
  };

  const createCategory = (
    formData: CreateCategoryFormData
  ): Category => {
    return {
      id: crypto.randomUUID(),
      name: formData.name,
      type: formData.type,
      icon: formData.icon,
      color: formData.color,
      isCustom: true,
    };
  };

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const trimmedName = categoryName.trim();

    if (!trimmedName) {
      setErrorMessage(
        "Please enter a category name."
      );
      return;
    }

    if (
      isDuplicateCategory(
        trimmedName,
        categoryType
      )
    ) {
      setErrorMessage(
        "This category already exists."
      );
      return;
    }

    const newCategory = createCategory({
      name: trimmedName,
      type: categoryType,
      icon: selectedIcon,
      color: selectedColor,
    });

    setCategories((currentCategories) => [
      ...currentCategories,
      newCategory,
    ]);

    onCategoryCreate?.(newCategory);

    setActiveType(categoryType);

    setSuccessMessage(
      `"${trimmedName}" category created successfully.`
    );

    handleCloseForm();
  };

  const handleEditCategory = (
    category: Category,
    formData: CreateCategoryFormData
  ) => {
    const trimmedName = formData.name.trim();

    if (!trimmedName) {
      return;
    }

    if (
      isDuplicateCategory(
        trimmedName,
        formData.type,
        category.id
      )
    ) {
      setSuccessMessage(
        "Another category with this name already exists."
      );
      setEditingCategory(null);
      return;
    }

    const updatedCategory: Category = {
      ...category,
      name: trimmedName,
      type: formData.type,
      icon: formData.icon,
      color: formData.color,
    };

    setCategories((currentCategories) =>
      currentCategories.map(
        (currentCategory) =>
          currentCategory.id === category.id
            ? updatedCategory
            : currentCategory
      )
    );

    setActiveType(formData.type);

    setSuccessMessage(
      `"${trimmedName}" category updated successfully.`
    );

    setEditingCategory(null);
  };

  const handleDeleteCategory = (
    categoryId: string
  ) => {
    const categoryToDelete = categories.find(
      (category) => category.id === categoryId
    );

    setCategories((currentCategories) =>
      currentCategories.filter(
        (category) => category.id !== categoryId
      )
    );

    if (categoryToDelete) {
      setSuccessMessage(
        `"${categoryToDelete.name}" category deleted successfully.`
      );
    }

    setDeletingCategory(null);
  };

  return (
    <section className="category-create">
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
      </header>

      {successMessage && (
        <div
          className="category-create__success"
          role="status"
        >
          {successMessage}
        </div>
      )}

      <div className="category-create__tabs">
        <button
          type="button"
          className={
            activeType === "expense"
              ? "category-create__tab category-create__tab--active"
              : "category-create__tab"
          }
          onClick={() => {
            setActiveType("expense");
            setSuccessMessage("");
          }}
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
          onClick={() => {
            setActiveType("income");
            setSuccessMessage("");
          }}
        >
          Income
        </button>
      </div>

      <div className="category-create__list">
        {visibleCategories.map((category) => (
          <article
            key={category.id}
            className="category-create__card"
          >
            <div
              className="category-create__icon"
              style={{
                backgroundColor: category.color,
              }}
            >
              {category.icon}
            </div>

            <div className="category-create__details">
              <h3>{category.name}</h3>

              <span>
                {category.isCustom
                  ? "Custom category"
                  : "Default category"}
              </span>
            </div>

            {category.isCustom && (
              <div className="category-create__card-actions">
                <button
                  type="button"
                  className="category-create__edit-button"
                  onClick={() =>
                    setEditingCategory(category)
                  }
                >
                  Edit
                </button>

                <button
                  type="button"
                  className="category-create__delete-button"
                  onClick={() =>
                    setDeletingCategory(category)
                  }
                >
                  Delete
                </button>
              </div>
            )}
          </article>
        ))}
      </div>

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
                      event.target.value
                    )
                  }
                  placeholder="Example: Pet Care"
                  autoFocus
                />
              </div>

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
                        .value as CategoryType
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

              <div className="category-create__field">
                <span className="category-create__field-label">
                  Icon
                </span>

                <div className="category-create__icons">
                  {CATEGORY_ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      className={
                        selectedIcon === icon
                          ? "category-create__icon-option category-create__icon-option--selected"
                          : "category-create__icon-option"
                      }
                      onClick={() =>
                        setSelectedIcon(icon)
                      }
                      aria-label={`Select ${icon} icon`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="category-create__field">
                <span className="category-create__field-label">
                  Color
                </span>

                <div className="category-create__colors">
                  {CATEGORY_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={
                        selectedColor === color
                          ? "category-create__color category-create__color--selected"
                          : "category-create__color"
                      }
                      style={{
                        backgroundColor: color,
                      }}
                      onClick={() =>
                        setSelectedColor(color)
                      }
                      aria-label={`Select ${color} color`}
                    />
                  ))}
                </div>
              </div>

              {errorMessage && (
                <p
                  className="category-create__error"
                  role="alert"
                >
                  {errorMessage}
                </p>
              )}

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

      {editingCategory && (
        <EditCategory
          category={editingCategory}
          onSave={handleEditCategory}
          onCancel={() => setEditingCategory(null)}
        />
      )}

      {deletingCategory && (
        <DeleteCategory
          category={deletingCategory}
          onDelete={handleDeleteCategory}
          onCancel={() => setDeletingCategory(null)}
        />
      )}
    </section>
  );
};

export default CreateCategory;