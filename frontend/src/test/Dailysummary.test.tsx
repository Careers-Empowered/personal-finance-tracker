import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import DailySummary from "../features/dashboard/components/DailySummary";
import type { TrendDataPoint } from "../types/dashboard";

describe("DailySummary", () => {
  it("renders the daily activity heading and description", () => {
    render(<DailySummary />);

    expect(
      screen.getByRole("heading", { name: "Daily activity" })
    ).toBeInTheDocument();

    expect(
      screen.getByText("Your income and spending over the last seven days")
    ).toBeInTheDocument();
  });

  it("shows empty state when no data is provided", () => {
    render(<DailySummary />);

    expect(
      screen.getByText("No daily activity available")
    ).toBeInTheDocument();
  });

  it("shows empty state when data array is empty", () => {
    render(<DailySummary data={[]} />);

    expect(
      screen.getByText("No daily activity available")
    ).toBeInTheDocument();
  });

  it("displays total income and expenses", () => {
    const data: TrendDataPoint[] = [
      {
        date: "2026-08-10",
        income: 1000,
        expenses: 400,
        balance: 600,
      },
      {
        date: "2026-08-11",
        income: 500,
        expenses: 200,
        balance: 300,
      },
    ];

    render(<DailySummary data={data} />);

expect(screen.getByText("$2K")).toBeInTheDocument();
expect(screen.getByText("$600")).toBeInTheDocument();
  });

  it("renders the correct number of daily activity entries", () => {
    const data: TrendDataPoint[] = [
      {
        date: "2026-08-10",
        income: 1000,
        expenses: 400,
        balance: 600,
      },
      {
        date: "2026-08-11",
        income: 500,
        expenses: 200,
        balance: 300,
      },
      {
        date: "2026-08-12",
        income: 800,
        expenses: 300,
        balance: 500,
      },
    ];

    render(<DailySummary data={data} />);

    expect(
      screen.getAllByTitle(/Income:/)
    ).toHaveLength(3);

    expect(
      screen.getAllByTitle(/Expenses:/)
    ).toHaveLength(3);
  });

  it("displays the correct day labels", () => {
    const data: TrendDataPoint[] = [
      {
        date: "2026-08-10",
        income: 1000,
        expenses: 400,
        balance: 600,
      },
      {
        date: "2026-08-11",
        income: 500,
        expenses: 200,
        balance: 300,
      },
    ];

    render(<DailySummary data={data} />);

    expect(screen.getByText("Mon")).toBeInTheDocument();
    expect(screen.getByText("Tue")).toBeInTheDocument();
  });

  it("renders income and expense bars with correct labels", () => {
    const data: TrendDataPoint[] = [
      {
        date: "2026-08-10",
        income: 1000,
        expenses: 400,
        balance: 600,
      },
    ];

    render(<DailySummary data={data} />);

    expect(
      screen.getByLabelText("Income: $1K")
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Expenses: $400")
    ).toBeInTheDocument();
  });

  it("renders the income and expenses legend", () => {
    render(
      <DailySummary
        data={[
          {
            date: "2026-08-10",
            income: 1000,
            expenses: 400,
            balance: 600,
          },
        ]}
      />
    );

    expect(screen.getByText("Income")).toBeInTheDocument();
    expect(screen.getByText("Expenses")).toBeInTheDocument();
  });

  it("sets bar heights based on the maximum value", () => {
    const data: TrendDataPoint[] = [
      {
        date: "2026-08-10",
        income: 1000,
        expenses: 500,
        balance: 500,
      },
    ];

    render(<DailySummary data={data} />);

    const incomeBar = screen.getByLabelText("Income: $1K");
    const expenseBar = screen.getByLabelText("Expenses: $500");

    expect(incomeBar).toHaveStyle({ height: "100%" });
    expect(expenseBar).toHaveStyle({ height: "50%" });
  });

  it("handles zero income and expenses", () => {
    const data: TrendDataPoint[] = [
      {
        date: "2026-08-10",
        income: 0,
        expenses: 0,
        balance: 0,
      },
    ];

    render(<DailySummary data={data} />);

    expect(screen.getByLabelText("Income: $0")).toBeInTheDocument();
    expect(screen.getByLabelText("Expenses: $0")).toBeInTheDocument();
  });
});