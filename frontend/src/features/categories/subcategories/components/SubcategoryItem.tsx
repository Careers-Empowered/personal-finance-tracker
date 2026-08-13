import type { Subcategory } from "../types/subcategory.types";

interface SubcategoryItemProps {
  subcategory: Subcategory;
  categoryName: string;
  onEdit: (subcategory: Subcategory) => void;
  onDelete: (subcategory: Subcategory) => void;
}

function SubcategoryItem({
  subcategory,
  categoryName,
  onEdit,
  onDelete,
}: SubcategoryItemProps) {
  return (
    <article className="subcategory-item">
      {/* Subcategory icon */}
      <div
        className="subcategory-item__icon"
        aria-hidden="true"
      >
        {subcategory.icon}
      </div>

      {/* Subcategory information */}
      <div className="subcategory-item__info">
        <h3 className="subcategory-item__name">
          {subcategory.name}
        </h3>

        <p className="subcategory-item__category">
          {categoryName}
        </p>
      </div>

      {/* Actions */}
      <div className="subcategory-item__actions">
        <button
          type="button"
          className="subcategory-item__edit"
          onClick={() => onEdit(subcategory)}
          aria-label={`Edit ${subcategory.name}`}
        >
          Edit
        </button>

        <button
          type="button"
          className="subcategory-item__delete"
          onClick={() => onDelete(subcategory)}
          aria-label={`Delete ${subcategory.name}`}
        >
          Delete
        </button>
      </div>
    </article>
  );
}

export default SubcategoryItem;