interface CategorySpending {
  category: string;
  amount: number;
}

interface SpendingByCategoryProps {
  data?: CategorySpending[];
  currency?: string;
}

const chartColors = [
  "#d38333",
  "#5d8a68",
  "#4f5963",
  "#c77962",
  "#9a7b5f",
  "#8b6f9c",
];

const MAX_CATEGORIES = 5;

const formatCurrency = (
  amount: number,
  currency: string,
) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);

const SpendingByCategory = ({
  data = [],
  currency = "USD",
}: SpendingByCategoryProps) => {
  // Sort categories by highest spending
  const sortedData = [...data].sort(
    (a, b) => b.amount - a.amount,
  );

  // Keep top 5 categories
  const topCategories = sortedData.slice(
    0,
    MAX_CATEGORIES,
  );

  // Combine remaining categories
  const remainingCategories = sortedData.slice(
    MAX_CATEGORIES,
  );

  const othersAmount = remainingCategories.reduce(
    (sum, item) => sum + item.amount,
    0,
  );

  // Final data used for chart
  const chartData =
    othersAmount > 0
      ? [
          ...topCategories,
          {
            category: "Others",
            amount: othersAmount,
          },
        ]
      : topCategories;

  const total = chartData.reduce(
    (sum, item) => sum + item.amount,
    0,
  );

  let runningPercentage = 0;

  const segments = chartData.map((item, index) => {
    const percentage =
      total > 0
        ? (item.amount / total) * 100
        : 0;

    const start = runningPercentage;

    runningPercentage += percentage;

    return {
      ...item,
      percentage,
      color:
        chartColors[index % chartColors.length],
      start,
      end: runningPercentage,
    };
  });

  const gradient =
    segments.length > 0
      ? `conic-gradient(${segments
          .map(
            (item) =>
              `${item.color} ${item.start}% ${item.end}%`,
          )
          .join(", ")})`
      : "#f0ece8";

  return (
    <section className="dashboard-section">
      <div className="section-header">
        <div>
          <h2>Spending by category</h2>
          <p>
            A visual breakdown of where your money goes
          </p>
        </div>
      </div>

      <div className="category-chart">
        {chartData.length === 0 ? (
          <div className="empty-state">
            No spending data available
          </div>
        ) : (
          <div className="category-pie-layout">
            <div
              className="category-pie"
              style={{ background: gradient }}
              role="img"
              aria-label="Spending by category pie chart"
            >
              <div className="category-pie__center">
                <span>Total spent</span>

                <strong>
                  {formatCurrency(total, currency)}
                </strong>
              </div>
            </div>

            <div className="category-legend">
              {segments.map((item) => (
                <div
                  className="category-legend__item"
                  key={item.category}
                >
                  <span
                    className="category-legend__dot"
                    style={{
                      backgroundColor: item.color,
                    }}
                  />

                  <span className="category-legend__name">
                    {item.category}
                  </span>

                  <strong>
                    {formatCurrency(
                      item.amount,
                      currency,
                    )}
                  </strong>

                  <small>
                    {item.percentage.toFixed(0)}%
                  </small>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default SpendingByCategory;