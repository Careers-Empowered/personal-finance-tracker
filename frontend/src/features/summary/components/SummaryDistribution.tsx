import React from 'react';
import styles from '../Summary.module.css';

interface DistributionItem {
  name: string;
  value: number;
  color: string;
}

interface SummaryDistributionProps {
  data: DistributionItem[];
}

export const SummaryDistribution: React.FC<SummaryDistributionProps> = ({ data }) => {
  const total = data.reduce((acc, item) => acc + item.value, 0);

  return (
    <div className="page-card">
      <h3 className={styles.chartTitle}>Distribution</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
        {data.map((item, index) => (
          <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-dark)', fontWeight: 500 }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: item.color }} />
                <span>{item.name}</span>
              </div>
              <span style={{ fontWeight: 600, color: 'var(--color-text-dark)' }}>
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.value)}
              </span>
            </div>
            <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--color-divider)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ height: '100%', backgroundColor: item.color, width: `${(item.value / total) * 100}%`, borderRadius: '4px' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
