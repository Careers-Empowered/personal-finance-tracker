import type { CalendarTransaction } from "../types/calendar";
import { formatCurrency } from "../utils/calendarUtils";

interface TransactionItemProps {
  transaction: CalendarTransaction;
}

export default function TransactionItem({
  transaction,
}: TransactionItemProps) {
  const isIncome = transaction.type === "income";

  return (
    <div className="transaction-item">
      <div className="transaction-icon">
        {isIncome ? "↑" : "↓"}
      </div>

      <div className="transaction-info">
        <strong>{transaction.title}</strong>

        <span>
          {transaction.account} · {transaction.category}
        </span>
      </div>

      <strong className={isIncome ? "income" : "expense"}>
        {isIncome ? "+" : "-"}
        {formatCurrency(transaction.amount)}
      </strong>
    </div>
  );
}