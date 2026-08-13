interface CategorySpending {
  category: string;
  amount: number;
}
interface SpendingByCategoryProps {
  data?: CategorySpending[];
}

const chartColors = ["#d38333", "#5d8a68", "#4f5963", "#c77962", "#9a7b5f"];
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);

const SpendingByCategory = ({ data = [] }: SpendingByCategoryProps) => {
  const total = data.reduce((sum, item) => sum + item.amount, 0);
  let runningPercentage = 0;
  const segments = data.map((item, index) => {
    const percentage = total > 0 ? (item.amount / total) * 100 : 0;
    const start = runningPercentage;
    runningPercentage += percentage;
    return {
      ...item,
      percentage,
      color: chartColors[index % chartColors.length],
      start,
      end: runningPercentage,
    };
  });
  const gradient =
    segments.length > 0
      ? `conic-gradient(${segments.map((item) => `${item.color} ${item.start}% ${item.end}%`).join(", ")})`
      : "#f0ece8";

  return (
    <section className="dashboard-section">
      <div className="section-header">
        <div>
          <h2>Spending by category</h2>
          <p>A visual breakdown of where your money goes</p>
        </div>
      </div>
      <div className="category-chart">
        {data.length === 0 ? (
          <div className="empty-state">No spending data available</div>
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
                <strong>{formatCurrency(total)}</strong>
              </div>
            </div>
            <div className="category-legend">
              {segments.map((item) => (
                <div className="category-legend__item" key={item.category}>
                  <span
                    className="category-legend__dot"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="category-legend__name">{item.category}</span>
                  <strong>{formatCurrency(item.amount)}</strong>
                  <small>{item.percentage.toFixed(0)}%</small>
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
