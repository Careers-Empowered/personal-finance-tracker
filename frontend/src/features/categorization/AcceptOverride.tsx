import { categorizationApi } from './services/categorizationApi';
import type { Category } from './services/categoryProvider';

interface AcceptOverrideProps {
  suggestedCategory: {
    categoryId: string;
    categoryName: string;
    source: string;
  };
  categories: Category[];
  selectedCategory: Category | null;
  setSelectedCategory: (category: Category | null) => void;
  categorizationStatus: 'Pending' | 'Accepted' | 'Overridden';
  setCategorizationStatus: (status: 'Pending' | 'Accepted' | 'Overridden') => void;
  saving: boolean;
  setSaving: (saving: boolean) => void;
  transactionDescription: string;
  setError: (err: string | null) => void;
}

export default function AcceptOverride({
  suggestedCategory,
  categories,
  selectedCategory,
  setSelectedCategory,
  categorizationStatus,
  setCategorizationStatus,
  saving,
  setSaving,
  transactionDescription,
  setError,
}: AcceptOverrideProps) {

  const handleAccept = async () => {
    if (!selectedCategory) return;
    setSaving(true);
    setError(null);
    try {
      const isOriginal = selectedCategory.id === suggestedCategory.categoryId;
      const response = isOriginal
        ? await categorizationApi.acceptCategory(
            transactionDescription,
            selectedCategory
          )
        : await categorizationApi.overrideCategory(
            transactionDescription,
            selectedCategory
          );
      setSelectedCategory(response.category);
      setCategorizationStatus(response.status);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to save category decision.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setCategorizationStatus('Pending');
    setError(null);
  };

  if (categorizationStatus === 'Pending') {
    return (
      <div
        style={{
          marginTop: '1.25rem',
          padding: '1.25rem',
          backgroundColor: '#fafbfc',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <span
          style={{
            fontSize: '0.85rem',
            fontWeight: 600,
            color: '#718096',
          }}
        >
          Verify Category
        </span>
        
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          <label
            htmlFor="category-select"
            style={{
              fontSize: '0.85rem',
              color: '#718096',
            }}
          >
            Suggested Category: {selectedCategory?.name || ''}
          </label>
          
          <div
            style={{
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'center',
            }}
          >
            <select
              id="category-select"
              value={selectedCategory?.id || ''}
              onChange={(e) => {
                const matched = categories.find((cat) => cat.id === e.target.value);
                setSelectedCategory(matched || null);
              }}
              disabled={saving}
              style={{
                padding: '0.5rem 2rem 0.5rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                backgroundColor: '#ffffff',
                color: '#1e293b',
                minWidth: '200px',
                outline: 'none',
                cursor: saving ? 'not-allowed' : 'pointer',
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
              disabled={saving}
              style={{
                padding: '0.5rem 1.25rem',
                backgroundColor: '#d38333',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem',
                opacity: saving ? 0.7 : 1,
                transition: 'background-color 0.2s',
              }}
              onMouseOver={(e) => !saving && (e.currentTarget.style.backgroundColor = '#b26a24')}
              onMouseOut={(e) => !saving && (e.currentTarget.style.backgroundColor = '#d38333')}
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        marginTop: '1.25rem',
        padding: '1.25rem',
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1rem',
          backgroundColor: categorizationStatus === 'Accepted' ? '#eefbf4' : '#fefaf3',
          border: `1px solid ${categorizationStatus === 'Accepted' ? '#cbf0d8' : '#faeccb'}`,
          borderRadius: '8px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <div>
            <strong style={{ color: '#718096', fontSize: '0.85rem' }}>Final Category: </strong>
            <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>{selectedCategory?.name}</span>
          </div>
          <div>
            <strong style={{ color: '#718096', fontSize: '0.85rem' }}>Status: </strong>
            <span
              style={{
                fontWeight: 700,
                fontSize: '0.8rem',
                color: categorizationStatus === 'Accepted' ? '#146333' : '#734c00',
              }}
            >
              {categorizationStatus}
            </span>
          </div>
        </div>

        <button
          onClick={handleReset}
          disabled={saving}
          style={{
            background: 'none',
            border: 'none',
            color: '#d38333',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: saving ? 'not-allowed' : 'pointer',
            textDecoration: 'underline',
            opacity: saving ? 0.7 : 1,
          }}
        >
          Change Decision
        </button>
      </div>
    </div>
  );
}
