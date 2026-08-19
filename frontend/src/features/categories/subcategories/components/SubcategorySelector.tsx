import { useEffect, useRef, useState } from "react";

import { mockSubcategories } from "../data/subcategory.mock";
import { getSubcategoriesByCategory } from "../utils/subcategory.utils";
import "./SubcategorySelector.css";

interface SubcategorySelectorProps {
  categoryId: string;
  value: string;
  onChange: (subcategoryId: string) => void;
  required?: boolean;
}

function SubcategorySelector({
  categoryId,
  value,
  onChange,
  required = false,
}: SubcategorySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectorRef = useRef<HTMLDivElement>(null);

  const availableSubcategories = categoryId
    ? getSubcategoriesByCategory(
        mockSubcategories,
        categoryId,
      )
    : [];

  const filteredSubcategories =
    availableSubcategories.filter((subcategory) =>
      subcategory.name
        .toLowerCase()
        .includes(search.toLowerCase()),
    );

  const selectedSubcategory =
    availableSubcategories.find(
      (subcategory) => subcategory.id === value,
    );

  useEffect(() => {
    setIsOpen(false);
    setSearch("");
  }, [categoryId]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        selectorRef.current &&
        !selectorRef.current.contains(
          event.target as Node,
        )
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick,
      );
    };
  }, []);

  const handleSelect = (subcategoryId: string) => {
    onChange(subcategoryId);
    setIsOpen(false);
    setSearch("");
  };

  const handleToggle = () => {
    if (!categoryId) {
      return;
    }

    setIsOpen((current) => !current);
  };

  return (
    <div
      className="subcategory-selector"
      ref={selectorRef}
    >
      <label className="subcategory-selector__label">
        Subcategory
      </label>

      <button
        type="button"
        className={`subcategory-selector__trigger ${
          isOpen
            ? "subcategory-selector__trigger--open"
            : ""
        }`}
        onClick={handleToggle}
        disabled={!categoryId}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span
          className={
            selectedSubcategory
              ? "subcategory-selector__selected"
              : "subcategory-selector__placeholder"
          }
        >
          {selectedSubcategory
            ? `${selectedSubcategory.icon} ${selectedSubcategory.name}`
            : categoryId
              ? "Select subcategory"
              : "Select a category first"}
        </span>

        <span
          className={`subcategory-selector__arrow ${
            isOpen
              ? "subcategory-selector__arrow--open"
              : ""
          }`}
          aria-hidden="true"
        >
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="subcategory-selector__dropdown">
          <div className="subcategory-selector__search-wrapper">
            <span
              className="subcategory-selector__search-icon"
              aria-hidden="true"
            >
              🔍
            </span>

            <input
              type="text"
              className="subcategory-selector__search"
              placeholder="Search subcategory..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              autoFocus
            />
          </div>

          <div
            className="subcategory-selector__options"
            role="listbox"
            aria-label="Subcategories"
          >
            {filteredSubcategories.length > 0 ? (
              filteredSubcategories.map(
                (subcategory) => (
                  <button
                    key={subcategory.id}
                    type="button"
                    className={`subcategory-selector__option ${
                      value === subcategory.id
                        ? "subcategory-selector__option--selected"
                        : ""
                    }`}
                    onClick={() =>
                      handleSelect(subcategory.id)
                    }
                  >
                    <span className="subcategory-selector__option-icon">
                      {subcategory.icon}
                    </span>

                    <span>
                      {subcategory.name}
                    </span>
                  </button>
                ),
              )
            ) : (
              <div className="subcategory-selector__empty">
                No subcategories found
              </div>
            )}
          </div>
        </div>
      )}

      {required && (
        <input
          type="text"
          tabIndex={-1}
          value={value}
          onChange={() => undefined}
          required
          aria-hidden="true"
          className="subcategory-selector__validation-input"
        />
      )}
    </div>
  );
}

export default SubcategorySelector;