export type TransactionType = "expense" | "income";

export interface SubcategoryOption {
  id: string;
  name: string;
  icon: string;
}

export interface CategoryOption {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
  subcategories: SubcategoryOption[];
}

export interface CategorySelectorProps {
  type: TransactionType;
  selectedCategory?: CategoryOption | null;
  selectedSubcategory?: SubcategoryOption | null;
  onCategoryChange?: (category: CategoryOption) => void;
  onSubcategoryChange?: (subcategory: SubcategoryOption) => void;
  onCreateCategory?: () => void;
  onCreateSubcategory?: (category: CategoryOption) => void;
  disabled?: boolean;
}