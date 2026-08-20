import { DeleteCategoryProps } from "./deleteCategoryTypes";

import "./DeleteCategory.css";

const DeleteCategory = ({
  category,
  onDelete,
  onCancel,
}: DeleteCategoryProps) => {
  const handleDelete = () => {
    onDelete(category.id);
  };

  return (
    <div
      className="delete-category__overlay"
      onMouseDown={onCancel}
    >
      <div
        className="delete-category__dialog"
        role="dialog"
        aria-modal="true"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div className="delete-category__icon">
          !
        </div>

        <h2>Delete Category?</h2>

        <p>
          Are you sure you want to delete{" "}
          <strong>{category.name}</strong>?
        </p>

        <p className="delete-category__warning">
          This action cannot be undone.
        </p>

        <div className="delete-category__actions">
          <button
            type="button"
            className="delete-category__cancel"
            onClick={onCancel}
          >
            Cancel
          </button>

          <button
            type="button"
            className="delete-category__confirm"
            onClick={handleDelete}
          >
            Delete Category
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteCategory;