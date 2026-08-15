import AccountAnalysis from "./components/AccountAnalysis";
import DailySummary from "./components/DailySummary";
import DashboardFilters from "./components/DashboardFilters";
import MonthlySummary from "./components/MonthlySummary";
import MonthlyTrend from "./components/MonthlyTrend";
import RecentTransactions from "./components/RecentTransactions";
import SpendingByCategory from "./components/SpendingByCategory";
import { useDashboard } from "../../hooks/useDashboard";
import dashboardMockData from "./mockData.json";
import type { DashboardData } from "../../types/dashboard";
import "./dashboard.css";

const dashboardData = dashboardMockData as DashboardData;

const Dashboard = () => {
  const {
    view,
    selectedAccountId,
    setSelectedAccountId,
    isDatePickerOpen,
    toggleDatePicker,
    draftRange,
    setDraftRange,
    appliedRange,
    isPeriodView,
    applyDateRange,
    clearDateRange,
  } = useDashboard(dashboardData);

  // Use the selected account's currency.
  // USD is only the fallback when "All accounts" is selected.
  const currency = view.selectedAccount?.currency ?? "USD";

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
            {view.selectedAccount
              ? `${view.selectedAccount.name} financial activity`
              : "Overview of your financial activity"}
          </p>
        </div>

        <DashboardFilters
          accounts={dashboardData.accounts}
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

      <div className="dashboard-top-grid">
        <MonthlySummary
          data={view.summary}
          currency={currency}
          title={isPeriodView ? "Period summary" : "Monthly Summary"}
          description={periodDescription}
        />

        <MonthlyTrend
          data={view.monthlyTrend}
          currency={currency}
          title={isPeriodView ? "Period trend" : "Monthly trend"}
          description={trendDescription}
          granularity="month"
        />
      </div>

      <DailySummary
        data={view.dailyTrend}
        currency={currency}
      />

      <div className="dashboard-detail-grid dashboard-detail-grid--wide">
        <SpendingByCategory
          data={view.spendingByCategory}
          currency={currency}
        />

        <AccountAnalysis
          account={view.selectedAccount}
          summary={view.summary}
          spendingByCategory={view.spendingByCategory}
        />
      </div>

      <RecentTransactions
        transactions={view.transactions}
        accounts={dashboardData.accounts}
      />
    </main>
  );
};

export default Dashboard;