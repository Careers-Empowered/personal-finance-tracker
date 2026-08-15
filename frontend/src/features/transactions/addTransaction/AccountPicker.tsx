import React, { useState, useRef, useEffect } from 'react';
import { Account } from '../../accounts/types';
import './AccountPicker.css';

interface AccountPickerProps {
  value: string;
  onChange: (accountId: string) => void;
  accounts?: Account[];
  required?: boolean;
}

export const AccountPicker: React.FC<AccountPickerProps> = ({
  value,
  onChange,
  accounts = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedAccount = accounts.find((acc) => acc.id === value);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filteredAccounts = accounts.filter((acc) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return acc.name.toLowerCase().includes(q) || (acc.currency && acc.currency.toLowerCase().includes(q));
  });

  const handleSelectAccount = (accountId: string) => {
    onChange(accountId);
    setIsOpen(false);
  };

  const triggerLabel = selectedAccount ? selectedAccount.name : 'Select Account';
  const triggerBadge = selectedAccount?.currency || 'INR';

  return (
    <div className="account-picker-container" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        className={`account-picker-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="account-picker-trigger-content">
          <span className="account-picker-trigger-icon">🏦</span>
          <span>{triggerLabel}</span>
          {selectedAccount && (
            <span className="account-picker-trigger-badge">{triggerBadge}</span>
          )}
        </div>
        <span className="account-picker-trigger-caret">▲</span>
      </button>

      {/* Popover Dropdown Panel */}
      {isOpen && (
        <div className="account-picker-popover">
          {/* Search Filter */}
          {accounts.length > 4 && (
            <div className="account-picker-search-container">
              <span className="account-picker-search-icon">🔍</span>
              <input
                type="text"
                className="account-picker-search-input"
                placeholder="Search account..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
          )}

          {/* Account List */}
          <div className="account-picker-list">
            {filteredAccounts.map((acc) => {
              const isSelected = acc.id === value;

              return (
                <div
                  key={acc.id}
                  className={`account-item-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelectAccount(acc.id)}
                >
                  <div className="account-item-left">
                    <div className="account-icon-box">🏦</div>
                    <div className="account-item-info">
                      <div className="account-item-name-row">
                        <span className="account-item-title">{acc.name}</span>
                        <span className="account-currency-badge">{acc.currency || 'INR'}</span>
                      </div>
                    </div>
                  </div>
                  {isSelected && <span className="account-checkmark">✓</span>}
                </div>
              );
            })}

            {filteredAccounts.length === 0 && (
              <div style={{ padding: '12px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                No accounts found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountPicker;
