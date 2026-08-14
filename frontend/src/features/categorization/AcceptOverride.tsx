import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Category } from './services/categoryProvider';
import { updateTransaction, getTransactionById } from '../transactions/services/transactionService';
import type { Transaction } from '../transactions/types';

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
  transactionId?: string;
  transactionTitle?: string;
}

export default function AcceptOverride({
  suggestedCategory,
  categories: _categories,
  onDecision,
  transactionId,
  transactionTitle = 'Manual Test Transaction',
}: AcceptOverrideProps) {
  const navigate = useNavigate();
  const [decision, setDecision] = useState<Decision | null>(null);

  // Sync decision with transaction if transactionId is provided
  useEffect(() => {
    if (transactionId) {
      const tx = getTransactionById(transactionId);
      if (tx && tx.suggestionDecision) {
        setDecision({
          finalCategoryName: tx.category || '',
          status: tx.suggestionDecision
        });
      }
    } else {
      setDecision(null);
    }
  }, [transactionId, suggestedCategory]);

  const handleAccept = () => {
    const finalDecision: Decision = {
      finalCategoryName: suggestedCategory.categoryName,
      status: 'Accepted',
    };

    const id = transactionId || `tx_slm_${Date.now()}`;
    const tx = getTransactionById(id) || {
      id,
      date: new Date().toISOString().split('T')[0],
      title: transactionTitle,
      amount: 500,
      type: 'expense',
      account: 'Checking Account',
      notes: 'Created from suggestion auto-test',
    };

    const updatedTx: Transaction = {
      ...tx,
      category: suggestedCategory.categoryName,
      suggestedCategory: {
        categoryId: suggestedCategory.categoryId,
        categoryName: suggestedCategory.categoryName,
        source: suggestedCategory.source as 'model' | 'RULE',
      },
      suggestionDecision: 'Accepted',
    };

    updateTransaction(updatedTx);
    setDecision(finalDecision);

    if (onDecision) {
      onDecision(finalDecision);
    }
  };

  const handleEditOverride = () => {
    const id = transactionId || `tx_slm_${Date.now()}`;
    const tx = getTransactionById(id);

    if (!tx) {
      // Create temp transaction in local storage first
      const tempTx: Transaction = {
        id,
        date: new Date().toISOString().split('T')[0],
        title: transactionTitle,
        amount: 500,
        type: 'expense',
        account: 'Checking Account',
        category: '',
        notes: 'Created from suggestion auto-test',
        suggestedCategory: {
          categoryId: suggestedCategory.categoryId,
          categoryName: suggestedCategory.categoryName,
          source: suggestedCategory.source as 'model' | 'RULE',
        },
        suggestionDecision: null,
      };
      updateTransaction(tempTx);
    }

    navigate(`/transactions/${id}/review`);
  };

  const handleReset = () => {
    setDecision(null);
    if (transactionId) {
      const tx = getTransactionById(transactionId);
      if (tx) {
        updateTransaction({
          ...tx,
          category: '',
          suggestionDecision: null
        });
      }
    }
  };

  if (!decision) {
    return (
      <div
        style={{
          marginTop: '1.25rem',
          padding: '1.25rem',
          backgroundColor: '#fafbfc',
          border: '1px solid var(--color-divider)',
          borderRadius: '10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}
      >
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
          Verify Category Decision:
        </span>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handleAccept}
            style={{
              padding: '0.55rem 1.25rem',
              backgroundColor: 'var(--color-primary)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem',
              transition: 'background-color 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-primary)')}
          >
            ✓ Accept
          </button>

          <button
            onClick={handleEditOverride}
            style={{
              padding: '0.55rem 1.25rem',
              backgroundColor: '#f1f3f4',
              color: 'var(--color-text-dark)',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem',
              transition: 'background-color 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#e4e6e7')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#f1f3f4')}
          >
            Edit / Override
          </button>
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
        border: '1px solid var(--color-divider)',
        borderRadius: '10px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1rem',
          backgroundColor: decision.status === 'Accepted' ? '#eefbf4' : '#fefaf3',
          border: `1px solid ${decision.status === 'Accepted' ? '#cbf0d8' : '#faeccb'}`,
          borderRadius: '8px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <div>
            <strong style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Final Category: </strong>
            <span style={{ fontWeight: 600, color: 'var(--color-text-dark)', fontSize: '0.9rem' }}>{decision.finalCategoryName}</span>
          </div>
          <div>
            <strong style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Status: </strong>
            <span
              style={{
                fontWeight: 700,
                fontSize: '0.8rem',
                color: decision.status === 'Accepted' ? '#146333' : '#734c00',
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
    </div>
  );
}
