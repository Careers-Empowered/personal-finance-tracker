import React, { useState, useEffect } from 'react';
import type { Category } from './services/categoryProvider';

interface Decision {
  finalCategoryName: string;
  status: 'Accepted' | 'Overridden';
}

interface AcceptOverrideProps {
  suggestedCategory: {
    categoryId: string;
    categoryName: string;
    source: string;
  };
  categories: Category[];
  onDecision?: (decision: Decision) => void;
}

export default function AcceptOverride({
  suggestedCategory,
  categories,
  onDecision,
}: AcceptOverrideProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    suggestedCategory.categoryId
  );
  const [decision, setDecision] = useState<Decision | null>(null);

  // Keep state synchronized with new suggestions
  useEffect(() => {
    setSelectedCategoryId(suggestedCategory.categoryId);
    setDecision(null);
  }, [suggestedCategory]);

  const handleAccept = () => {
    const isOriginal = selectedCategoryId === suggestedCategory.categoryId;
    const matchedCategory = categories.find(
      (cat) => cat.id === selectedCategoryId
    );

    if (matchedCategory) {
      const finalDecision: Decision = {
        finalCategoryName: matchedCategory.name,
        status: isOriginal ? 'Accepted' : 'Overridden',
      };
      setDecision(finalDecision);
      if (onDecision) {
        onDecision(finalDecision);
      }
    }
  };

  const handleReset = () => {
    setDecision(null);
    setSelectedCategoryId(suggestedCategory.categoryId);
  };

  return (
    <div
      style={{
        marginTop: '1.5rem',
        padding: '1.5rem',
        backgroundColor: '#ffffff',
        border: '1px solid var(--color-divider)',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      }}
    >
      <h3
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.1rem',
          fontWeight: 600,
          color: 'var(--color-charcoal)',
          marginBottom: '1rem',
        }}
      >
        Verify Category
      </h3>

      {!decision ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <label
            htmlFor="category-select"
            style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--color-text-muted)',
            }}
          >
            Suggested Category
          </label>
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <select
              id="category-select"
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              style={{
                padding: '0.6rem 2rem 0.6rem 1rem',
                borderRadius: '8px',
                border: '1px solid var(--color-divider)',
                fontSize: '0.95rem',
                backgroundColor: '#ffffff',
                color: 'var(--color-text-dark)',
                minWidth: '220px',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <button
              onClick={handleAccept}
              style={{
                padding: '0.6rem 1.5rem',
                backgroundColor: 'var(--color-primary)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'background-color 0.2s',
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor =
                  'var(--color-primary-hover)')
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor =
                  'var(--color-primary)')
              }
            >
              Accept
            </button>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem',
            backgroundColor:
              decision.status === 'Accepted' ? '#eefbf4' : '#fefaf3',
            border: `1px solid ${
              decision.status === 'Accepted' ? '#cbf0d8' : '#faeccb'
            }`,
            borderRadius: '8px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem',
            }}
          >
            <div>
              <strong
                style={{
                  color: 'var(--color-text-muted)',
                  fontSize: '0.9rem',
                }}
              >
                Final Category:{' '}
              </strong>
              <span
                style={{
                  fontWeight: 600,
                  color: 'var(--color-text-dark)',
                }}
              >
                {decision.finalCategoryName}
              </span>
            </div>
            <div>
              <strong
                style={{
                  color: 'var(--color-text-muted)',
                  fontSize: '0.9rem',
                }}
              >
                Status:{' '}
              </strong>
              <span
                style={{
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  color:
                    decision.status === 'Accepted' ? '#146333' : '#734c00',
                }}
              >
                {decision.status}
              </span>
            </div>
          </div>

          <button
            onClick={handleReset}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-primary)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Change Decision
          </button>
        </div>
      )}
    </div>
  );
}
