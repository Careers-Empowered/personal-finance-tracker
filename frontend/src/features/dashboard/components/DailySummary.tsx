import type { TrendDataPoint } from "../types/dashboard";

interface DailySummaryProps {
  data?: TrendDataPoint[];
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
    notation: "compact",
  }).format(amount);

const formatDay = (date: string) =>
  new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(
    new Date(`${date}T00:00:00`),
  );

const DailySummary = ({ data = [] }: DailySummaryProps) => {
  const totalIncome = data.reduce((sum, point) => sum + point.income, 0);
  const totalExpenses = data.reduce((sum, point) => sum + point.expenses, 0);
  const maxValue = Math.max(
    ...data.flatMap((point) => [point.income, point.expenses]),
    1,
  );

  return (
    <section className="dashboard-section">
      <div className="section-header">
        <div>
          <h2>Daily activity</h2>
          <p>Your income and spending over the last seven days</p>
        </div>
        <div className="daily-activity-totals">
          <span>
            In <strong>{formatCurrency(totalIncome)}</strong>
          </span>
          <span>
            Out <strong>{formatCurrency(totalExpenses)}</strong>
          </span>
        </div>
      </div>
      <div className="daily-activity-card">
        {data.length === 0 ? (
          <div className="empty-state">No daily activity available</div>
        ) : (
          <div className="daily-activity-chart">
            {data.map((point) => (
              <div className="daily-activity-day" key={point.date}>
                <div className="daily-activity-bar-track">
                  <span
                    className="daily-activity-bar daily-activity-income"
                    style={{ height: `${(point.income / maxValue) * 100}%` }}
                    title={`Income: ${formatCurrency(point.income)}`}
                    aria-label={`Income: ${formatCurrency(point.income)}`}
                  />
                  <span
                    className="daily-activity-bar daily-activity-expense"
                    style={{ height: `${(point.expenses / maxValue) * 100}%` }}
                    title={`Expenses: ${formatCurrency(point.expenses)}`}
                    aria-label={`Expenses: ${formatCurrency(point.expenses)}`}
                  />
                </div>
                <span className="daily-activity-label">
                  {formatDay(point.date)}
                </span>
              </div>
            ))}
          </div>
        )}
        <div className="daily-activity-legend">
          <span>
            <i className="daily-activity-legend__income" />
            Income
          </span>
          <span>
            <i className="daily-activity-legend__expense" />
            Expenses
          </span>
        </div>
      </div>
    </section>
  );
};

export default DailySummary;
