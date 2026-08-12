import React from 'react';
import styles from '../Summary.module.css';

interface SummaryToggleProps {
  value: 'incoming' | 'outgoing';
  onChange: (value: 'incoming' | 'outgoing') => void;
}

export const SummaryToggle: React.FC<SummaryToggleProps> = ({ value, onChange }) => {
  return (
    <div className={styles.toggleContainer}>
      <button 
        className={`${styles.toggleButton} ${value === 'incoming' ? styles.active : ''}`}
        onClick={() => onChange('incoming')}
      >
        Incoming
      </button>
      <button 
        className={`${styles.toggleButton} ${value === 'outgoing' ? styles.active : ''}`}
        onClick={() => onChange('outgoing')}
      >
        Outgoing
      </button>
    </div>
  );
};
