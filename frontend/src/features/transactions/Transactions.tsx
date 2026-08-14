import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTransactions, resetMockData } from './services/transactionService';
import type { Transaction } from './types';

const Transactions: React.FC = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    setTransactions(getTransactions());
  }, []);

  const handleResetData = () => {
    const freshData = resetMockData();
    setTransactions(freshData);
    setSuccessMsg('Demo transactions have been reset to their initial state.');
    setTimeout(() => {
      setSuccessMsg(null);
    }, 3000);
  };

  return (
    <div className="page-container" style={{ paddingBottom: '3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Transactions</h1>
        
        <button
          onClick={handleResetData}
          style={{
            padding: '0.55rem 1rem',
            backgroundColor: '#ffffff',
            border: '1px solid var(--color-divider)',
            borderRadius: '8px',
            color: 'var(--color-secondary)',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-primary)';
            e.currentTarget.style.color = 'var(--color-primary)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-divider)';
            e.currentTarget.style.color = 'var(--color-secondary)';
          }}
        >
          🔄 Reset Demo Data
        </button>
      </div>

      {successMsg && (
        <div style={{
          backgroundColor: '#eefbf4',
          border: '1px solid #cbf0d8',
          color: '#146333',
          padding: '0.85rem 1.25rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          fontWeight: 600,
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>{successMsg}</span>
          <button 
            onClick={() => setSuccessMsg(null)}
            style={{ background: 'none', border: 'none', color: '#146333', cursor: 'pointer', fontWeight: 'bold' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Transaction List Table */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid var(--color-divider)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-divider)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.15rem',
            fontWeight: 600,
            color: 'var(--color-charcoal)',
            margin: 0
          }}>
            All Transactions
          </h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
            {transactions.length} transactions total
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#fafafa', borderBottom: '1px solid var(--color-divider)' }}>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Description</th>
                <th style={thStyle}>Account</th>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Category</th>
                <th style={thStyle}>Amount</th>
                <th style={thStyle}>Status</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => {
                const hasPendingSuggestion = tx.suggestedCategory && !tx.suggestionDecision;
                
                return (
                  <tr 
                    key={tx.id} 
                    style={{ 
                      borderBottom: '1px solid var(--color-divider)',
                      backgroundColor: hasPendingSuggestion ? '#fffefc' : '#ffffff',
                      transition: 'background-color 0.15s'
                    }}
                  >
                    <td style={tdStyle}>{tx.date}</td>
                    <td style={tdStyle}>
                      <div>
                        <strong style={{ color: 'var(--color-text-dark)' }}>{tx.title}</strong>
                        {tx.notes && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.15rem' }}>
                            {tx.notes}
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={tdStyle}>{tx.account}</td>
                    <td style={tdStyle}>
                      <span style={{
                        textTransform: 'capitalize',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: tx.type === 'income' ? '#188038' : '#b42318',
                        backgroundColor: tx.type === 'income' ? '#eefbf4' : '#fff1f0',
                        padding: '0.15rem 0.45rem',
                        borderRadius: '6px'
                      }}>
                        {tx.type}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      {tx.category ? (
                        <span style={{
                          fontWeight: 500,
                          backgroundColor: '#f1f3f4',
                          color: 'var(--color-text-dark)',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '6px',
                          fontSize: '0.85rem'
                        }}>
                          {tx.category}
                        </span>
                      ) : (
                        <span style={{ fontStyle: 'italic', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                          Uncategorized
                        </span>
                      )}
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 700 }}>
                      {tx.type === 'expense' ? '-' : '+'}₹{tx.amount}
                    </td>
                    <td style={tdStyle}>
                      {hasPendingSuggestion ? (
                        <span style={{
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          color: 'var(--color-primary)',
                          backgroundColor: '#fff7ed',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '6px',
                          border: '1px solid #fed7aa',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          ✨ Suggested: {tx.suggestedCategory?.categoryName}
                        </span>
                      ) : tx.suggestionDecision ? (
                        <span style={{
                          fontSize: '0.8rem',
                          fontWeight: 500,
                          color: tx.suggestionDecision === 'Accepted' ? '#188038' : 'var(--color-secondary)',
                          backgroundColor: tx.suggestionDecision === 'Accepted' ? '#eefbf4' : '#f1f3f4',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          {tx.suggestionDecision === 'Accepted' ? '✓ Accepted Suggestion' : '✎ Overridden'}
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                          Standard
                        </span>
                      )}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      <button
                        onClick={() => navigate(`/transactions/${tx.id}/review`)}
                        style={{
                          padding: '0.4rem 0.75rem',
                          backgroundColor: 'transparent',
                          color: 'var(--color-primary)',
                          border: '1px solid var(--color-primary)',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                          e.currentTarget.style.color = '#ffffff';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--color-primary)';
                        }}
                      >
                        {hasPendingSuggestion ? 'Review' : 'Edit'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const thStyle: React.CSSProperties = {
  padding: '1rem 1.5rem',
  fontSize: '0.85rem',
  fontWeight: 600,
  color: 'var(--color-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
};

const tdStyle: React.CSSProperties = {
  padding: '1.1rem 1.5rem',
  fontSize: '0.92rem',
  verticalAlign: 'middle',
  color: 'var(--color-text-dark)'
};

export default Transactions;
