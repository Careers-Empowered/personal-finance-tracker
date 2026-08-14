import {
  SLM_CATEGORIES,
} from '../data/slmCategories';

import type { SLMProvider } from './qwenProvider';

import type { CategorySuggestion } from '../types/suggestion';

const SLM_ENABLED =
  import.meta.env.VITE_ENABLE_SLM_CATEGORY_SUGGESTION ===
  'true';

export class CategorySuggestionService {
  constructor(
    private readonly slmProvider: SLMProvider
  ) {}

  async suggestCategory(
    description: string
  ): Promise<CategorySuggestion | null> {
    if (!SLM_ENABLED) {
      return null;
    }

    if (!description || !description.trim()) {
      return null;
    }

    try {
      const modelResponse =
        await this.slmProvider.suggestCategory(
          description.trim(),
          SLM_CATEGORIES
        );

      console.log(
        'SLM model response:',
        modelResponse
      );

      if (!modelResponse) {
        return null;
      }

      const normalizedResponse =
        normalize(modelResponse);

      // Never accept these as categories.
      if (
        normalizedResponse === 'expense' ||
        normalizedResponse === 'income'
      ) {
        console.warn(
          'SLM returned a transaction type:',
          modelResponse
        );

        return null;
      }

      // Validate against our allowed categories.
      const matchedCategory =
        SLM_CATEGORIES.find(
          (category) =>
            normalize(category.name) ===
            normalizedResponse
        );

      if (!matchedCategory) {
        console.warn(
          'SLM returned an invalid category:',
          modelResponse
        );

        return null;
      }

      return {
        category: matchedCategory.name,
        source: 'SLM',
        confidence: 0.8,
      };
    } catch (error) {
      console.error(
        'SLM category suggestion failed:',
        error
      );

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