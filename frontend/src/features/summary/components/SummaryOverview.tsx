import React from 'react';
import styles from '../Summary.module.css';
import { SummaryCard } from './SummaryCard';

const WalletIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
  </svg>
);

const ArrowDownRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m7 7 10 10" />
    <path d="M17 7v10H7" />
  </svg>
);

const ArrowUpRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 17 17 7" />
    <path d="M7 7h10v10" />
  </svg>
);

interface SummaryOverviewProps {
  balance: number;
  incoming: number;
  outgoing: number;
}

export const SummaryOverview: React.FC<SummaryOverviewProps> = ({ balance, incoming, outgoing }) => {
  return (
    <div className={styles.overviewGrid}>
      <SummaryCard 
        title="Balance" 
        value={balance} 
        icon={<WalletIcon />} 
      />
      <SummaryCard 
        title="Incoming" 
        value={incoming} 
        icon={<ArrowDownRightIcon />} 
        variant="success" 
      />
      <SummaryCard 
        title="Outgoing" 
        value={outgoing} 
        icon={<ArrowUpRightIcon />} 
        variant="danger" 
      />
    </div>
  );
};
