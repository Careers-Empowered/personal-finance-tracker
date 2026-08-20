import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import DashboardFilters from "../features/dashboard/components/DashboardFilters";
import type { Account } from "../types/dashboard";
import type { DateRange } from "../utils/dashboardSelectors";

const accounts: Account[] = [
  {
    id: "1",
    name: "Checking Account",
    balance: 1500,
    currency: "USD",
    income: 3000,
    expenses: 1500,
    transactionCount: 10,
    dashboard: {
      daily: {
        income: 100,
        expenses: 50,
        balance: 50,
        transactionCount: 2,
      },
      monthly: {
        income: 3000,
        expenses: 1500,
        balance: 1500,
        transactionCount: 10,
      },
      spendingByCategory: [],
      monthlyTrend: [],
      dailyTrend: [],
    },
  },
  {
    id: "2",
    name: "Savings Account",
    balance: 5000,
    currency: "USD",
    income: 4000,
    expenses: 500,
    transactionCount: 8,
    dashboard: {
      daily: {
        income: 200,
        expenses: 50,
        balance: 150,
        transactionCount: 2,
      },
      monthly: {
        income: 4000,
        expenses: 500,
        balance: 3500,
        transactionCount: 8,
      },
      spendingByCategory: [],
      monthlyTrend: [],
      dailyTrend: [],
    },
  },
];

const defaultDraftRange: DateRange = {
  startDate: "2026-08-01",
  endDate: "2026-08-13",
};

const renderFilters = (
  overrides: Partial<React.ComponentProps<typeof DashboardFilters>> = {},
) => {
  const props = {
    accounts,
    selectedAccountId: "all",
    onAccountChange: vi.fn(),
    isDatePickerOpen: false,
    onDatePickerToggle: vi.fn(),
    draftRange: defaultDraftRange,
    appliedRange: null,
    onDraftRangeChange: vi.fn(),
    onApplyRange: vi.fn(),
    onClearRange: vi.fn(),
    ...overrides,
  };

  return {
    ...render(<DashboardFilters {...props} />),
    ...props,
  };
};

