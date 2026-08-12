import type { CalendarTransaction } from "../types/calendar";
import {
  formatCurrency,
  isSameDate,
} from "../utils/calendarUtils";

interface CalendarDayProps {
  date: Date;
  transactions: CalendarTransaction[];
  selectedDate: Date;
  onSelect: (date: Date) => void;
}

export default function CalendarDay({
  date,
  transactions,
  selectedDate,
  onSelect,
}: CalendarDayProps) {
  const income = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const expenses = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const isSelected = isSameDate(date, selectedDate);

  return (
    <button
      className={`calendar-day ${isSelected ? "selected" : ""}`}
      onClick={() => onSelect(date)}
    >
      <span className="day-number">{date.getDate()}</span>

      <div className="day-amounts">
        {income > 0 && (
          <span className="income">
            +{formatCurrency(income)}
          </span>
        )}

        {expenses > 0 && (
          <span className="expense">
            -{formatCurrency(expenses)}
          </span>
        )}
      </div>

      {transactions.length > 0 && (
        <div className="transaction-count">
          {transactions.length} transaction
          {transactions.length > 1 ? "s" : ""}
        </div>
      )}
    </button>
  );
}