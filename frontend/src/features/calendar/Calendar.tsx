import CalendarHeader from "./components/CalendarHeader";
import MonthNavigation from "./components/MonthNavigation";
import CalendarSummary from "./components/CalendarSummary";
import CalendarGrid from "./components/CalendarGrid";
import TransactionPanel from "./components/TransactionPanel";

import { useCalendar } from "./hooks/useCalendar";

import "./styles/calendar.css";

function CalendarPage() {
  const {
    currentDate,
    selectedDate,
    monthTransactions,
    selectedTransactions,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
    selectDate,
  } = useCalendar();

  const handleSearch = () => {
    console.log("Search clicked");
  };

  const handleFilter = () => {
    console.log("Filter clicked");
  };

  return (
    <div className="calendar-page">
      <CalendarHeader
        onSearch={handleSearch}
        onFilter={handleFilter}
      />

      <MonthNavigation
        currentDate={currentDate}
        onPrevious={goToPreviousMonth}
        onNext={goToNextMonth}
        onToday={goToToday}
      />

      <CalendarSummary
        transactions={monthTransactions}
      />

      <main className="calendar-main">
        <section className="calendar-section">
          <CalendarGrid
            currentDate={currentDate}
            transactions={monthTransactions}
            selectedDate={selectedDate}
            onSelectDate={selectDate}
          />
        </section>

        <TransactionPanel
          selectedDate={selectedDate}
          transactions={selectedTransactions}
        />
      </main>

      <button
        className="floating-add-button"
        aria-label="Add transaction"
      >
        +
      </button>
    </div>
  );
}

export default CalendarPage;