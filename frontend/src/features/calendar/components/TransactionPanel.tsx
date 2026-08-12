import type { CalendarTransaction } from "../types/calendar";
import TransactionItem from "./TransactionItem";

interface TransactionPanelProps {
  selectedDate: Date;
  transactions: CalendarTransaction[];
}

export default function TransactionPanel({
  selectedDate,
  transactions,
}: TransactionPanelProps) {
  const formattedDate = selectedDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <aside className="transaction-panel">
      <div className="panel-header">
        <div>
          <span className="panel-label">Selected Date</span>
          <h2>{formattedDate}</h2>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="empty-state">
          <span>📅</span>
          <p>No transactions for this date.</p>
        </div>
      ) : (
        <div className="transaction-list">
          {transactions.map((transaction) => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
            />
          ))}
        </div>
      )}
    </aside>
  );
}