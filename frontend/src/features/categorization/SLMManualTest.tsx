import { useState } from 'react';

import { CategorySuggestionService } from './services/slmService';
import { QwenProvider } from './services/qwenProvider';

const qwenProvider = new QwenProvider();

const suggestionService =
  new CategorySuggestionService(qwenProvider);

export default function SLMManualTest() {
  const [description, setDescription] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [result, setResult] = useState<{
    category: string;
    source: string;
    confidence: number;
  } | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const handleSuggest = async () => {
    setResult(null);
    setError(null);

    if (!description.trim()) {
      setError(
        'Please enter a transaction description.'
      );
      return;
    }

    setLoading(true);

    try {
      console.log(
        'Sending description to SLM:',
        description
      );

      const suggestion =
        await suggestionService.suggestCategory(
          description
        );

      console.log(
        'SLM suggestion:',
        suggestion
      );

      if (!suggestion) {
        setError(
          'No valid category suggestion was returned.'
        );
        return;
      }

      setResult(suggestion);
    } catch (error) {
      console.error(
        'SLM suggestion failed:',
        error
      );

      setError(
        error instanceof Error
          ? error.message
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
      <h1>
        SLM Category Auto-Suggestion
      </h1>

      <p>
        Enter a transaction description and
        let Qwen3-0.6B suggest a category.
      </p>

      <div
        style={{
          marginTop: '2rem',
        }}
      >
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
          placeholder="Example: Paid rent for apartment"
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
          cursor: loading
            ? 'not-allowed'
            : 'pointer',
          fontWeight: 600,
        }}
      >
        {loading
          ? 'Running Qwen3...'
          : 'Suggest Category'}
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
          <h2>
            Suggested Category
          </h2>

          <p>
            <strong>
              Transaction:
            </strong>{' '}
            {description}
          </p>

          <p>
            <strong>
              Category:
            </strong>{' '}
            {result.category}
          </p>

          <p>
            <strong>
              Source:
            </strong>{' '}
            {result.source}
          </p>

          <p>
            <strong>
              Confidence:
            </strong>{' '}
            {result.confidence}
          </p>
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
          <strong>Error:</strong>{' '}
          {error}
        </div>
      )}
    </div>
  );
}