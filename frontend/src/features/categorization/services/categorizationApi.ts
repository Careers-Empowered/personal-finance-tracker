import type { Category } from './categoryProvider';

export interface CategorizationResponse {
  category: Category;
  status: 'Accepted' | 'Overridden';
}

export const categorizationApi = {
  acceptCategory: async (
    description: string,
    category: Category
  ): Promise<CategorizationResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (description.toLowerCase().includes('fail')) {
      throw new Error('API Error: Failed to accept category suggestion.');
    }

    return {
      category,
      status: 'Accepted',
    };
  },

  overrideCategory: async (
    description: string,
    category: Category
  ): Promise<CategorizationResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (description.toLowerCase().includes('fail')) {
      throw new Error('API Error: Failed to save user category override.');
    }

    return {
      category,
      status: 'Overridden',
    };
  },
};
