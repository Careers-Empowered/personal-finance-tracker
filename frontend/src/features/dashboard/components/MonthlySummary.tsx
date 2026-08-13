import type { SummaryData } from "../types/dashboard";

interface MonthlySummaryProps {
  data: SummaryData;
  title?: string;
  description?: string;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
};

const MonthlySummary = ({ data, title = "Monthly Summary", description = "This month's financial activity" }: MonthlySummaryProps) => {
  return (
    <section className="dashboard-section dashboard-section--monthly">
      <div className="section-header">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>

      <div className="summary-grid summary-grid--featured">
        <div className="summary-card summary-card--income">
          <span>Income</span>
          <h3>{formatCurrency(data.income)}</h3>
        </div>

        <div className="summary-card summary-card--expense">
          <span>Expenses</span>
          <h3>{formatCurrency(data.expenses)}</h3>
        </div>

        <div className="summary-card summary-card--balance">
          <span>Balance</span>
          <h3>{formatCurrency(data.balance)}</h3>
        </div>

        <div className="summary-card">
          <span>Transactions</span>
          <h3>{data.transactionCount}</h3>
        </div>
      </div>
    </section>
  );
};

export default MonthlySummary;
