import { useEffect, useState } from "react";
import type {
  Category,
  Subcategory,
} from "../types/subcategory.types";
import {
  generateSubcategoryId,
  isDuplicateSubcategory,
} from "../utils/subcategory.utils";

interface SubcategoryFormProps {
  categories: Category[];
  subcategories: Subcategory[];
  editingSubcategory?: Subcategory | null;
  selectedCategoryId?: string;
  onSave: (subcategory: Subcategory) => void;
  onCancelEdit: () => void;
}

const SUBCATEGORY_ICONS = [
  "🍽️",
  "🍔",
  "☕",
  "🥡",
  "⛽",
  "🚌",
  "🚕",
  "🅿️",
  "🏠",
  "🔧",
  "🛠️",
  "🧹",
  "👕",
  "💻",
  "🎧",
  "🩺",
  "💊",
  "💳",
  "🎬",
  "🎮",
  "🎨",
  "💼",
  "🎁",
  "⏰",
  "💰",
  "📈",
  "💵",
  "📦",
];

function SubcategoryForm({
  categories,
  subcategories,
  editingSubcategory,
  selectedCategoryId,
  onSave,
  onCancelEdit,
}: SubcategoryFormProps) {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [selectedIcon, setSelectedIcon] = useState(
    SUBCATEGORY_ICONS[0],
  );
  const [error, setError] = useState("");

  const isEditing = Boolean(editingSubcategory);

  useEffect(() => {
    if (editingSubcategory) {
      setName(editingSubcategory.name);
      setCategoryId(editingSubcategory.categoryId);
      setSelectedIcon(
        editingSubcategory.icon ||
          SUBCATEGORY_ICONS[0],
      );
    } else {
      setName("");

      setCategoryId(
        selectedCategoryId ??
          categories[0]?.id ??
          "",
      );

      setSelectedIcon(SUBCATEGORY_ICONS[0]);
    }

    setError("");
  }, [
    editingSubcategory,
    selectedCategoryId,
    categories,
  ]);

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError(
        "Subcategory name is required.",
      );
      return;
    }

    if (!categoryId) {
      setError(
        "Please select a category.",
      );
      return;
    }

    if (!selectedIcon) {
      setError(
        "Please select an icon.",
      );
      return;
    }

    const duplicate =
      isDuplicateSubcategory(
        subcategories,
        trimmedName,
        categoryId,
        editingSubcategory?.id,
      );

    if (duplicate) {
      setError(
        "A subcategory with this name already exists in the selected category.",
      );
      return;
    }

    const now =
      new Date().toISOString();

    const subcategory: Subcategory = {
      id:
        editingSubcategory?.id ??
        generateSubcategoryId(),

      name: trimmedName,

      categoryId,

      icon: selectedIcon,

      createdAt:
        editingSubcategory?.createdAt ??
        now,

      updatedAt: now,
    };

    onSave(subcategory);

    if (!isEditing) {
      setName("");

      setCategoryId(
        selectedCategoryId ??
          categories[0]?.id ??
          "",
      );

      setSelectedIcon(
        SUBCATEGORY_ICONS[0],
      );
    }

    setError("");
  }

  const selectedCategory =
    categories.find(
      (category) =>
        category.id === categoryId,
    );

  return (
    <form
      className="subcategory-form"
      onSubmit={handleSubmit}
    >
      <div className="subcategory-form__field">
        <label htmlFor="subcategory-name">
          Subcategory Name
        </label>

        <input
          id="subcategory-name"
          type="text"
          value={name}
          onChange={(event) =>
            setName(event.target.value)
          }
          placeholder="Enter subcategory name"
          autoFocus
        />
      </div>

      <div className="subcategory-form__field">
        <label htmlFor="subcategory-category">
          Category
        </label>

        {selectedCategoryId &&
        !isEditing ? (
          <>
            <input
              id="subcategory-category"
              type="text"
              value={
                selectedCategory
                  ? `${selectedCategory.name} (${selectedCategory.type})`
                  : ""
              }
              readOnly
            />

            <input
              type="hidden"
              value={categoryId}
              readOnly
            />
          </>
        ) : (
          <select
            id="subcategory-category"
            value={categoryId}
            onChange={(event) =>
              setCategoryId(
                event.target.value,
              )
            }
          >
            <option value="">
              Select category
            </option>

            {categories.map(
              (category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name} (
                  {category.type})
                </option>
              ),
            )}
          </select>
        )}
      </div>

      <div className="subcategory-form__field">
        <span className="subcategory-form__field-label">
          Icon
        </span>

        <div className="subcategory-form__icons">
          {SUBCATEGORY_ICONS.map(
            (icon) => (
              <button
                key={icon}
                type="button"
                className={
                  selectedIcon === icon
                    ? "subcategory-form__icon-option subcategory-form__icon-option--selected"
                    : "subcategory-form__icon-option"
                }
                onClick={() => {
                  setSelectedIcon(icon);
                  setError("");
                }}
                aria-label={`Select ${icon} icon`}
                aria-pressed={
                  selectedIcon === icon
                }
              >
                {icon}
              </button>
            ),
          )}
        </div>
      </div>

      {error && (
        <p
          className="subcategory-form__error"
          role="alert"
        >
          {error}
        </p>
      )}

      <div className="subcategory-form__actions">
        <button type="submit">
          {isEditing
            ? "Update Subcategory"
            : "Add Subcategory"}
        </button>

        {isEditing && (
          <button
            type="button"
            onClick={onCancelEdit}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default SubcategoryForm;