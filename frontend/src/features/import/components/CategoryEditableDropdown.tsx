import React, { useState, useEffect, useRef } from "react";
import { apiFetch } from "../../../shared/utils/api";

interface CategoryOption {
  id?: string;
  name: string;
  type?: string;
  icon?: string;
  color?: string;
  transactionCount?: number;
}

interface CategoryEditableDropdownProps {
  value: string;
  onChange: (newValue: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}

// Fallback categories if database query is loading or empty
const DEFAULT_CATEGORIES: CategoryOption[] = [
  { name: "Food & Dining", icon: "🍔" },
  { name: "Transportation", icon: "🚗" },
  { name: "Housing & Rent", icon: "🏠" },
  { name: "Utilities", icon: "⚡" },
  { name: "Shopping", icon: "🛍️" },
  { name: "Entertainment", icon: "🎬" },
  { name: "Health & Fitness", icon: "🏥" },
  { name: "Income", icon: "💰" },
  { name: "Salary", icon: "💵" },
  { name: "Investments", icon: "📈" },
  { name: "Miscellaneous", icon: "🏷️" },
];

export const CategoryEditableDropdown: React.FC<CategoryEditableDropdownProps> = ({
  value,
  onChange,
  placeholder = "Select or type category...",
  style = {},
}) => {
  const [categories, setCategories] = useState<CategoryOption[]>(DEFAULT_CATEGORIES);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filterQuery, setFilterQuery] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch categories AND all available transactions from DB on mount
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      apiFetch("/api/transactions/categories").catch(() => []),
      apiFetch("/api/transactions?limit=10000").catch(() => []),
    ])
      .then(([catData, txData]) => {
        if (!isMounted) return;

        const categoryMap = new Map<string, CategoryOption>();

        // 1. Process category master list from DB
        if (Array.isArray(catData)) {
          catData.forEach((cat: any) => {
            if (cat && cat.name) {
              const key = cat.name.trim().toLowerCase();
              categoryMap.set(key, {
                id: cat.id,
                name: cat.name.trim(),
                type: cat.type,
                icon: cat.icon || "🏷️",
                color: cat.color,
                transactionCount: 0,
              });
            }
          });
        }

        // 2. Process all available transactions in DB to aggregate categories and usage counts
        const rawTxs = Array.isArray(txData)
          ? txData
          : Array.isArray((txData as any)?.data)
          ? (txData as any).data
          : [];

        if (Array.isArray(rawTxs)) {
          rawTxs.forEach((tx: any) => {
            if (!tx) return;

            // Extract category name from transaction
            const catName =
              typeof tx.category === "object"
                ? tx.category?.name
                : typeof tx.category === "string"
                ? tx.category
                : tx.categoryName;

            if (catName && typeof catName === "string" && catName.trim()) {
              const key = catName.trim().toLowerCase();
              const existing = categoryMap.get(key);
              if (existing) {
                existing.transactionCount = (existing.transactionCount || 0) + 1;
              } else {
                categoryMap.set(key, {
                  name: catName.trim(),
                  type: tx.type,
                  icon: "🏷️",
                  transactionCount: 1,
                });
              }
            }

            // Extract subcategory name if present
            const subName =
              typeof tx.subcategory === "object"
                ? tx.subcategory?.name
                : typeof tx.subcategory === "string"
                ? tx.subcategory
                : tx.subcategoryName;

            if (subName && typeof subName === "string" && subName.trim()) {
              const subKey = subName.trim().toLowerCase();
              if (!categoryMap.has(subKey)) {
                categoryMap.set(subKey, {
                  name: subName.trim(),
                  type: tx.type,
                  icon: "📂",
                  transactionCount: 1,
                });
              } else {
                const subExisting = categoryMap.get(subKey)!;
                subExisting.transactionCount = (subExisting.transactionCount || 0) + 1;
              }
            }
          });
        }

        // 3. Add default categories if missing
        DEFAULT_CATEGORIES.forEach((def) => {
          const key = def.name.toLowerCase();
          if (!categoryMap.has(key)) {
            categoryMap.set(key, { ...def, transactionCount: 0 });
          }
        });

        // Convert map to array and sort by transaction usage count descending
        const combinedList = Array.from(categoryMap.values()).sort((a, b) => {
          return (b.transactionCount || 0) - (a.transactionCount || 0);
        });

        setCategories(combinedList);
      })
      .catch((err) => {
        console.error("Failed to fetch categories or transactions from DB:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setFilterQuery(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter categories only when user actively types in a query
  const filteredCategories = filterQuery && filterQuery.trim() !== ""
    ? categories.filter((cat) =>
        cat.name.toLowerCase().includes(filterQuery.trim().toLowerCase())
      )
    : categories;

  const exactMatchExists = categories.some(
    (cat) => cat.name.toLowerCase() === (value || "").trim().toLowerCase()
  );

  const handleSelect = (categoryName: string) => {
    onChange(categoryName);
    setIsOpen(false);
    setFilterQuery(null);
  };

  const handleOpenDropdown = () => {
    setIsOpen(true);
    setFilterQuery(""); // Reset filter query to show all DB categories on click
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        minWidth: "180px",
        flex: 1,
        display: "inline-block",
        ...style,
      }}
    >
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          value={value || ""}
          onChange={(e) => {
            onChange(e.target.value);
            setFilterQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={handleOpenDropdown}
          onClick={handleOpenDropdown}
          placeholder={placeholder}
          style={{
            width: "100%",
            minWidth: "160px",
            padding: "0.6rem 2.2rem 0.6rem 0.85rem",
            fontSize: "0.9rem",
            fontFamily: "inherit",
            border: "1px solid var(--color-divider, #e2e8f0)",
            borderRadius: "8px",
            backgroundColor: "#ffffff",
            color: "var(--color-text-dark, #1e293b)",
            outline: "none",
            boxSizing: "border-box",
            transition: "border-color 0.2s, box-shadow 0.2s",
          }}
        />

        {/* Dropdown toggle arrow icon */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (isOpen) {
              setIsOpen(false);
              setFilterQuery(null);
            } else {
              handleOpenDropdown();
            }
          }}
          tabIndex={-1}
          style={{
            position: "absolute",
            right: "0.5rem",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "0.75rem",
            color: "var(--color-text-muted, #64748b)",
            padding: "0.3rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          title="Toggle category list"
        >
          {isOpen ? "▲" : "▼"}
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            minWidth: "260px",
            maxHeight: "240px",
            overflowY: "auto",
            overflowX: "hidden",
            backgroundColor: "#ffffff",
            border: "1px solid var(--color-divider, #e2e8f0)",
            borderRadius: "8px",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
            zIndex: 9999,
            padding: "0.35rem 0",
          }}
        >
          {loading && categories.length === 0 ? (
            <div
              style={{
                padding: "0.6rem 0.85rem",
                fontSize: "0.85rem",
                color: "var(--color-text-muted, #64748b)",
              }}
            >
              Loading categories...
            </div>
          ) : (
            <>
              {filteredCategories.map((cat, idx) => (
                <div
                  key={cat.id || `${cat.name}-${idx}`}
                  onClick={() => handleSelect(cat.name)}
                  style={{
                    padding: "0.55rem 0.85rem",
                    fontSize: "0.88rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    color: "var(--color-text-dark, #1e293b)",
                    backgroundColor:
                      value?.toLowerCase() === cat.name.toLowerCase()
                        ? "#f1f5f9"
                        : "transparent",
                    transition: "background-color 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f8fafc";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor =
                      value?.toLowerCase() === cat.name.toLowerCase()
                        ? "#f1f5f9"
                        : "transparent";
                  }}
                >
                  <span style={{ fontSize: "1rem" }}>{cat.icon || "🏷️"}</span>
                  <span style={{ fontWeight: 500, flex: 1 }}>{cat.name}</span>
                </div>
              ))}

              {/* Option to add custom category if typed text doesn't exactly match an existing category */}
              {value?.trim() && !exactMatchExists && (
                <div
                  onClick={() => handleSelect(value.trim())}
                  style={{
                    padding: "0.65rem 0.85rem",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    color: "var(--color-primary, #2563eb)",
                    borderTop: "1px solid var(--color-divider, #f1f5f9)",
                    fontWeight: 600,
                    backgroundColor: "#f8fafc",
                  }}
                >
                  <span>➕</span>
                  <span>Add custom category: &quot;{value.trim()}&quot;</span>
                </div>
              )}

              {filteredCategories.length === 0 && !value?.trim() && (
                <div
                  style={{
                    padding: "0.6rem 0.85rem",
                    fontSize: "0.85rem",
                    color: "var(--color-text-muted, #64748b)",
                  }}
                >
                  No matching categories found
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryEditableDropdown;
