import React, { useState } from 'react';
import styles from './Summary.module.css';
import { mockSummaryData } from './summary.mock';
import { SummaryOverview } from './components/SummaryOverview';
import { SummaryToggle } from './components/SummaryToggle';
import { SummaryDistribution } from './components/SummaryDistribution';
import { SummaryTrend } from './components/SummaryTrend';
import { PeriodSummary } from './components/PeriodSummary';

const CalendarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px' }}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const Summary: React.FC = () => {
  const [distributionType, setDistributionType] = useState<'incoming' | 'outgoing'>('outgoing');

  // In a real app, distribution data would change based on the toggle. 
  // Here we use the same mock data for visual purposes.
  const distributionData = mockSummaryData.distribution;

  return (
    <div className="page-container">
      <header className={styles.header}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Summary</h1>
        <div className={styles.dateSelector}>
          <CalendarIcon />
          <button>
            {mockSummaryData.period}
            <ChevronDownIcon />
          </button>
        </div>
      </header>

      <SummaryOverview 
        balance={mockSummaryData.balance}
        incoming={mockSummaryData.incoming}
        outgoing={mockSummaryData.outgoing}
      />

      <div className={styles.chartsGrid}>
        <div>
          <SummaryToggle value={distributionType} onChange={setDistributionType} />
          <SummaryDistribution data={distributionData} />
        </div>
        <SummaryTrend data={mockSummaryData.trend} />
      </div>

      <div className={styles.chartsGrid}>
        <PeriodSummary data={mockSummaryData.periodSummaries} />
      </div>
    </div>
  );
};

export default Summary;