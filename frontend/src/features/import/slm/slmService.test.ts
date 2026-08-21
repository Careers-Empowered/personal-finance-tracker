import { describe, expect, it, vi, beforeEach } from 'vitest';
import { CategorySuggestionService } from './slmService';
import { SLMProvider } from './qwenProvider';
import { SLM_CATEGORIES } from './slmCategories';

describe('CategorySuggestionService', () => {
  let mockProvider: SLMProvider;
  let service: CategorySuggestionService;

  beforeEach(() => {
    // Create a mock provider
    mockProvider = {
      suggestCategory: vi.fn(),
    };
    service = new CategorySuggestionService(mockProvider);
  });

  it('should return null immediately if description is empty or whitespace', async () => {
    const resultEmpty = await service.suggestCategory('', 'expense');
    const resultWhitespace = await service.suggestCategory('   ', 'expense');

    expect(resultEmpty).toBeNull();
    expect(resultWhitespace).toBeNull();
    expect(mockProvider.suggestCategory).not.toHaveBeenCalled();
  });

  it('should return the standard category name when provider returns an exact match', async () => {
    vi.spyOn(mockProvider, 'suggestCategory').mockResolvedValue('Food & Dining');

    const result = await service.suggestCategory('Zomato Order', 'expense');
    expect(result).toBe('Food & Dining');
    expect(mockProvider.suggestCategory).toHaveBeenCalledWith(
      'Zomato Order',
      SLM_CATEGORIES,
      'expense'
    );
  });

  it('should successfully normalize and match category names case-insensitively', async () => {
    // Mock provider returning mixed casing and trailing spaces
    vi.spyOn(mockProvider, 'suggestCategory').mockResolvedValue('  transportation  ');

    const result = await service.suggestCategory('Uber ride', 'expense');
    // Normalized to exact name "Transportation" from SLM_CATEGORIES
    expect(result).toBe('Transportation');
  });

  it('should return null if the provider returns a type like "expense" or "income"', async () => {
    vi.spyOn(mockProvider, 'suggestCategory').mockResolvedValue('expense');

    const result = await service.suggestCategory('Some transaction', 'expense');
    expect(result).toBeNull();
  });

  it('should return null and warn console if the category is not present in SLM_CATEGORIES', async () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(mockProvider, 'suggestCategory').mockResolvedValue('Groceries & Supermarket');

    const result = await service.suggestCategory('Reliance Fresh shopping', 'expense');
    
    expect(result).toBeNull();
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'SLM returned an invalid category:',
      'Groceries & Supermarket'
    );
    
    consoleWarnSpy.mockRestore();
  });

  it('should handle provider errors gracefully and return null', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(mockProvider, 'suggestCategory').mockRejectedValue(new Error('Model loading error'));

    const result = await service.suggestCategory('Netflix subscription', 'expense');
    
    expect(result).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalled();
    
    consoleErrorSpy.mockRestore();
  });
});