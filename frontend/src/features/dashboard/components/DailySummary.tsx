import { useMemo, useState } from "react";
import type {
  Account,
  Transaction,
  TrendDataPoint,
} from "../../../types/dashboard";

interface DailySummaryProps {
  data?: TrendDataPoint[];
  transactions?: Transaction[];
  accounts?: Account[];
  currency?: string;
}

const formatCurrency = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);


const formatMonth = (date: Date) =>
  new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);

const formatSelectedDate = (date: string) =>
  new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date(`${date}T00:00:00`));

const getMonthKey = (date: Date) =>
  `${date.getFullYear()}-${String(
    date.getMonth() + 1,
  ).padStart(2, "0")}`;

const getDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(
    date.getMonth() + 1,
  ).padStart(2, "0")}-${String(date.getDate()).padStart(
    2,
    "0",
  )}`;

const getTodayKey = () => getDateKey(new Date());

const DailySummary = ({
  data = [],
  transactions = [],
  accounts = [],
  currency = "INR",
}: DailySummaryProps) => {
const today = new Date();

const [currentMonth, setCurrentMonth] = useState(
  new Date(
    today.getFullYear(),
    today.getMonth(),
    1,
  ),
);

const [selectedDate, setSelectedDate] = useState<string | null>(
  `${today.getFullYear()}-${String(
    today.getMonth() + 1,
  ).padStart(2, "0")}-${String(
    today.getDate(),
  ).padStart(2, "0")}`,
);

  const monthKey = getMonthKey(currentMonth);

  /*
   * Daily trend data for the currently displayed month.
   */
  const monthData = useMemo(() => {
    const map = new Map<string, TrendDataPoint>();

    data.forEach((point) => {
      const pointDate = new Date(
        `${point.date}T00:00:00`,
      );

      if (getMonthKey(pointDate) === monthKey) {
        map.set(point.date, point);
      }
    });

    return map;
  }, [data, monthKey]);

  /*
   * Transactions for the selected date.
   */
const selectedDateTransactions = useMemo(() => {
  if (!selectedDate) {
    return [];
  }

  return transactions
    .filter(
      (transaction) =>
        transaction.date.slice(0, 10) === selectedDate,
    )
    .sort((first, second) => {
      return first.title.localeCompare(
        second.title,
      );
    });
}, [transactions, selectedDate]);
  const totalIncome = [...monthData.values()].reduce(
    (sum, point) => sum + point.income,
    0,
  );

  const totalExpenses = [...monthData.values()].reduce(
    (sum, point) => sum + point.expenses,
    0,
  );

  const netBalance = totalIncome - totalExpenses;

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0,
  ).getDate();

  const firstDay = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1,
  ).getDay();

  /*
   * Convert Sunday-first JavaScript calendar
   * into Monday-first calendar.
   */
  const mondayOffset =
    firstDay === 0 ? 6 : firstDay - 1;

  /*
   * Always render 6 weeks.
   */
  const calendarDays = Array.from(
    { length: 42 },
    (_, index) => {
      const dayNumber =
        index - mondayOffset + 1;

      if (
        dayNumber < 1 ||
        dayNumber > daysInMonth
      ) {
        return null;
      }

      return new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        dayNumber,
      );
    },
  );

  const goToPreviousMonth = () => {
    setCurrentMonth((month) => {
      const newMonth = new Date(
        month.getFullYear(),
        month.getMonth() - 1,
        1,
      );

      setSelectedDate(null);

      return newMonth;
    });
  };

  const goToNextMonth = () => {
    setCurrentMonth((month) => {
      const newMonth = new Date(
        month.getFullYear(),
        month.getMonth() + 1,
        1,
      );

      setSelectedDate(null);

      return newMonth;
    });
  };

  const todayKey = getTodayKey();

  const getAccount = (accountId: string) =>
    accounts.find(
      (account) => account.id === accountId,
    );

  const handleDateClick = (dateKey: string) => {
    setSelectedDate((current) =>
      current === dateKey ? null : dateKey,
    );
  };

  return (
    <section className="dashboard-section">
      <div className="section-header">
        <div>
          <h2>Daily activity</h2>
          <p>Your income and spending by day</p>
        </div>

        <div className="daily-activity-totals">
          <span>
            In{" "}
            <strong>
              {formatCurrency(
                totalIncome,
                currency,
              )}
            </strong>
          </span>

          <span>
            Out{" "}
            <strong>
              {formatCurrency(
                totalExpenses,
                currency,
              )}
            </strong>
          </span>

          <span>
            Net{" "}
            <strong
              className={
                netBalance >= 0
                  ? "daily-activity-total--positive"
                  : "daily-activity-total--negative"
              }
            >
              {netBalance >= 0 ? "+" : ""}
              {formatCurrency(
                netBalance,
                currency,
              )}
            </strong>
          </span>
        </div>
      </div>
<div className="daily-activity-card">
  <div className="daily-activity-content">
    {/* Calendar */}
    <div className="daily-calendar-panel">
      {/* Calendar header */}
      <div className="daily-calendar-header">
        <button
          type="button"
          className="daily-calendar-nav"
          onClick={goToPreviousMonth}
          aria-label="Previous month"
        >
          ‹
        </button>

        <strong>{formatMonth(currentMonth)}</strong>

        <button
          type="button"
          className="daily-calendar-nav"
          onClick={goToNextMonth}
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      {/* Weekdays */}
      <div
        className="daily-calendar-weekdays"
        aria-hidden="true"
      >
        {[
          "Mon",
          "Tue",
          "Wed",
          "Thu",
          "Fri",
          "Sat",
          "Sun",
        ].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      {/* Calendar */}
      <div
        className="daily-calendar-grid"
        role="grid"
        aria-label={formatMonth(currentMonth)}
      >
        {calendarDays.map((date, index) => {
          if (!date) {
            return (
              <div
                className="daily-calendar-day daily-calendar-day--empty"
                key={`empty-${index}`}
                role="gridcell"
                aria-hidden="true"
              />
            );
          }

          const dateKey = getDateKey(date);
          const point = monthData.get(dateKey);

          const isToday = dateKey === todayKey;
          const isSelected = dateKey === selectedDate;
          const hasActivity = Boolean(point);

          const dayClassName = [
            "daily-calendar-day",
            hasActivity
              ? "daily-calendar-day--active"
              : "",
            isToday
              ? "daily-calendar-day--today"
              : "",
            isSelected
              ? "daily-calendar-day--selected"
              : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <button
              type="button"
              className={dayClassName}
              key={dateKey}
              role="gridcell"
              onClick={() => handleDateClick(dateKey)}
              aria-label={`${dateKey}${
                point
                  ? `, income ${point.income}, expenses ${point.expenses}`
                  : ", no activity"
              }`}
              aria-pressed={isSelected}
            >
              <div className="daily-calendar-day__top">
                <span className="daily-calendar-day__number">
                  {date.getDate()}
                </span>

                {isToday && (
                  <span className="daily-calendar-day__today">
                    Today
                  </span>
                )}
              </div>

              {point ? (
                <>
                  <span
                    className={`daily-calendar-day__balance ${
                      point.balance >= 0
                        ? "daily-calendar-day__balance--positive"
                        : "daily-calendar-day__balance--negative"
                    }`}
                  >
                    {point.balance >= 0 ? "+" : ""}
                    {formatCurrency(
                      point.balance,
                      currency,
                    )}
                  </span>

                  <div className="daily-calendar-day__activity">
                    {point.income > 0 && (
                      <span className="daily-calendar-pill daily-calendar-pill--income">
                        <span>↑</span>
                        {formatCurrency(
                          point.income,
                          currency,
                        )}
                      </span>
                    )}

                    {point.expenses > 0 && (
                      <span className="daily-calendar-pill daily-calendar-pill--expense">
                        <span>↓</span>
                        {formatCurrency(
                          point.expenses,
                          currency,
                        )}
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <span className="daily-calendar-no-data">
                  —
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="daily-activity-legend">
        <span>
          <i className="daily-activity-legend__income" />
          Income
        </span>

        <span>
          <i className="daily-activity-legend__expense" />
          Expenses
        </span>

        <span>
          <i className="daily-activity-legend__today" />
          Today
        </span>
      </div>
    </div>

    {/* Transactions */}
    <aside className="daily-calendar-transactions">
      {selectedDate ? (
        <>
          <div className="daily-calendar-transactions__header">
            <div>
              <h3>
                {formatSelectedDate(selectedDate)}
              </h3>

              <p>
                {selectedDateTransactions.length === 0
                  ? "No transactions"
                  : `${selectedDateTransactions.length} transaction${
                      selectedDateTransactions.length === 1
                        ? ""
                        : "s"
                    }`}
              </p>
            </div>

            <button
              type="button"
              className="daily-calendar-transactions__close"
              onClick={() => setSelectedDate(null)}
              aria-label="Close transactions"
            >
              ×
            </button>
          </div>

          {selectedDateTransactions.length === 0 ? (
            <div className="daily-calendar-transactions__empty">
              No transactions were recorded on this date.
            </div>
          ) : (
            <div className="daily-calendar-transactions__list">
              {selectedDateTransactions.map((transaction) => {
                const account = getAccount(
                  transaction.accountId,
                );

                const transactionCurrency =
  transaction.currency ??
  account?.currency ??
  currency;

                return (
                  <div
                    className="daily-calendar-transaction"
                    key={transaction.id}
                  >
                    <div
                      className={`daily-calendar-transaction__icon daily-calendar-transaction__icon--${transaction.type}`}
                    >
                      {transaction.type === "income"
                        ? "↑"
                        : "↓"}
                    </div>

                    <div className="daily-calendar-transaction__details">
                      <strong>
                        {transaction.title}
                      </strong>

                      <span>
                        {transaction.category}
                        {" · "}
                        {account?.name ?? "Account"}
                      </span>
                    </div>

                    <strong
                      className={`daily-calendar-transaction__amount daily-calendar-transaction__amount--${transaction.type}`}
                    >
                      {transaction.type === "income"
                        ? "+"
                        : "−"}

                      {formatCurrency(
                        transaction.amount,
                        transactionCurrency,
                      )}
                    </strong>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <div className="daily-calendar-transactions__placeholder">
          <div className="daily-calendar-transactions__placeholder-icon">
            ←
          </div>

          <h3>Select a date</h3>

          <p>
            Choose a day from the calendar to view
            its transactions.
          </p>
        </div>
      )}
    </aside>
  </div>
</div>
    </section>
  );
};

export default DailySummary;