import type { Category } from "../../category-create/categoryTypes";

export interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
}

export type { Category };