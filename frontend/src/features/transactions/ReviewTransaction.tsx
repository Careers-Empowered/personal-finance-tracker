import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTransactionById, updateTransaction } from './services/transactionService';
import { MockCategoryProvider } from '../categorization/services/mockCategoryProvider';
import type { Category } from '../categorization/services/categoryProvider';
import type { Transaction } from './types';
import mockAccounts from '../accounts/mockData.json';

const categoryProvider = new MockCategoryProvider();

export default function ReviewTransaction() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Form fields
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [date, setDate] = useState('');
  const [account, setAccount] = useState('');
  const [notes, setNotes] = useState('');
  
  // Decision state: 'accept' or 'override'
  const [decision, setDecision] = useState<'accept' | 'override'>('accept');
  const [overrideCategory, setOverrideCategory] = useState('');

  // UI States
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Load transaction and category data
  useEffect(() => {
    categoryProvider.getCategories().then((cats) => {
      setCategories(cats);
    });

    if (id) {
      const tx = getTransactionById(id);
      if (tx) {
        setTransaction(tx);
        setTitle(tx.title);
        setAmount(tx.amount);
        setType(tx.type);
        setDate(tx.date);
        setAccount(tx.account);
        setNotes(tx.notes || '');
        
        // Initialize decision and override category
        if (tx.suggestedCategory) {
          if (tx.suggestionDecision === 'Overridden') {
            setDecision('override');
            setOverrideCategory(tx.category || '');
          } else {
            setDecision('accept');
            setOverrideCategory('');
          }
        } else {
          setDecision('override');
          setOverrideCategory(tx.category || '');
        }
      } else {
        setGeneralError('Transaction not found.');
      }
    }
  }, [id]);

  if (generalError || !transaction) {
    return (
      <div className="page-container" style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ backgroundColor: '#fff5f5', border: '1px solid #fcbdbd', borderRadius: '12px', padding: '2rem', textAlign: 'center' }}>
          <h2 style={{ color: '#c53030', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>Error</h2>
          <p style={{ color: '#742a2a', marginBottom: '1.5rem' }}>{generalError || 'Transaction could not be loaded.'}</p>
          <button 
            onClick={() => navigate('/transactions')}
            style={{
              padding: '0.6rem 1.5rem',
              backgroundColor: 'var(--color-primary)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Back to Transactions
          </button>
        </div>
      </div>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors([]);

    // Validation checks
    const errors: string[] = [];
    if (!title.trim()) {
      errors.push('Description/Title is required.');
    }
    if (amount === '' || isNaN(Number(amount)) || Number(amount) <= 0) {
      errors.push('Amount must be a valid number greater than 0.');
    }
    if (!date.trim() || isNaN(Date.parse(date))) {
      errors.push('A valid Date is required.');
    }
    if (!account.trim()) {
      errors.push('Account is required.');
    }

    let finalCategory = '';
    if (transaction.suggestedCategory && decision === 'accept') {
      finalCategory = transaction.suggestedCategory.categoryName;
    } else {
      if (!overrideCategory.trim()) {
        errors.push('Please select a Category (final category must be selected).');
      } else {
        const matched = categories.find(c => c.id === overrideCategory || c.name === overrideCategory);
        finalCategory = matched ? matched.name : overrideCategory;
      }
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSaving(true);

    setTimeout(() => {
      const updatedTx: Transaction = {
        ...transaction,
        title,
        amount: Number(amount),
        type,
        date,
        account,
        category: finalCategory,
        notes,
        suggestionDecision: transaction.suggestedCategory 
          ? (decision === 'accept' ? 'Accepted' : 'Overridden') 
          : null
      };

      updateTransaction(updatedTx);
      setIsSaving(false);
      setSuccessMsg('Transaction updated successfully!');

      setTimeout(() => {
        navigate('/transactions');
      }, 1000);
    }, 800);
  };

  return (
    <div className="page-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem 2rem 3rem 2rem' }}>
      <h1 className="page-title" style={{ marginBottom: '1.5rem' }}>Review Transaction</h1>

      {successMsg && (
        <div style={{
          backgroundColor: '#eefbf4',
          border: '1px solid #cbf0d8',
          color: '#146333',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          fontWeight: 600,
          textAlign: 'center'
        }}>
          {successMsg}
        </div>
      )}

      {validationErrors.length > 0 && (
        <div style={{
          backgroundColor: '#fff5f5',
          border: '1px solid #fcbdbd',
          color: '#c53030',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem'
        }}>
          <h4 style={{ marginBottom: '0.5rem', fontWeight: 600 }}>Please correct the following errors:</h4>
          <ul style={{ paddingLeft: '1.25rem', fontSize: '0.9rem' }}>
            {validationErrors.map((err, idx) => (
              <li key={idx} style={{ marginBottom: '0.25rem' }}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Suggested Category Card */}
        {transaction.suggestedCategory && (
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid var(--color-divider)',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
          }}>
            <h3 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.1rem',
              fontWeight: 600,
              color: 'var(--color-charcoal)',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              ✨ Suggested Category
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem',
              fontSize: '0.95rem'
            }}>
              <div>
                <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.85rem' }}>Transaction</span>
                <strong style={{ color: 'var(--color-text-dark)' }}>{transaction.title}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.85rem' }}>Category Suggestion</span>
                <strong style={{ color: 'var(--color-text-dark)' }}>{transaction.suggestedCategory.categoryName}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.85rem' }}>Source</span>
                <span style={{ 
                  backgroundColor: '#f1f3f4', 
                  padding: '0.2rem 0.6rem', 
                  borderRadius: '12px', 
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'var(--color-text-dark)'
                }}>
                  {transaction.suggestedCategory.source === 'RULE' ? 'Rule-Based' : 'SLM AI Model'}
                </span>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--color-divider)', paddingTop: '1.25rem' }}>
              <span style={{ 
                color: 'var(--color-text-muted)', 
                display: 'block', 
                fontSize: '0.85rem', 
                fontWeight: 600,
                marginBottom: '0.75rem' 
              }}>
                Category Decision
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem', 
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: decision === 'accept' ? 600 : 400
                }}>
                  <input 
                    type="radio" 
                    name="categoryDecision" 
                    checked={decision === 'accept'} 
                    onChange={() => setDecision('accept')}
                    style={{
                      accentColor: 'var(--color-primary)',
                      width: '18px',
                      height: '18px'
                    }}
                  />
                  Accept suggested category ({transaction.suggestedCategory.categoryName})
                </label>

                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem', 
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: decision === 'override' ? 600 : 400
                }}>
                  <input 
                    type="radio" 
                    name="categoryDecision" 
                    checked={decision === 'override'} 
                    onChange={() => setDecision('override')}
                    style={{
                      accentColor: 'var(--color-primary)',
                      width: '18px',
                      height: '18px'
                    }}
                  />
                  Override suggested category
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Form panel */}
        <form onSubmit={handleSave} style={{
          backgroundColor: '#ffffff',
          border: '1px solid var(--color-divider)',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}>
          
          <h3 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.1rem',
            fontWeight: 600,
            color: 'var(--color-charcoal)',
            marginBottom: '0.5rem',
            borderBottom: '1px solid var(--color-divider)',
            paddingBottom: '0.5rem'
          }}>
            Transaction Details
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {/* Description */}
            <div>
              <label htmlFor="title-input" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.35rem' }}>
                Description
              </label>
              <input 
                id="title-input"
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Green tree restaurant"
                style={inputStyle}
              />
            </div>

            {/* Amount */}
            <div>
              <label htmlFor="amount-input" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.35rem' }}>
                Amount (₹)
              </label>
              <input 
                id="amount-input"
                type="number" 
                step="any"
                value={amount} 
                onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 850"
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
            {/* Type */}
            <div>
              <label htmlFor="type-select" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.35rem' }}>
                Type
              </label>
              <select 
                id="type-select"
                value={type} 
                onChange={(e) => setType(e.target.value as 'income' | 'expense')}
                style={inputStyle}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>

            {/* Date */}
            <div>
              <label htmlFor="date-input" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.35rem' }}>
                Date
              </label>
              <input 
                id="date-input"
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)}
                style={inputStyle}
              />
            </div>

            {/* Account */}
            <div>
              <label htmlFor="account-select" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.35rem' }}>
                Account
              </label>
              <select 
                id="account-select"
                value={account} 
                onChange={(e) => setAccount(e.target.value)}
                style={inputStyle}
              >
                <option value="">Select Account</option>
                {mockAccounts.map(acc => (
                  <option key={acc.id} value={acc.name}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Override Select */}
          {(decision === 'override' || !transaction.suggestedCategory) && (
            <div style={{
              backgroundColor: '#fafbfc',
              border: '1px solid var(--color-divider)',
              borderRadius: '8px',
              padding: '1.25rem',
              marginTop: '0.5rem',
              animation: 'fadeIn 0.2s ease'
            }}>
              <label htmlFor="category-select" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-dark)', marginBottom: '0.35rem' }}>
                Final Category
              </label>
              <select 
                id="category-select"
                value={overrideCategory} 
                onChange={(e) => setOverrideCategory(e.target.value)}
                style={inputStyle}
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Notes */}
          <div>
            <label htmlFor="notes-textarea" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.35rem' }}>
              Notes
            </label>
            <textarea 
              id="notes-textarea"
              value={notes} 
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add extra information..."
              rows={3}
              style={{
                ...inputStyle,
                resize: 'vertical'
              }}
            />
          </div>

          {/* Form Actions */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '1rem',
            borderTop: '1px solid var(--color-divider)',
            paddingTop: '1.5rem',
            marginTop: '1rem'
          }}>
            <button 
              type="button" 
              onClick={() => navigate('/transactions')}
              disabled={isSaving}
              style={{
                padding: '0.65rem 1.5rem',
                backgroundColor: '#f1f3f4',
                color: 'var(--color-text-dark)',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.95rem',
                transition: 'background-color 0.2s'
              }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSaving}
              style={{
                padding: '0.65rem 1.75rem',
                backgroundColor: isSaving ? 'var(--color-secondary)' : 'var(--color-primary)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                fontSize: '0.95rem',
                transition: 'background-color 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.65rem 0.85rem',
  borderRadius: '8px',
  border: '1px solid var(--color-divider)',
  fontSize: '0.95rem',
  backgroundColor: '#ffffff',
  color: 'var(--color-text-dark)',
  outline: 'none',
  fontFamily: 'var(--font-body)',
  boxSizing: 'border-box'
};
