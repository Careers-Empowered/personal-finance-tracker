import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import MonthlySummary from "../features/dashboard/components/MonthlySummary";
import type { SummaryData } from "../types/dashboard";

describe("MonthlySummary", () => {
  const summaryData: SummaryData = {
    income: 5000,
    expenses: 2000,
    balance: 3000,
    transactionCount: 25,
  };

  it("renders the default title and description", () => {
    render(<MonthlySummary data={summaryData} />);

    expect(
      screen.getByRole("heading", { name: "Monthly Summary" })
    ).toBeInTheDocument();

    expect(
      screen.getByText("This month's financial activity")
    ).toBeInTheDocument();
  });

  it("renders custom title and description", () => {
    render(
      <MonthlySummary
        data={summaryData}
        title="Period summary"
        description="Financial activity for the selected period"
      />
    );

    expect(
      screen.getByRole("heading", { name: "Period summary" })
    ).toBeInTheDocument();

    expect(
      screen.getByText("Financial activity for the selected period")
    ).toBeInTheDocument();
  });

  it("displays income correctly", () => {
    render(<MonthlySummary data={summaryData} />);

    expect(screen.getByText("$5,000")).toBeInTheDocument();
  });

  it("displays expenses correctly", () => {
    render(<MonthlySummary data={summaryData} />);

    expect(screen.getByText("$2,000")).toBeInTheDocument();
  });

  it("displays balance correctly", () => {
    render(<MonthlySummary data={summaryData} />);

    expect(screen.getByText("$3,000")).toBeInTheDocument();
  });

  it("displays transaction count correctly", () => {
    render(<MonthlySummary data={summaryData} />);

    expect(screen.getByText("25")).toBeInTheDocument();
  });

  it("renders all summary labels", () => {
    render(<MonthlySummary data={summaryData} />);

    expect(screen.getByText("Income")).toBeInTheDocument();
    expect(screen.getByText("Expenses")).toBeInTheDocument();
    expect(screen.getByText("Balance")).toBeInTheDocument();
    expect(screen.getByText("Transactions")).toBeInTheDocument();
  });

  it("handles zero values correctly", () => {
    const data: SummaryData = {
      income: 0,
      expenses: 0,
      balance: 0,
      transactionCount: 0,
    };

    render(<MonthlySummary data={data} />);

    expect(screen.getAllByText("$0")).toHaveLength(3);
    expect(screen.getByText("Transactions")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("handles negative balance correctly", () => {
    const data: SummaryData = {
      income: 1000,
      expenses: 1500,
      balance: -500,
      transactionCount: 10,
    };

    render(<MonthlySummary data={data} />);

    expect(screen.getByText("$1,000")).toBeInTheDocument();
    expect(screen.getByText("$1,500")).toBeInTheDocument();
    expect(screen.getByText("-$500")).toBeInTheDocument();
  });
});