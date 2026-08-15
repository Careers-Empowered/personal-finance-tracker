import type {
  Account,
  CategorySpending,
  SummaryData,
} from "../../../types/dashboard";

interface FinancialInsightsProps {
  account?: Account;
  summary: SummaryData;
  spendingByCategory: CategorySpending[];
}

const formatCurrency = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);

const FinancialInsights = ({
  account,
  summary,
  spendingByCategory,
}: FinancialInsightsProps) => {
  const currency = account?.currency ?? "USD";

  const netCashFlow = summary.income - summary.expenses;

  const savingsRate =
    summary.income > 0
      ? (netCashFlow / summary.income) * 100
      : 0;

  const expenseRatio =
    summary.income > 0
      ? (summary.expenses / summary.income) * 100
      : 0;

  const topCategory =
    spendingByCategory.length > 0
      ? spendingByCategory.reduce((highest, current) =>
          current.amount > highest.amount ? current : highest,
        )
      : null;

  const insights: {
    title: string;
    description: string;
    type: "positive" | "warning" | "neutral";
  }[] = [];

  // Cash flow insight
  if (netCashFlow > 0) {
    insights.push({
      title: "Positive cash flow",
      description: `You earned ${formatCurrency(
        summary.income,
        currency,
      )} and spent ${formatCurrency(
        summary.expenses,
        currency,
      )} this period.`,
      type: "positive",
    });
  } else if (netCashFlow < 0) {
    insights.push({
      title: "Negative cash flow",
      description: `Your expenses exceeded your income by ${formatCurrency(
        Math.abs(netCashFlow),
        currency,
      )}.`,
      type: "warning",
    });
  } else {
    insights.push({
      title: "Balanced cash flow",
      description:
        "Your income and expenses are currently equal.",
      type: "neutral",
    });
  }

  // Savings rate insight
  if (summary.income > 0) {
    if (savingsRate >= 20) {
      insights.push({
        title: "Strong savings rate",
        description: `You're keeping ${savingsRate.toFixed(
          1,
        )}% of your income after expenses.`,
        type: "positive",
      });
    } else if (savingsRate > 0) {
      insights.push({
        title: "Room to save more",
        description: `Your current savings rate is ${savingsRate.toFixed(
          1,
        )}%.`,
        type: "neutral",
      });
    } else {
      insights.push({
        title: "No savings this period",
        description:
          "Your current expenses are consuming all of your income.",
        type: "warning",
      });
    }
  }

  // Expense ratio insight
  if (summary.income > 0 && expenseRatio > 70) {
    insights.push({
      title: "High expense ratio",
      description: `Your expenses represent ${expenseRatio.toFixed(
        1,
      )}% of your income.`,
      type: "warning",
    });
  } else if (summary.income > 0) {
    insights.push({
      title: "Spending is under control",
      description: `Your expenses represent ${expenseRatio.toFixed(
        1,
      )}% of your income.`,
      type: "positive",
    });
  }

  // Top category insight
  if (topCategory) {
    insights.push({
      title: "Top spending category",
      description: `${topCategory.category} is your largest expense at ${formatCurrency(
        topCategory.amount,
        currency,
      )}.`,
      type: "neutral",
    });
  }

  // Account balance insight
  if (account) {
    if (account.balance < 0) {
      insights.push({
        title: "Negative account balance",
        description: `This account currently has a balance of ${formatCurrency(
          account.balance,
          currency,
        )}.`,
        type: "warning",
      });
    } else {
      insights.push({
        title: "Positive account balance",
        description: `Your current balance is ${formatCurrency(
          account.balance,
          currency,
        )}.`,
        type: "positive",
      });
    }
  }

  return (
    <section className="dashboard-section financial-insights">
      <div className="section-header">
        <div>
          <h2>Financial insights</h2>
          <p>
            A quick interpretation of your financial activity
          </p>
        </div>
      </div>

      <div className="financial-insights-grid">
        {insights.slice(0, 5).map((insight, index) => (
          <article
            className={`financial-insight financial-insight--${insight.type}`}
            key={`${insight.title}-${index}`}
          >
            <div className="financial-insight__indicator">
              {insight.type === "positive"
                ? "✓"
                : insight.type === "warning"
                  ? "!"
                  : "•"}
            </div>

            <div className="financial-insight__content">
              <strong>{insight.title}</strong>
              <p>{insight.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default FinancialInsights;