describe("DashboardFilters", () => {
  it("renders account and date filters", () => {
    renderFilters();

    expect(screen.getByText("Account")).toBeInTheDocument();
    expect(screen.getByText("Date")).toBeInTheDocument();

    expect(
      screen.getByRole("combobox")
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Date range" })
    ).toBeInTheDocument();
  });

  it("renders all account options", () => {
    renderFilters();

    expect(
      screen.getByRole("option", { name: "All accounts" })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("option", { name: "Checking Account" })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("option", { name: "Savings Account" })
    ).toBeInTheDocument();
  });

  it("calls onAccountChange when an account is selected", () => {
    const onAccountChange = vi.fn();

    renderFilters({ onAccountChange });

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "2" },
    });

    expect(onAccountChange).toHaveBeenCalledWith("2");
  });

  it("opens the date picker when the date button is clicked", () => {
    const onDatePickerToggle = vi.fn();

    renderFilters({ onDatePickerToggle });

    fireEvent.click(
      screen.getByRole("button", { name: "Date range" })
    );

    expect(onDatePickerToggle).toHaveBeenCalledTimes(1);
  });

  it("shows the date popover when date picker is open", () => {
    renderFilters({
      isDatePickerOpen: true,
    });

    expect(screen.getByLabelText("Start date")).toBeInTheDocument();
    expect(screen.getByLabelText("End date")).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Clear" })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Apply" })
    ).toBeInTheDocument();
  });

  it("displays the applied date range", () => {
    const appliedRange: DateRange = {
      startDate: "2026-08-01",
      endDate: "2026-08-13",
    };

    renderFilters({ appliedRange });

    expect(
      screen.getByRole("button", {
        name: "2026-08-01 to 2026-08-13",
      })
    ).toBeInTheDocument();
  });

  it("marks the date button as active when a range is applied", () => {
    const appliedRange: DateRange = {
      startDate: "2026-08-01",
      endDate: "2026-08-13",
    };

    renderFilters({ appliedRange });

    expect(
      screen.getByRole("button", {
        name: "2026-08-01 to 2026-08-13",
      })
    ).toHaveClass("is-active");
  });

  it("disables Apply when the date range is incomplete", () => {
    renderFilters({
      isDatePickerOpen: true,
      draftRange: {
        startDate: "2026-08-01",
        endDate: "",
      },
    });

    expect(
      screen.getByRole("button", { name: "Apply" })
    ).toBeDisabled();
  });

  it("disables Apply when start date is after end date", () => {
    renderFilters({
      isDatePickerOpen: true,
      draftRange: {
        startDate: "2026-08-13",
        endDate: "2026-08-01",
      },
    });

    expect(
      screen.getByRole("button", { name: "Apply" })
    ).toBeDisabled();
  });

  it("enables Apply when the date range is valid", () => {
    renderFilters({
      isDatePickerOpen: true,
      draftRange: {
        startDate: "2026-08-01",
        endDate: "2026-08-13",
      },
    });

    expect(
      screen.getByRole("button", { name: "Apply" })
    ).toBeEnabled();
  });

  it("calls onApplyRange when Apply is clicked", () => {
    const onApplyRange = vi.fn();

    renderFilters({
      isDatePickerOpen: true,
      onApplyRange,
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Apply" })
    );

    expect(onApplyRange).toHaveBeenCalledTimes(1);
  });

  it("calls onClearRange when Clear is clicked", () => {
    const onClearRange = vi.fn();

    renderFilters({
      isDatePickerOpen: true,
      onClearRange,
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Clear" })
    );

    expect(onClearRange).toHaveBeenCalledTimes(1);
  });

  it("calls onDraftRangeChange when start date changes", () => {
    const onDraftRangeChange = vi.fn();

    renderFilters({
      isDatePickerOpen: true,
      onDraftRangeChange,
    });

    fireEvent.change(screen.getByLabelText("Start date"), {
      target: { value: "2026-08-05" },
    });

    expect(onDraftRangeChange).toHaveBeenCalledWith({
      startDate: "2026-08-05",
      endDate: "2026-08-13",
    });
  });

  it("calls onDraftRangeChange when end date changes", () => {
    const onDraftRangeChange = vi.fn();

    renderFilters({
      isDatePickerOpen: true,
      onDraftRangeChange,
    });

    fireEvent.change(screen.getByLabelText("End date"), {
      target: { value: "2026-08-10" },
    });

    expect(onDraftRangeChange).toHaveBeenCalledWith({
      startDate: "2026-08-01",
      endDate: "2026-08-10",
    });
  });

  it("sets the minimum end date to the selected start date", () => {
    renderFilters({
      isDatePickerOpen: true,
      draftRange: {
        startDate: "2026-08-05",
        endDate: "2026-08-13",
      },
    });

    expect(
      screen.getByLabelText("End date")
    ).toHaveAttribute("min", "2026-08-05");
  });

  it("sets aria-expanded correctly", () => {
    const { rerender } = renderFilters({
      isDatePickerOpen: false,
    });

    expect(
      screen.getByRole("button", { name: "Date range" })
    ).toHaveAttribute("aria-expanded", "false");

    rerender(
      <DashboardFilters
        accounts={accounts}
        selectedAccountId="all"
        onAccountChange={vi.fn()}
        isDatePickerOpen={true}
        onDatePickerToggle={vi.fn()}
        draftRange={defaultDraftRange}
        appliedRange={null}
        onDraftRangeChange={vi.fn()}
        onApplyRange={vi.fn()}
        onClearRange={vi.fn()}
      />
    );

    expect(
      screen.getByRole("button", { name: "Date range" })
    ).toHaveAttribute("aria-expanded", "true");
  });
});