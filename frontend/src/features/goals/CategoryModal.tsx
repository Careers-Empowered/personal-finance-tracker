import React from "react";
import { goalCategories } from "./data/goalCategories";
import { GoalCategory } from "./types/goal";

interface CategoryModalProps {
  isOpen: boolean;
  selectedCategory: GoalCategory;
  onSelect: (category: GoalCategory) => void;
  onClose: () => void;
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  selectedCategory,
  onSelect,
  onClose,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="goal-modal-overlay" onClick={onClose}>
      <div
        className="category-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2>Select Category</h2>
            <p>Choose a category for your goal.</p>
          </div>

          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="category-list">
          {goalCategories.map((category) => (
            <button
              key={category}
              className={`category-option ${
                selectedCategory === category ? "selected" : ""
              }`}
              onClick={() => {
                onSelect(category);
                onClose();
              }}
            >
              <span>{category}</span>

              {selectedCategory === category && (
                <span className="selected-check">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryModal;