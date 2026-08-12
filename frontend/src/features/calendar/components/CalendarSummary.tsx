import type { CalendarTransaction } from "../types/calendar";
import { formatCurrency } from "../utils/calendarUtils";

interface CalendarSummaryProps {
  transactions: CalendarTransaction[];
}

export default function CalendarSummary({
  transactions,
}: CalendarSummaryProps) {
  const income = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const expenses = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const balance = income - expenses;

  return (
    <section className="calendar-summary">
      <div className="summary-item expense-summary">
        <span className="summary-label">↓ Expense</span>
        <strong>{formatCurrency(expenses)}</strong>
      </div>

      <div className="summary-item income-summary">
        <span className="summary-label">↑ Income</span>
        <strong>{formatCurrency(income)}</strong>
      </div>

      <div className="summary-item balance-summary">
        <span className="summary-label"> Balance</span>
        <strong>{formatCurrency(balance)}</strong>
      </div>
    </section>
  );
}