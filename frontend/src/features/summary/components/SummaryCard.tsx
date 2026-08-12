import React from 'react';
import styles from '../Summary.module.css';

interface SummaryCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  variant?: 'default' | 'success' | 'danger';
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon, variant = 'default' }) => {
  const formattedValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);

  const valueClass = variant === 'success' ? styles.successText : variant === 'danger' ? styles.dangerText : '';

  return (
    <div className="page-card">
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>{title}</h3>
        {icon}
      </div>
      <p className={`${styles.cardValue} ${valueClass}`}>{formattedValue}</p>
    </div>
  );
};
