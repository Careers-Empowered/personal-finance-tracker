import type { CategoryProvider } from './categoryProvider';
import type { SLMProvider } from './qwenProvider';
import { redactTransactionDescription } from './redactionService';
import type { CategorySuggestion } from '../types/suggestion';

const SLM_ENABLED =
  import.meta.env.VITE_ENABLE_SLM_CATEGORY_SUGGESTION === 'true';

export class CategorySuggestionService {
  constructor(
    private readonly categoryProvider: CategoryProvider,
    private readonly slmProvider: SLMProvider
  ) {}

  async suggestCategory(
    description: string
  ): Promise<CategorySuggestion | null> {
    // Feature flag
    if (!SLM_ENABLED) {
      return null;
    }

    // Empty description
    if (!description || !description.trim()) {
      return null;
    }

    // Get categories from provider
    const categories =
      await this.categoryProvider.getCategories();

    if (categories.length === 0) {
      return null;
    }

    // Remove unnecessary sensitive information
    const sanitizedDescription =
      redactTransactionDescription(description);

    if (!sanitizedDescription) {
      return null;
    }

    try {
      // Ask the SLM
      const suggestedCategory =
        await this.slmProvider.suggestCategory(
          sanitizedDescription,
          categories
        );

      if (!suggestedCategory) {
        return null;
      }

      // Validate model output against supplied categories
      const matchedCategory = categories.find(
        (category) =>
          normalize(category.name) ===
          normalize(suggestedCategory)
      );

      if (!matchedCategory) {
        console.warn(
          'SLM returned an invalid category:',
          suggestedCategory
        );

        return null;
      }

      return {
        categoryId: matchedCategory.id,
        categoryName: matchedCategory.name,
        source: 'model',
      };
    } catch (error) {
      console.error(
        'SLM category suggestion failed:',
        error
      );

      // Model failure must not crash the application.
      return null;
    }
  }
}

function normalize(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}