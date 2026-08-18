import React, { useState, useEffect, useRef } from 'react';
import './CategoryPicker.css';

export interface CategoryItem {
  id: string;
  name: string;
  type: string;
  icon?: string | null;
  color?: string | null;
}

export interface SubcategoryItem {
  id: string;
  name: string;
  icon?: string | null;
  categoryId: string;
}

interface CategoryPickerProps {
  categories: CategoryItem[];
  subcategories: SubcategoryItem[];
  selectedCategoryId: string;
  selectedSubcategoryId: string;
  onSelect: (categoryId: string, subcategoryId: string) => void;
  required?: boolean;
}

const PASTEL_COLORS = [
  '#eff6ff',
  '#fef3c7',
  '#fee2e2',
  '#f3e8ff',
  '#ecfdf5',
  '#e0e7ff',
];

export const CategoryPicker: React.FC<CategoryPickerProps> = ({
  categories = [],
  subcategories = [],
  selectedCategoryId,
  selectedSubcategoryId,
  onSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const safeCategories = Array.isArray(categories) ? categories : [];
  const safeSubcategories = Array.isArray(subcategories) ? subcategories : [];

  // Track currently selected parent category in the picker left column
  const [activeCategory, setActiveCategory] = useState<CategoryItem | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Set initial active category based on current selection or first category
  useEffect(() => {
    if (selectedCategoryId) {
      const found = safeCategories.find((c) => c.id === selectedCategoryId);
      if (found) setActiveCategory(found);
    } else if (safeCategories.length > 0 && !activeCategory) {
      setActiveCategory(safeCategories[0]);
    }
  }, [selectedCategoryId, safeCategories, activeCategory]);

  // Handle clicking outside to close popover
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Filter categories by search query
  const filteredCategories = safeCategories.filter((cat) => {
    if (!cat || !cat.name) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchesCat = cat.name.toLowerCase().includes(q);
    const hasMatchingSub = safeSubcategories.some(
      (sub) => sub && sub.categoryId === cat.id && sub.name && sub.name.toLowerCase().includes(q)
    );
    return matchesCat || hasMatchingSub;
  });

  // Active category to show subcategories for
  const currentCategory = activeCategory || (filteredCategories.length > 0 ? filteredCategories[0] : null);

  // Filter subcategories for the active category + search query
  const currentSubcategories = currentCategory
    ? safeSubcategories.filter((sub) => {
        if (!sub || sub.categoryId !== currentCategory.id) return false;
        if (!searchQuery.trim()) return true;
        return sub.name && sub.name.toLowerCase().includes(searchQuery.toLowerCase());
      })
    : [];

  const selectedCatObj = safeCategories.find((c) => c && c.id === selectedCategoryId);
  const selectedSubObj = safeSubcategories.find((s) => s && s.id === selectedSubcategoryId);

  const triggerLabel = selectedCatObj
    ? (selectedSubObj ? `${selectedSubObj.name}` : selectedCatObj.name)
    : 'Select category';

  const triggerIcon = selectedSubObj?.icon || selectedCatObj?.icon || '🏷️';

  const handleSelectSubcategory = (catId: string, subId: string) => {
    onSelect(catId, subId);
    setIsOpen(false);
  };

  const handleSelectCategoryDirect = (cat: CategoryItem) => {
    setActiveCategory(cat);
    const subs = safeSubcategories.filter((s) => s && s.categoryId === cat.id);
    if (subs.length === 0) {
      onSelect(cat.id, '');
      setIsOpen(false);
    }
  };

  const handleSelectParentCategory = (cat: CategoryItem) => {
    onSelect(cat.id, '');
    setIsOpen(false);
  };

  return (
    <div className="category-picker-container" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        className={`category-picker-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="category-picker-trigger-content">
          <span className="category-picker-trigger-icon">{triggerIcon}</span>
          <span>{triggerLabel}</span>
        </div>
        <span className="category-picker-trigger-caret">▲</span>
      </button>

      {/* Popover Panel & Backdrop */}
      {isOpen && (
        <>
          <div
            className="category-picker-backdrop"
            onClick={() => setIsOpen(false)}
          />
          <div className="category-picker-popover">
            {/* Search Header */}
            <div className="category-picker-search-container">
              <span className="category-picker-search-icon">🔍</span>
              <input
                type="text"
                className="category-picker-search-input"
                placeholder="Search category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>

            {/* 2-Column Body */}
            <div className="category-picker-body">
              {/* Left Column: CATEGORIES */}
              <div className="category-picker-col">
                <div className="category-picker-col-header">
                  <span>Categories</span>
                  <span className="category-picker-badge">{filteredCategories.length}</span>
                </div>
                <div className="category-picker-list">
                  {filteredCategories.map((cat, idx) => {
                    const isSelected = currentCategory?.id === cat.id;
                    const bgStyle = PASTEL_COLORS[idx % PASTEL_COLORS.length];

                    return (
                      <div
                        key={cat.id}
                        className={`category-item-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleSelectCategoryDirect(cat)}
                      >
                        <div className="category-item-left">
                          <div
                            className="category-icon-box"
                            style={{ backgroundColor: cat.color || bgStyle }}
                          >
                            {cat.icon || '🏷️'}
                          </div>
                          <span className="category-item-title">{cat.name}</span>
                        </div>
                        <span className="category-chevron">›</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: SUBCATEGORY */}
              <div className="category-picker-col">
                {currentCategory ? (
                  <>
                    <div
                      className="subcategory-panel-header"
                      onClick={() => handleSelectParentCategory(currentCategory)}
                      title="Click to select parent category"
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="subcategory-header-icon">
                        {currentCategory.icon || '🏷️'}
                      </div>
                      <div className="subcategory-header-text">
                        <span className="subcategory-header-label">Subcategory</span>
                        <span className="subcategory-header-title">{currentCategory.name}</span>
                      </div>
                    </div>

                    <div className="category-picker-list">
                      {currentSubcategories.length > 0 ? (
                        currentSubcategories.map((sub) => {
                          const isSubSelected = selectedSubcategoryId === sub.id;

                          return (
                            <div
                              key={sub.id}
                              className={`subcategory-item-card ${isSubSelected ? 'selected' : ''}`}
                              onClick={() => handleSelectSubcategory(currentCategory.id, sub.id)}
                            >
                              <span className="subcategory-item-icon">
                                {sub.icon || currentCategory.icon || '•'}
                              </span>
                              <span className="subcategory-item-name">{sub.name}</span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="subcategory-empty-state">
                          <span>No subcategories available</span>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="subcategory-empty-state">
                    <span>Select a category to view subcategories</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CategoryPicker;
