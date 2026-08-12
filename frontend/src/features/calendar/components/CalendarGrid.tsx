import type { CalendarTransaction } from "../types/calendar";
import {
  formatDateKey,
  getDaysInMonth,
  getFirstDayOfMonth,
} from "../utils/calendarUtils";
import CalendarDay from "./CalendarDay";

interface CalendarGridProps {
  currentDate: Date;
  transactions: CalendarTransaction[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export default function CalendarGrid({
  currentDate,
  transactions,
  selectedDate,
  onSelectDate,
}: CalendarGridProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const days: Date[] = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(new Date(year, month, i - firstDay + 1));
  }

  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, month, day));
  }

  while (days.length < 42) {
    const nextDay = days.length - firstDay - daysInMonth + 1;
    days.push(new Date(year, month + 1, nextDay));
  }

  const weekdays = [
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
    "Sun",
  ];

  return (
    <div className="calendar-grid-wrapper">
      <div className="weekday-row">
        {weekdays.map((day) => (
          <div key={day} className="weekday">
            {day}
          </div>
        ))}
      </div>

      <div className="calendar-grid">
        {days.map((date) => {
          const dateKey = formatDateKey(date);

          const dayTransactions = transactions.filter(
            (transaction) => transaction.date === dateKey
          );

          const isCurrentMonth = date.getMonth() === month;

          return (
            <div
              key={dateKey}
              className={`calendar-cell ${
                !isCurrentMonth ? "outside-month" : ""
              }`}
            >
              <CalendarDay
                date={date}
                transactions={dayTransactions}
                selectedDate={selectedDate}
                onSelect={onSelectDate}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}