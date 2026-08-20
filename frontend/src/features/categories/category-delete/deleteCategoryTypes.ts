import { Category } from "../category-create/categoryTypes";

export interface DeleteCategoryProps {
  category: Category;
  onDelete: (categoryId: string) => void;
  onCancel: () => void;
}