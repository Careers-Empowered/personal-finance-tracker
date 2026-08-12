import { useMemo, useState } from "react";

import { mockTransactions } from "../data/mockTransactions";
import { formatDateKey } from "../utils/calendarUtils";

export function useCalendar() {
  const today = new Date();

  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const [selectedDate, setSelectedDate] = useState(today);

  const monthTransactions = useMemo(() => {
    return mockTransactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);

      return (
        transactionDate.getFullYear() === currentDate.getFullYear() &&
        transactionDate.getMonth() === currentDate.getMonth()
      );
    });
  }, [currentDate]);

  const selectedTransactions = useMemo(() => {
    const selectedKey = formatDateKey(selectedDate);

    return mockTransactions.filter(
      (transaction) => transaction.date === selectedKey
    );
  }, [selectedDate]);

  const goToPreviousMonth = () => {
    setCurrentDate(
      (previous) =>
        new Date(
          previous.getFullYear(),
          previous.getMonth() - 1,
          1
        )
    );
  };

  const goToNextMonth = () => {
    setCurrentDate(
      (previous) =>
        new Date(
          previous.getFullYear(),
          previous.getMonth() + 1,
          1
        )
    );
  };

  const goToToday = () => {
    const now = new Date();

    setCurrentDate(
      new Date(now.getFullYear(), now.getMonth(), 1)
    );

    setSelectedDate(now);
  };

  const selectDate = (date: Date) => {
    setSelectedDate(date);

    // If the selected date belongs to another month,
    // automatically move the calendar to that month.
    setCurrentDate(
      new Date(date.getFullYear(), date.getMonth(), 1)
    );
  };

  return {
    currentDate,
    selectedDate,
    monthTransactions,
    selectedTransactions,

    goToPreviousMonth,
    goToNextMonth,
    goToToday,
    selectDate,
  };
}