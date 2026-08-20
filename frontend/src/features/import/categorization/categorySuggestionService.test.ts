import { describe, expect, it, vi, beforeEach } from 'vitest';
import { suggestCategory } from './categorySuggestionService';
import { suggestCategoryByRules } from './ruleCategorizationService';
import { CategorySuggestionService as SLMCategorySuggestionService } from '../slm/slmService';

// Mock the rule engine and SLM service
vi.mock('./ruleCategorizationService', () => ({
  suggestCategoryByRules: vi.fn(),
}));

describe('categorySuggestionService', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return rule engine suggestion directly if one matches', async () => {
    // 1. Mock rule engine to return a match
    const mockRuleResult = { category: 'Food & Dining', source: 'RULE' as const, confidence: 1 };
    vi.mocked(suggestCategoryByRules).mockReturnValue(mockRuleResult);

    // 2. Spy on SLM suggestion service prototype to verify it is NOT called
    const slmSpy = vi.spyOn(SLMCategorySuggestionService.prototype, 'suggestCategory');

    const result = await suggestCategory('Swiggy Order', 'expense');

    // Expectations
    expect(suggestCategoryByRules).toHaveBeenCalledWith('Swiggy Order', 'expense');
    expect(slmSpy).not.toHaveBeenCalled(); // SLM should be bypassed
    expect(result).toEqual(mockRuleResult);
  });

  it('should fall back to SLM suggestion when no rule matches', async () => {
    // 1. Mock rule engine to return null (no match)
    vi.mocked(suggestCategoryByRules).mockReturnValue(null);

    // 2. Mock SLM service to return a category
    const slmSpy = vi
      .spyOn(SLMCategorySuggestionService.prototype, 'suggestCategory')
      .mockResolvedValue('Transportation');

    const result = await suggestCategory('Shell Fuel Station', 'expense');

    // Expectations
    expect(suggestCategoryByRules).toHaveBeenCalledWith('Shell Fuel Station', 'expense');
    expect(slmSpy).toHaveBeenCalledWith('Shell Fuel Station', 'expense');
    expect(result).toEqual({
      category: 'Transportation',
      source: 'SLM',
    });
  });

  it('should return null if both rule engine and SLM fail to suggest a category', async () => {
    // 1. Mock rule engine to return null
    vi.mocked(suggestCategoryByRules).mockReturnValue(null);

    // 2. Mock SLM to return null
    const slmSpy = vi
      .spyOn(SLMCategorySuggestionService.prototype, 'suggestCategory')
      .mockResolvedValue(null);

    const result = await suggestCategory('Unknown item', 'expense');

    // Expectations
    expect(result).toBeNull();
    expect(slmSpy).toHaveBeenCalled();
  });
});