import type { Account } from "../../../types/dashboard";
import type { DateRange } from "../../../utils/dashboardSelectors";

interface DashboardFiltersProps {
  accounts: Account[];
  selectedAccountId: string;
  onAccountChange: (accountId: string) => void;
  isDatePickerOpen: boolean;
  onDatePickerToggle: () => void;
  draftRange: DateRange;
  appliedRange: DateRange | null;
  onDraftRangeChange: (range: DateRange) => void;
  onApplyRange: () => void;
  onClearRange: () => void;
}

const DashboardFilters = ({
  accounts,
  selectedAccountId,
  onAccountChange,
  isDatePickerOpen,
  onDatePickerToggle,
  draftRange,
  appliedRange,
  onDraftRangeChange,
  onApplyRange,
  onClearRange,
}: DashboardFiltersProps) => {
  const dateLabel = appliedRange
    ? `${appliedRange.startDate} to ${appliedRange.endDate}`
    : "Date range";
  const canApply = Boolean(
    draftRange.startDate &&
    draftRange.endDate &&
    draftRange.startDate <= draftRange.endDate,
  );

  return (
    <div className="dashboard-header-actions">
      <label className="dashboard-account-select">
        <span>Account</span>
        <select
          value={selectedAccountId}
          onChange={(event) => onAccountChange(event.target.value)}
        >
          <option value="all">All accounts</option>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </select>
      </label>
      <div className="dashboard-date-control">
        <span>Date</span>
        <button
          type="button"
          className={`dashboard-date-trigger${appliedRange ? " is-active" : ""}`}
          onClick={onDatePickerToggle}
          aria-expanded={isDatePickerOpen}
        >
          {dateLabel}
        </button>
        {isDatePickerOpen && (
          <div className="dashboard-date-popover">
            <label>
              Start date
              <input
                type="date"
                value={draftRange.startDate}
                onChange={(event) =>
                  onDraftRangeChange({
                    ...draftRange,
                    startDate: event.target.value,
                  })
                }
              />
            </label>
            <label>
              End date
              <input
                type="date"
                value={draftRange.endDate}
                min={draftRange.startDate}
                onChange={(event) =>
                  onDraftRangeChange({
                    ...draftRange,
                    endDate: event.target.value,
                  })
                }
              />
            </label>
            <div className="dashboard-date-popover__actions">
              <button
                type="button"
                className="date-clear"
                onClick={onClearRange}
              >
                Clear
              </button>
              <button
                type="button"
                className="date-apply"
                onClick={onApplyRange}
                disabled={!canApply}
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardFilters;
