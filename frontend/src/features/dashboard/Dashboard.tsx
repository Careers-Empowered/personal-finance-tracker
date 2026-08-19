import FinancialInsights from "./components/FinancialInsights";
import DailySummary from "./components/DailySummary";
import DashboardFilters from "./components/DashboardFilters";
import MonthlySummary from "./components/MonthlySummary";
import MonthlyTrend from "./components/MonthlyTrend";
import Transactions from "./components/Transactions";
import SpendingByCategory from "./components/SpendingByCategory";
import { useDashboard } from "../../hooks/useDashboard";

import "./dashboard.css";

const Dashboard = () => {
  const {
    data,
    selectedAccountId,
    setSelectedAccountId,
    isDatePickerOpen,
    toggleDatePicker,
    draftRange,
    setDraftRange,
    appliedRange,
    applyDateRange,
    clearDateRange,
    loading,
    error,
  } = useDashboard(
    "9a1b181c-d789-4d6b-873f-c12140a32456",
  );

  if (loading) {
    return (
      <main className="dashboard-page">
        <p>Loading dashboard...</p>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="dashboard-page">
        <p>{error ?? "Failed to load dashboard"}</p>
      </main>
    );
  }

  const selectedAccount = data.selectedAccount;

  const currency =
    selectedAccount?.currency ??
    data.baseCurrency;

  const isPeriodView =
    appliedRange !== null;

  const periodDescription =
    isPeriodView && appliedRange
      ? `${appliedRange.startDate} to ${appliedRange.endDate}`
      : "This month's financial activity";

  const trendDescription =
    isPeriodView && appliedRange
      ? `Income and expenses from ${appliedRange.startDate} to ${appliedRange.endDate}`
      : "Income and expenses over the last six months";

  return (
    <main className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>

          <p>
            {selectedAccount
              ? `${selectedAccount.name} financial activity`
              : "Overview of your financial activity"}
          </p>
        </div>

        <DashboardFilters
          accounts={data.accounts}
          selectedAccountId={selectedAccountId}
          onAccountChange={setSelectedAccountId}
          isDatePickerOpen={isDatePickerOpen}
          onDatePickerToggle={toggleDatePicker}
          draftRange={draftRange}
          appliedRange={appliedRange}
          onDraftRangeChange={setDraftRange}
          onApplyRange={applyDateRange}
          onClearRange={clearDateRange}
        />
      </div>

<FinancialInsights
  account={selectedAccount ?? undefined}
  summary={data.summary}
  spendingByCategory={data.spendingByCategory}
  currency={currency}
/>

      <div className="dashboard-top-grid">
        <MonthlySummary
          data={data.summary}
          currency={currency}
          title={
            isPeriodView
              ? "Period summary"
              : "Monthly Summary"
          }
          description={periodDescription}
        />

        <MonthlyTrend
          data={data.monthlyTrend}
          currency={currency}
          title={
            isPeriodView
              ? "Period trend"
              : "Monthly trend"
          }
          description={trendDescription}
          granularity="month"
        />
      </div>

      <DailySummary
        key={selectedAccountId}
        data={data.dailyTrend}
        transactions={data.transactions}
        accounts={data.accounts}
        currency={selectedAccount?.currency}
      />

      <div className="dashboard-detail-grid dashboard-detail-grid--wide">
        <SpendingByCategory
          data={data.spendingByCategory}
          currency={currency}
        />
      </div>

      <Transactions
        transactions={data.transactions}
        accounts={data.accounts}
      />
    </main>
  );
};

export default Dashboard;