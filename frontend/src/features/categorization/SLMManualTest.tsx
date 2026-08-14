import { useState, useEffect } from 'react';
import { CategorySuggestionService } from './services/slmService';
import { MockCategoryProvider } from './services/mockCategoryProvider';
import { QwenProvider } from './services/qwenProvider';
import type { Category } from './services/categoryProvider';
import AcceptOverride from './AcceptOverride';

const categoryProvider = new MockCategoryProvider();
const qwenProvider = new QwenProvider();

const suggestionService = new CategorySuggestionService(
  categoryProvider,
  qwenProvider
);

export default function SLMManualTest() {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const [result, setResult] = useState<{
    categoryId: string;
    categoryName: string;
    source: string;
  } | null>(null);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    categoryProvider.getCategories().then((data) => {
      setCategories(data);
    });
  }, []);

  const handleSuggest = async () => {
    setResult(null);
    setError(null);

    if (!description.trim()) {
      setError('Please enter a transaction description.');
      return;
    }

    setLoading(true);

    try {
      const suggestion =
        await suggestionService.suggestCategory(
          description
        );

      if (!suggestion) {
        setError(
          'No valid category suggestion was returned.'
        );
        return;
      }

      setResult(suggestion);
    } catch (err) {
      console.error('SLM error:', err);

      setError(
        err instanceof Error
          ? err.message
          : 'SLM suggestion failed.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '2rem',
      }}
    >
      <h1>SLM Category Auto-Suggestion</h1>

      <p>
        Enter a transaction description and let the
        local Qwen3-0.6B model suggest a category.
      </p>

      <div style={{ marginTop: '2rem' }}>
        <label
          htmlFor="transaction-description"
          style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: 600,
          }}
        >
          Transaction Description
        </label>

        <textarea
          id="transaction-description"
          value={description}
          onChange={(event) => {
            setDescription(event.target.value);
            setResult(null);
            setError(null);
          }}
          placeholder="Example: Payment at Green Leaf Cafe"
          rows={4}
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '8px',
            border: '1px solid #ccc',
            fontSize: '1rem',
            resize: 'vertical',
          }}
        />
      </div>

      <button
        onClick={handleSuggest}
        disabled={loading}
        style={{
          marginTop: '1rem',
          padding: '0.75rem 1.5rem',
          border: 'none',
          borderRadius: '8px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontWeight: 600,
        }}
      >
        {loading ? 'Running Qwen3...' : 'Suggest Category'}
      </button>

      {loading && (
        <p style={{ marginTop: '1rem' }}>
          Running the local Qwen3-0.6B model...
        </p>
      )}

      {result && (
        <div
          style={{
            marginTop: '2rem',
            padding: '1.5rem',
            border: '1px solid #ccc',
            borderRadius: '10px',
          }}
        >
          <h2>Suggested Category</h2>

          <p>
            <strong>Transaction:</strong>{' '}
            {description}
          </p>

          <p>
            <strong>Category:</strong>{' '}
            {result.categoryName}
          </p>

          <p>
            <strong>Category ID:</strong>{' '}
            {result.categoryId}
          </p>

          <p>
            <strong>Source:</strong>{' '}
            {result.source}
          </p>

          <AcceptOverride
            suggestedCategory={result}
            categories={categories}
            transactionTitle={description}
            onDecision={(decision) => {
              console.log('User decision:', decision);
            }}
          />
        </div>
      )}

      {error && (
        <div
          style={{
            marginTop: '2rem',
            padding: '1rem',
            border: '1px solid red',
            borderRadius: '8px',
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
}