import {
  SLM_CATEGORIES,
} from './slmCategories';

import type { SLMProvider } from './qwenProvider';

const SLM_ENABLED =
  import.meta.env.VITE_ENABLE_SLM_CATEGORY_SUGGESTION !== 'false';

export class CategorySuggestionService {
  constructor(
    private readonly slmProvider: SLMProvider
  ) {}

  async suggestCategory(
  description: string,
  type: 'income' | 'expense'
): Promise<string | null> {
    if (!SLM_ENABLED) {
      return null;
    }

    if (!description?.trim()) {
      return null;
    }

    try {
      const modelResponse =
  await this.slmProvider.suggestCategory(
    description.trim(),
    SLM_CATEGORIES,
    type
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

      if (
        normalizedResponse === 'expense' ||
        normalizedResponse === 'income'
      ) {
        return null;
      }

      const matchedCategory =
  SLM_CATEGORIES.find(
    (category) =>
      category.type === type &&
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

      return matchedCategory.name;
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