import React from 'react';
import styles from '../Summary.module.css';

interface PeriodSummaryItem {
  period: string;
  incoming: number;
  outgoing: number;
}

interface PeriodSummaryProps {
  data: PeriodSummaryItem[];
}

export const PeriodSummary: React.FC<PeriodSummaryProps> = ({ data }) => {
  const formatValue = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  return (
    <div className="page-card">
      <h3 className={styles.chartTitle}>Period Summary</h3>
      <div className={styles.periodList}>
        {data.map((item, index) => (
          <div key={index} className={styles.periodItem}>
            <span className={styles.periodName}>{item.period}</span>
            <div className={styles.periodStats}>
              <div>
                <div className={styles.statLabel}>Incoming</div>
                <div className={`${styles.statValue} ${styles.successText}`}>{formatValue(item.incoming)}</div>
              </div>
              <div>
                <div className={styles.statLabel}>Outgoing</div>
                <div className={`${styles.statValue} ${styles.dangerText}`}>{formatValue(item.outgoing)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
