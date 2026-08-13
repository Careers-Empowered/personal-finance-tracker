import {
  Category,
  CreateCategoryFormData,
} from "../category-create/categoryTypes";

export interface EditCategoryProps {
  category: Category;
  onSave: (
    category: Category,
    formData: CreateCategoryFormData
  ) => void;
  onCancel: () => void;
}