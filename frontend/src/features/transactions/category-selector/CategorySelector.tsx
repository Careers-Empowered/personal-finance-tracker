import React, { useMemo, useState } from "react";
import "./CategorySelector.css";
import type {
  CategoryOption,
  CategorySelectorProps,
  SubcategoryOption,
} from "./categorySelectorTypes";

const categories: CategoryOption[] = [
  {
    id: "food",
    name: "Food",
    icon: "🍔",
    color: "#FFE5E5",
    type: "expense",
    subcategories: [
      {
        id: "groceries",
        name: "Groceries",
        icon: "🛒",
      },
      {
        id: "restaurant",
        name: "Restaurant",
        icon: "🍔",
      },
      {
        id: "coffee",
        name: "Coffee",
        icon: "☕",
      },
    ],
  },
  {
    id: "shopping",
    name: "Shopping",
    icon: "🛍️",
    color: "#E8E0FF",
    type: "expense",
    subcategories: [
      {
        id: "clothing",
        name: "Clothing",
        icon: "👕",
      },
      {
        id: "electronics",
        name: "Electronics",
        icon: "📱",
      },
    ],
  },
  {
    id: "transport",
    name: "Transport",
    icon: "🚗",
    color: "#E0F2FF",
    type: "expense",
    subcategories: [
      {
        id: "fuel",
        name: "Fuel",
        icon: "⛽",
      },
      {
        id: "bus",
        name: "Bus",
        icon: "🚌",
      },
    ],
  },
  {
    id: "bills",
    name: "Bills",
    icon: "🏠",
    color: "#FFF0D9",
    type: "expense",
    subcategories: [
      {
        id: "electricity",
        name: "Electricity",
        icon: "⚡",
      },
      {
        id: "water",
        name: "Water",
        icon: "💧",
      },
    ],
  },
  {
    id: "salary",
    name: "Salary",
    icon: "💼",
    color: "#E3F8E8",
    type: "income",
    subcategories: [
      {
        id: "monthly-salary",
        name: "Monthly Salary",
        icon: "💰",
      },
      {
        id: "bonus",
        name: "Bonus",
        icon: "🎁",
      },
    ],
  },
  {
    id: "freelance",
    name: "Freelance",
    icon: "💻",
    color: "#E1F3FF",
    type: "income",
    subcategories: [
      {
        id: "project-income",
        name: "Project Income",
        icon: "📁",
      },
    ],
  },
  {
    id: "business",
    name: "Business",
    icon: "🏢",
    color: "#FFF0D9",
    type: "income",
    subcategories: [
      {
        id: "business-profit",
        name: "Business Profit",
        icon: "📈",
      },
    ],
  },
  {
    id: "investments",
    name: "Investments",
    icon: "📊",
    color: "#EFE4FF",
    type: "income",
    subcategories: [
      {
        id: "dividend",
        name: "Dividend",
        icon: "💵",
      },
      {
        id: "interest",
        name: "Interest",
        icon: "💰",
      },
    ],
  },
];

const CategorySelector: React.FC<CategorySelectorProps> = ({
  type,
  selectedCategory,
  selectedSubcategory,
  onCategoryChange,
  onSubcategoryChange,
  onCreateCategory,
  onCreateSubcategory,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedLocalCategory, setSelectedLocalCategory] =
    useState<CategoryOption | null>(selectedCategory ?? null);
  const [selectedLocalSubcategory, setSelectedLocalSubcategory] =
    useState<SubcategoryOption | null>(selectedSubcategory ?? null);

  const filteredCategories = useMemo(() => {
    return categories.filter(
      (category) =>
        category.type === type &&
        category.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search, type]);

  const handleCategorySelect = (category: CategoryOption) => {
    setSelectedLocalCategory(category);
    setSelectedLocalSubcategory(null);

    onCategoryChange?.(category);
    setSearch("");
  };

  const handleSubcategorySelect = (subcategory: SubcategoryOption) => {
    setSelectedLocalSubcategory(subcategory);
    onSubcategoryChange?.(subcategory);
    setIsOpen(false);
  };

  const handleCreateCategory = () => {
    onCreateCategory?.();
  };

  const handleCreateSubcategory = () => {
    if (selectedLocalCategory) {
      onCreateSubcategory?.(selectedLocalCategory);
    }
  };

  const displayValue =
    selectedLocalCategory && selectedLocalSubcategory
      ? `${selectedLocalCategory.name} · ${selectedLocalSubcategory.name}`
      : selectedLocalCategory
        ? selectedLocalCategory.name
        : "Select category";

  return (
    <div className="category-selector">
      <label className="category-selector__label">Category</label>

      <button
        type="button"
        className="category-selector__trigger"
        onClick={() => !disabled && setIsOpen((previous) => !previous)}
        disabled={disabled}
      >
        <span className="category-selector__value">
          <span className="category-selector__icon">
            {selectedLocalCategory?.icon ?? "🏷️"}
          </span>

          <span>{displayValue}</span>
        </span>

        <span
          className={`category-selector__arrow ${
            isOpen ? "category-selector__arrow--open" : ""
          }`}
        >
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="category-selector__dropdown">
          <div className="category-selector__search-wrapper">
            <span>🔍</span>

            <input
              type="text"
              placeholder="Search category..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              autoFocus
            />
          </div>

          <div className="category-selector__list">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <button
                  type="button"
                  key={category.id}
                  className="category-selector__category"
                  onClick={() => handleCategorySelect(category)}
                >
                  <span className="category-selector__category-left">
                    <span
                      className="category-selector__category-icon"
                      style={{ backgroundColor: category.color }}
                    >
                      {category.icon}
                    </span>

                    <span>{category.name}</span>
                  </span>

                  <span className="category-selector__category-arrow">
                    ›
                  </span>
                </button>
              ))
            ) : (
              <div className="category-selector__empty">
                No categories found
              </div>
            )}
          </div>

          {selectedLocalCategory && (
            <div className="category-selector__subcategories">
              <div className="category-selector__section-title">
                {selectedLocalCategory.icon} {selectedLocalCategory.name}
              </div>

              <div className="category-selector__subcategory-list">
                {selectedLocalCategory.subcategories.map((subcategory) => (
                  <button
                    type="button"
                    key={subcategory.id}
                    className={`category-selector__subcategory ${
                      selectedLocalSubcategory?.id === subcategory.id
                        ? "category-selector__subcategory--selected"
                        : ""
                    }`}
                    onClick={() =>
                      handleSubcategorySelect(subcategory)
                    }
                  >
                    <span>
                      {subcategory.icon} {subcategory.name}
                    </span>
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="category-selector__create"
                onClick={handleCreateSubcategory}
              >
                ＋ Add subcategory
              </button>
            </div>
          )}

          <div className="category-selector__footer">
            <button
              type="button"
              className="category-selector__create"
              onClick={handleCreateCategory}
            >
              ＋ Create category
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategorySelector;