export const mockSummaryData = {
  period: 'August 2026',
  balance: 14500.75,
  incoming: 21000.50,
  outgoing: 6499.75,
  distribution: [
    { name: 'Housing', value: 2500, color: '#ef4444' },
    { name: 'Food', value: 800, color: '#f59e0b' },
    { name: 'Transport', value: 400, color: '#3b82f6' },
    { name: 'Entertainment', value: 300, color: '#8b5cf6' },
    { name: 'Utilities', value: 250, color: '#10b981' },
    { name: 'Other', value: 249.75, color: '#64748b' }
  ],
  trend: [
    { date: 'Aug 1', balance: 10000 },
    { date: 'Aug 5', balance: 11000 },
    { date: 'Aug 10', balance: 10500 },
    { date: 'Aug 15', balance: 12000 },
    { date: 'Aug 20', balance: 11800 },
    { date: 'Aug 25', balance: 13500 },
    { date: 'Aug 30', balance: 14500.75 },
  ],
  periodSummaries: [
    { period: 'July 2026', incoming: 20000, outgoing: 7000 },
    { period: 'June 2026', incoming: 19500, outgoing: 6800 },
    { period: 'May 2026', incoming: 19000, outgoing: 6500 },
  ]
};
