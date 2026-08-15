import type { TrendDataPoint } from "../../../types/dashboard";

interface DailySummaryProps {
  data?: TrendDataPoint[];
  currency?: string;
}

const formatCurrency = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
    notation: "compact",
  }).format(amount);

const formatDay = (date: string) =>
  new Intl.DateTimeFormat("en-US", {
    weekday: "short",
  }).format(new Date(`${date}T00:00:00`));

const DailySummary = ({
  data = [],
  currency = "USD",
}: DailySummaryProps) => {
  const totalIncome = data.reduce(
    (sum, point) => sum + point.income,
    0,
  );

  const totalExpenses = data.reduce(
    (sum, point) => sum + point.expenses,
    0,
  );

  const maxValue = Math.max(
    ...data.flatMap((point) => [
      point.income,
      point.expenses,
    ]),
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
            In{" "}
            <strong>
              {formatCurrency(totalIncome, currency)}
            </strong>
          </span>

          <span>
            Out{" "}
            <strong>
              {formatCurrency(totalExpenses, currency)}
            </strong>
          </span>
        </div>
      </div>

      <div className="daily-activity-card">
        {data.length === 0 ? (
          <div className="empty-state">
            No daily activity available
          </div>
        ) : (
          <div className="daily-activity-chart">
            {data.map((point) => (
              <div
                className="daily-activity-day"
                key={point.date}
              >
                <div className="daily-activity-bar-track">
                  <span
                    className="daily-activity-bar daily-activity-income"
                    style={{
                      height: `${(point.income / maxValue) * 100}%`,
                    }}
                    title={`Income: ${formatCurrency(
                      point.income,
                      currency,
                    )}`}
                    aria-label={`Income: ${formatCurrency(
                      point.income,
                      currency,
                    )}`}
                  />

                  <span
                    className="daily-activity-bar daily-activity-expense"
                    style={{
                      height: `${(point.expenses / maxValue) * 100}%`,
                    }}
                    title={`Expenses: ${formatCurrency(
                      point.expenses,
                      currency,
                    )}`}
                    aria-label={`Expenses: ${formatCurrency(
                      point.expenses,
                      currency,
                    )}`}
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