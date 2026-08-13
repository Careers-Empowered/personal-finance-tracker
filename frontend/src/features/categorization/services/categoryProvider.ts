export interface Category {
  id: string;
  name: string;
}

export interface CategoryProvider {
  getCategories(): Promise<Category[]>;
}