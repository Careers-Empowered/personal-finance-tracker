interface MonthNavigationProps {
  currentDate: Date;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
}

export default function MonthNavigation({
  currentDate,
  onPrevious,
  onNext,
  onToday,
}: MonthNavigationProps) {
  const monthName = currentDate.toLocaleString("en-US", {
    month: "long",
  });

  const year = currentDate.getFullYear();

  return (
    <div className="month-navigation">
      <button onClick={onPrevious} className="nav-arrow">
        ←
      </button>

      <div className="month-title">
        <strong>{monthName}</strong>
        <span>{year}</span>
      </div>

      <button onClick={onNext} className="nav-arrow">
        →
      </button>

      <button onClick={onToday} className="today-button">
        Today
      </button>
    </div>
  );
}