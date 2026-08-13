import { useState } from "react";
import type {
  Category,
  Subcategory,
} from "./types/subcategory.types";
import {
  mockCategories,
  mockSubcategories,
} from "./data/subcategory.mock";
import SubcategoryForm from "./components/SubcategoryForm";
import SubcategoryList from "./components/SubcategoryList";
import "./SubcategoryManagement.css";

interface SubcategoryManagementProps {
  categories?: Category[];
  initialSubcategories?: Subcategory[];
  selectedCategoryId?: string | null;
  showHeader?: boolean;
}

function SubcategoryManagement({
  categories = mockCategories,
  initialSubcategories = mockSubcategories,
  selectedCategoryId = null,
  showHeader = true,
}: SubcategoryManagementProps) {
  const [subcategories, setSubcategories] =
    useState<Subcategory[]>(initialSubcategories);

  const [editingSubcategory, setEditingSubcategory] =
    useState<Subcategory | null>(null);

  function handleSave(subcategory: Subcategory) {
    setSubcategories((currentSubcategories) => {
      const exists = currentSubcategories.some(
        (item) => item.id === subcategory.id,
      );

      if (exists) {
        return currentSubcategories.map((item) =>
          item.id === subcategory.id
            ? subcategory
            : item,
        );
      }

      return [...currentSubcategories, subcategory];
    });

    setEditingSubcategory(null);
  }

  function handleEdit(subcategory: Subcategory) {
    setEditingSubcategory(subcategory);
  }

  function handleDelete(subcategory: Subcategory) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${subcategory.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    setSubcategories((currentSubcategories) =>
      currentSubcategories.filter(
        (item) => item.id !== subcategory.id,
      ),
    );

    if (editingSubcategory?.id === subcategory.id) {
      setEditingSubcategory(null);
    }
  }

  function handleCancelEdit() {
    setEditingSubcategory(null);
  }

  return (
    <section className="subcategory-management">
      {showHeader && (
        <header className="subcategory-management__header">
          <div>
            <h1>Subcategory Management</h1>

            <p>
              Create, edit, delete, and assign
              subcategories to existing categories.
            </p>
          </div>
        </header>
      )}

      <div className="subcategory-management__form">
        <SubcategoryForm
          categories={categories}
          subcategories={subcategories}
          editingSubcategory={editingSubcategory}
          selectedCategoryId={selectedCategoryId ?? undefined}
          onSave={handleSave}
          onCancelEdit={handleCancelEdit}
        />
      </div>

      <div className="subcategory-management__list">
        <SubcategoryList
          categories={categories}
          subcategories={subcategories}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </section>
  );
}

export default SubcategoryManagement;