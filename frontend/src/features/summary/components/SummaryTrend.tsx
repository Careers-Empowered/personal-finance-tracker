import React from 'react';
import styles from '../Summary.module.css';

interface TrendItem {
  date: string;
  balance: number;
}

interface SummaryTrendProps {
  data: TrendItem[];
}

export const SummaryTrend: React.FC<SummaryTrendProps> = ({ data }) => {
  const maxBalance = Math.max(...data.map(d => d.balance));

  return (
    <div className="page-card">
      <h3 className={styles.chartTitle}>Balance Trend</h3>
      <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '8px', marginTop: '24px' }}>
        {data.map((item, index) => {
          const heightPercent = (item.balance / maxBalance) * 100;
          return (
            <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, height: '100%', justifyContent: 'flex-end', gap: '8px' }}>
              <div 
                style={{ 
                  width: '100%', 
                  maxWidth: '40px', 
                  height: `${heightPercent}%`, 
                  backgroundColor: 'var(--color-primary)', 
                  borderTopLeftRadius: '4px',
                  borderTopRightRadius: '4px',
                  opacity: 0.8,
                  transition: 'height 0.3s ease'
                }} 
                title={`${item.date}: $${item.balance}`}
              />
              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{item.date.split(' ')[1]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
