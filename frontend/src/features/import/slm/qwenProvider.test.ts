import { describe, expect, it, vi, beforeEach } from 'vitest';
import { QwenProvider } from './qwenProvider';
import { CategorySuggestionService } from './slmService';
import { SLM_CATEGORIES } from './slmCategories';

// Mock the Hugging Face transformers pipeline to avoid downloading the 0.6B ONNX model during tests
const mockPipelineGenerator = vi.fn();
vi.mock('@huggingface/transformers', () => ({
  pipeline: vi.fn(() => Promise.resolve(mockPipelineGenerator)),
}));

describe('QwenProvider & CategorySuggestionService', () => {
  let provider: QwenProvider;
  let service: CategorySuggestionService;

  beforeEach(() => {
    vi.clearAllMocks();
    provider = new QwenProvider();
    service = new CategorySuggestionService(provider);
  });

  describe('QwenProvider - Output Parsing and Cleaning', () => {
    
    it('should extract category from a chat-format assistant response structure', async () => {
      // Mock the model returning the assistant message in chat structure
      mockPipelineGenerator.mockResolvedValue([
        {
          generated_text: [
            { role: 'assistant', content: '  Food & Dining  ' }
          ]
        }
      ]);

      const result = await provider.suggestCategory('Lunch at Subway', SLM_CATEGORIES, 'expense');
      expect(result).toBe('Food & Dining');
    });

    it('should extract category from a flat string response structure', async () => {
      // Mock the model returning a plain string response
      mockPipelineGenerator.mockResolvedValue([
        {
          generated_text: '  Transportation  '
        }
      ]);

      const result = await provider.suggestCategory('Uber cab ride', SLM_CATEGORIES, 'expense');
      expect(result).toBe('Transportation');
    });

    it('should strip out thinking blocks <think>...</think> from the output', async () => {
      mockPipelineGenerator.mockResolvedValue([
        {
          generated_text: `<think>
Analyzing transaction:
"Swiggy" is food delivery.
Category should be Food & Dining.
</think>
Food & Dining`
        }
      ]);

      const result = await provider.suggestCategory('Swiggy Order', SLM_CATEGORIES, 'expense');
      expect(result).toBe('Food & Dining');
    });

    it('should strip out incomplete thinking blocks', async () => {
      mockPipelineGenerator.mockResolvedValue([
        {
          generated_text: `Food & Dining <think>Analyzing transaction`
        }
      ]);

      const result = await provider.suggestCategory('Swiggy Order', SLM_CATEGORIES, 'expense');
      expect(result).toBe('Food & Dining');
    });

    it('should strip common prefixes like "category:" and "answer:" and clean surrounding punctuation', async () => {
      mockPipelineGenerator.mockResolvedValue([
        {
          generated_text: 'category: "Salary".'
        }
      ]);

      const result = await provider.suggestCategory('Monthly paycheck', SLM_CATEGORIES, 'income');
      expect(result).toBe('Salary');
    });

    it('should select only the first non-empty line of the output', async () => {
      mockPipelineGenerator.mockResolvedValue([
        {
          generated_text: '\n\nShopping\nExtra Explanation line'
        }
      ]);

      const result = await provider.suggestCategory('Amazon checkout', SLM_CATEGORIES, 'expense');
      expect(result).toBe('Shopping');
    });

    it('should return null if the pipeline output structure is empty or invalid', async () => {
      mockPipelineGenerator.mockResolvedValue([]);

      const result = await provider.suggestCategory('Invalid description', SLM_CATEGORIES, 'expense');
      expect(result).toBeNull();
    });
  });

  describe('CategorySuggestionService Integration', () => {

    it('should return the correct category name matching SLM_CATEGORIES', async () => {
      vi.spyOn(provider, 'suggestCategory').mockResolvedValue('Food & Dining');

      const suggestion = await service.suggestCategory('Subway Dinner', 'expense');
      expect(suggestion).toBe('Food & Dining');
    });

    it('should match categories case-insensitively', async () => {
      // Model returned lowercase "salary"
      vi.spyOn(provider, 'suggestCategory').mockResolvedValue('salary');

      const suggestion = await service.suggestCategory('Paycheck', 'income');
      // Should successfully map to the standard category "Salary"
      expect(suggestion).toBe('Salary');
    });

    it('should return null if the provider suggests a category not present in SLM_CATEGORIES', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.spyOn(provider, 'suggestCategory').mockResolvedValue('Unknown Category Name');

      const suggestion = await service.suggestCategory('Some weird payment', 'expense');
      expect(suggestion).toBeNull();
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });
  });
});