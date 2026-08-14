export type CategoryType = "expense" | "income";

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
  isCustom: boolean;
}

export interface CreateCategoryFormData {
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
}

export interface CreateCategoryProps {
  categories?: Category[];
  onCategoryCreate?: (category: Category) => void;
}