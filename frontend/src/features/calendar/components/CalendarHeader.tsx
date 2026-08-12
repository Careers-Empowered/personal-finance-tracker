interface CalendarHeaderProps {
  onSearch: () => void;
  onFilter: () => void;
}

export default function CalendarHeader({
  onSearch,
  onFilter,
}: CalendarHeaderProps) {
  return (
    <header className="calendar-header">
      <h1>Calendar</h1>

      <div className="header-actions">
        <button
          className="icon-button"
          onClick={onSearch}
          aria-label="Search"
        >
          🔍
        </button>

        <button className="filter-button" onClick={onFilter}>
          Filter
        </button>

        <button className="icon-button" aria-label="More options">
          ⋮
        </button>
      </div>
    </header>
  );
}