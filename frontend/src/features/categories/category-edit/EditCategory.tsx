import { FormEvent, useState } from "react";

import {
  CATEGORY_COLORS,
  CATEGORY_ICONS,
} from "../category-create/categoryData";

import {
  CategoryType,
  CreateCategoryFormData,
} from "../category-create/categoryTypes";

import { EditCategoryProps } from "./editCategoryTypes";

import "./EditCategory.css";

const EditCategory = ({
  category,
  onSave,
  onCancel,
}: EditCategoryProps) => {
  const [name, setName] = useState(category.name);

  const [type, setType] =
    useState<CategoryType>(category.type);

  const [icon, setIcon] = useState(category.icon);

  const [color, setColor] = useState(category.color);

  const [errorMessage, setErrorMessage] =
    useState("");

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setErrorMessage(
        "Category name is required."
      );
      return;
    }

    const formData: CreateCategoryFormData = {
      name: trimmedName,
      type,
      icon,
      color,
    };

    onSave(category, formData);
  };

  return (
    <div
      className="edit-category__overlay"
      onMouseDown={onCancel}
    >
      <div
        className="edit-category__modal"
        role="dialog"
        aria-modal="true"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div className="edit-category__header">
          <div>
            <h2>Edit Category</h2>

            <p>
              Update the category details.
            </p>
          </div>

          <button
            type="button"
            className="edit-category__close"
            onClick={onCancel}
            aria-label="Close edit category"
          >
            ×
          </button>
        </div>

        <form
          className="edit-category__form"
          onSubmit={handleSubmit}
        >
          <div className="edit-category__field">
            <label htmlFor="edit-category-name">
              Category Name
            </label>

            <input
              id="edit-category-name"
              type="text"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setErrorMessage("");
              }}
              placeholder="Enter category name"
              autoFocus
            />
          </div>

          <div className="edit-category__field">
            <label htmlFor="edit-category-type">
              Category Type
            </label>

            <select
              id="edit-category-type"
              value={type}
              onChange={(event) =>
                setType(
                  event.target.value as CategoryType
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

          <div className="edit-category__field">
            <span className="edit-category__label">
              Icon
            </span>

            <div className="edit-category__icons">
              {CATEGORY_ICONS.map((categoryIcon) => (
                <button
                  key={categoryIcon}
                  type="button"
                  className={
                    icon === categoryIcon
                      ? "edit-category__icon edit-category__icon--selected"
                      : "edit-category__icon"
                  }
                  onClick={() =>
                    setIcon(categoryIcon)
                  }
                >
                  {categoryIcon}
                </button>
              ))}
            </div>
          </div>

          <div className="edit-category__field">
            <span className="edit-category__label">
              Color
            </span>

            <div className="edit-category__colors">
              {CATEGORY_COLORS.map((categoryColor) => (
                <button
                  key={categoryColor}
                  type="button"
                  className={
                    color === categoryColor
                      ? "edit-category__color edit-category__color--selected"
                      : "edit-category__color"
                  }
                  style={{
                    backgroundColor: categoryColor,
                  }}
                  onClick={() =>
                    setColor(categoryColor)
                  }
                  aria-label={`Select ${categoryColor}`}
                />
              ))}
            </div>
          </div>

          {errorMessage && (
            <p
              className="edit-category__error"
              role="alert"
            >
              {errorMessage}
            </p>
          )}

          <div className="edit-category__actions">
            <button
              type="button"
              className="edit-category__cancel"
              onClick={onCancel}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="edit-category__save"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCategory;