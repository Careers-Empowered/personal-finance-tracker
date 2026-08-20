import type {
  Category,
  Subcategory,
} from "../types/subcategory.types";

import SubcategoryItem from "./SubcategoryItem";

interface SubcategoryListProps {
  categories: Category[];
  subcategories: Subcategory[];
  onEdit: (subcategory: Subcategory) => void;
  onDelete: (subcategory: Subcategory) => void;
}

function SubcategoryList({
  categories,
  subcategories,
  onEdit,
  onDelete,
}: SubcategoryListProps) {
  return (
    <div className="subcategory-list">
      {categories.map((category) => {
        const categorySubcategories =
          subcategories.filter(
            (subcategory) =>
              subcategory.categoryId === category.id,
          );

        return (
          <section
            className="subcategory-list__category"
            key={category.id}
          >
            {/* Category header */}
            <div className="subcategory-list__category-header">
              <div>
                <h2>{category.name}</h2>

                <p>
                  {categorySubcategories.length}{" "}
                  {categorySubcategories.length === 1
                    ? "subcategory"
                    : "subcategories"}
                </p>
              </div>

              <span>
                {category.type}
              </span>
            </div>

            {/* Subcategories */}
            {categorySubcategories.length > 0 ? (
              <div className="subcategory-list__items">
                {categorySubcategories.map(
                  (subcategory) => (
                    <SubcategoryItem
                      key={subcategory.id}
                      subcategory={subcategory}
                      categoryName={category.name}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  ),
                )}
              </div>
            ) : (
              <div className="subcategory-list__empty">
                <span
                  className="subcategory-list__empty-icon"
                  aria-hidden="true"
                >
                  +
                </span>

                <p>
                  No subcategories yet.
                </p>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

export default SubcategoryList;