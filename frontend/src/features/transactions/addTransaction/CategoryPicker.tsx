import React, { useState, useEffect, useRef } from 'react';
import { apiFetch } from '../../../shared/utils/api';
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
  onCategoryAdded?: (newCategory: CategoryItem, newSubcategory?: SubcategoryItem) => void;
  onSubcategoryAdded?: (newSubcategory: SubcategoryItem) => void;
  defaultType?: 'EXPENSE' | 'INCOME' | string;
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
  onCategoryAdded,
  onSubcategoryAdded,
  defaultType = 'EXPENSE',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Local state to instantly render newly created categories
  const [localCategories, setLocalCategories] = useState<CategoryItem[]>(categories);
  const [localSubcategories, setLocalSubcategories] = useState<SubcategoryItem[]>(subcategories);

  useEffect(() => {
    setLocalCategories(categories);
  }, [categories]);

  useEffect(() => {
    setLocalSubcategories(subcategories);
  }, [subcategories]);

  const safeCategories = Array.isArray(localCategories) ? localCategories : [];
  const safeSubcategories = Array.isArray(localSubcategories) ? localSubcategories : [];

  // Currently active parent category for subcategories column
  const [activeCategory, setActiveCategory] = useState<CategoryItem | null>(null);

  // Inline add category state
  const [isAddingInline, setIsAddingInline] = useState(false);
  const [inlineCatName, setInlineCatName] = useState('');
  const [isSubmittingInline, setIsSubmittingInline] = useState(false);

  // Inline add subcategory state
  const [isAddingInlineSub, setIsAddingInlineSub] = useState(false);
  const [inlineSubName, setInlineSubName] = useState('');
  const [isSubmittingInlineSub, setIsSubmittingInlineSub] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Set initial active category
  useEffect(() => {
    if (selectedCategoryId) {
      const found = safeCategories.find((c) => c.id === selectedCategoryId);
      if (found) setActiveCategory(found);
    } else if (safeCategories.length > 0 && !activeCategory) {
      setActiveCategory(safeCategories[0]);
    }
  }, [selectedCategoryId, safeCategories, activeCategory]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsAddingInline(false);
        setIsAddingInlineSub(false);
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

  const currentCategory = activeCategory || (filteredCategories.length > 0 ? filteredCategories[0] : null);

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
    ? (selectedSubObj && selectedSubObj.name && selectedSubObj.name !== 'General'
        ? `${selectedCatObj.name} (${selectedSubObj.name})`
        : selectedCatObj.name)
    : 'Select category';

  const triggerIcon = selectedCatObj?.icon || selectedSubObj?.icon || '🏷️';

  const handleSelectSubcategory = (catId: string, subId: string) => {
    onSelect(catId, subId);
    setIsOpen(false);
  };

  const handleSelectCategoryDirect = (cat: CategoryItem) => {
    setActiveCategory(cat);
    const subs = safeSubcategories.filter((s) => s && s.categoryId === cat.id);
    const firstSubId = subs.length > 0 ? subs[0].id : '';
    onSelect(cat.id, firstSubId);
    if (subs.length === 0) {
      setIsOpen(false);
    }
  };

  const handleSelectParentCategory = (cat: CategoryItem) => {
    onSelect(cat.id, '');
    setIsOpen(false);
  };

  const handleAddCategorySubmit = async (nameToAdd: string) => {
    const trimmedName = nameToAdd.trim();
    if (!trimmedName || isSubmittingInline) return;

    setIsSubmittingInline(true);

    try {
      const response = await apiFetch('/api/transactions/categories', {
        method: 'POST',
        body: JSON.stringify({
          name: trimmedName,
          type: defaultType === 'INCOME' ? 'INCOME' : 'EXPENSE',
          icon: '🏷️',
          color: '#eff6ff',
        }),
      });

      const createdCat: CategoryItem = response.category;
      const createdSub: SubcategoryItem | undefined = response.subcategory;

      setLocalCategories((prev) => [...prev, createdCat]);
      if (createdSub) {
        setLocalSubcategories((prev) => [...prev, createdSub]);
      }

      if (onCategoryAdded) {
        onCategoryAdded(createdCat, createdSub);
      }

      setActiveCategory(createdCat);
      const firstSubId = createdSub ? createdSub.id : '';
      onSelect(createdCat.id, firstSubId);

      setIsAddingInline(false);
      setIsOpen(false);
      setInlineCatName('');
    } catch (err: any) {
      console.error('Failed to add category:', err);
      alert(err.message || 'Failed to add category');
    } finally {
      setIsSubmittingInline(false);
    }
  };

  const handleAddSubcategorySubmit = async (nameToAdd: string) => {
    const trimmedName = nameToAdd.trim();
    if (!trimmedName || !currentCategory || isSubmittingInlineSub) return;

    setIsSubmittingInlineSub(true);

    try {
      let createdSub: SubcategoryItem;

      try {
        const response = await apiFetch('/api/transactions/subcategories', {
          method: 'POST',
          body: JSON.stringify({
            categoryId: currentCategory.id,
            name: trimmedName,
            icon: '•',
          }),
        });
        createdSub = response;
      } catch (err) {
        console.warn('API call to create subcategory failed, using local creation fallback:', err);
        createdSub = {
          id: Math.random().toString(36).substring(2, 11),
          name: trimmedName,
          icon: '•',
          categoryId: currentCategory.id,
        };
      }

      setLocalSubcategories((prev) => [...prev, createdSub]);

      if (onSubcategoryAdded) {
        onSubcategoryAdded(createdSub);
      } else if (onCategoryAdded) {
        onCategoryAdded(currentCategory, createdSub);
      }

      onSelect(currentCategory.id, createdSub.id);

      setIsAddingInlineSub(false);
      setIsOpen(false);
      setInlineSubName('');
    } catch (err: any) {
      console.error('Failed to add subcategory:', err);
      alert(err.message || 'Failed to add subcategory');
    } finally {
      setIsSubmittingInlineSub(false);
    }
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
            onClick={() => {
              setIsOpen(false);
              setIsAddingInline(false);
              setIsAddingInlineSub(false);
            }}
          />
          <div className="category-picker-popover">
            {/* Search Header */}
            <div className="category-picker-search-container">
              <span className="category-picker-search-icon">🔍</span>
              <input
                type="text"
                className="category-picker-search-input"
                placeholder="Search or type new category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const trimmed = searchQuery.trim();
                    if (trimmed) {
                      const exactMatch = safeCategories.find(
                        (c) => c && c.name.toLowerCase() === trimmed.toLowerCase()
                      );
                      if (exactMatch) {
                        handleSelectCategoryDirect(exactMatch);
                      } else {
                        handleAddCategorySubmit(trimmed);
                      }
                    }
                  }
                }}
                autoFocus
              />
            </div>

            {/* 2-Column Body */}
            <div className="category-picker-body">
              {/* Left Column: CATEGORIES */}
              <div className="category-picker-col">
                <div className="category-picker-col-header">
                  <div className="category-picker-header-title">
                    <span>Categories</span>
                    <span className="category-picker-badge">{filteredCategories.length}</span>
                  </div>
                  {!isAddingInline && (
                    <button
                      type="button"
                      className="category-add-header-btn"
                      onClick={() => {
                        setInlineCatName(searchQuery.trim());
                        setIsAddingInline(true);
                      }}
                      title="Add unavailable category"
                    >
                      <span className="category-add-plus-icon">+</span> Add Category
                    </button>
                  )}
                </div>

                {/* Inline Add Category Input Box */}
                {isAddingInline && (
                  <div className="category-inline-add-box">
                    <input
                      type="text"
                      className="category-inline-add-input"
                      placeholder="Category name (e.g. Gym)..."
                      value={inlineCatName}
                      onChange={(e) => setInlineCatName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCategorySubmit(inlineCatName);
                        } else if (e.key === 'Escape') {
                          setIsAddingInline(false);
                        }
                      }}
                      autoFocus
                    />
                    <div className="category-inline-add-actions">
                      <button
                        type="button"
                        className="category-inline-cancel-btn"
                        onClick={() => setIsAddingInline(false)}
                        disabled={isSubmittingInline}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="category-inline-submit-btn"
                        onClick={() => handleAddCategorySubmit(inlineCatName)}
                        disabled={isSubmittingInline || !inlineCatName.trim()}
                      >
                        {isSubmittingInline ? 'Adding...' : 'Add'}
                      </button>
                    </div>
                  </div>
                )}

                <div className="category-picker-list">
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map((cat, idx) => {
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
                    })
                  ) : (
                    <div className="category-empty-state">
                      <p className="category-empty-text">
                        No category found {searchQuery ? `for "${searchQuery}"` : ''}
                      </p>
                      <button
                        type="button"
                        className="category-add-fallback-btn"
                        onClick={() => {
                          const trimmed = searchQuery.trim();
                          if (trimmed) {
                            handleAddCategorySubmit(trimmed);
                          } else {
                            setInlineCatName('');
                            setIsAddingInline(true);
                          }
                        }}
                      >
                        + Add {searchQuery ? `"${searchQuery}"` : 'Category'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: SUBCATEGORY */}
              <div className="category-picker-col">
                {currentCategory ? (
                  <>
                    <div className="category-picker-col-header">
                      <div
                        className="subcategory-panel-header"
                        onClick={() => handleSelectParentCategory(currentCategory)}
                        title="Click to select parent category"
                        style={{ cursor: 'pointer', flex: 1, marginBottom: 0 }}
                      >
                        <div className="subcategory-header-icon">
                          {currentCategory.icon || '🏷️'}
                        </div>
                        <div className="subcategory-header-text">
                          <span className="subcategory-header-label">Subcategory</span>
                          <span className="subcategory-header-title">{currentCategory.name}</span>
                        </div>
                      </div>
                      {!isAddingInlineSub && (
                        <button
                          type="button"
                          className="category-add-header-btn"
                          onClick={() => {
                            setInlineSubName('');
                            setIsAddingInlineSub(true);
                          }}
                          title="Add subcategory"
                        >
                          <span className="category-add-plus-icon">+</span> Subcategory
                        </button>
                      )}
                    </div>

                    {/* Inline Add Subcategory Input Box */}
                    {isAddingInlineSub && (
                      <div className="category-inline-add-box" style={{ marginTop: '8px', marginBottom: '8px' }}>
                        <input
                          type="text"
                          className="category-inline-add-input"
                          placeholder={`Subcategory name under ${currentCategory.name}...`}
                          value={inlineSubName}
                          onChange={(e) => setInlineSubName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddSubcategorySubmit(inlineSubName);
                            } else if (e.key === 'Escape') {
                              setIsAddingInlineSub(false);
                            }
                          }}
                          autoFocus
                        />
                        <div className="category-inline-add-actions">
                          <button
                            type="button"
                            className="category-inline-cancel-btn"
                            onClick={() => setIsAddingInlineSub(false)}
                            disabled={isSubmittingInlineSub}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="category-inline-submit-btn"
                            onClick={() => handleAddSubcategorySubmit(inlineSubName)}
                            disabled={isSubmittingInlineSub || !inlineSubName.trim()}
                          >
                            {isSubmittingInlineSub ? 'Adding...' : 'Add'}
                          </button>
                        </div>
                      </div>
                    )}

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
                          <button
                            type="button"
                            className="category-add-fallback-btn"
                            onClick={() => {
                              setInlineSubName('');
                              setIsAddingInlineSub(true);
                            }}
                          >
                            + Add Subcategory
                          </button>
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
