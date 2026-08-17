import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import MonthlyTrend from "../features/dashboard/components/MonthlyTrend";
import type { TrendDataPoint } from "../types/dashboard";

describe("MonthlyTrend", () => {
  const monthlyData: TrendDataPoint[] = [
    {
      date: "2026-06",
      income: 3000,
      expenses: 1500,
      balance: 1500,
    },
    {
      date: "2026-07",
      income: 4000,
      expenses: 2000,
      balance: 2000,
    },
    {
      date: "2026-08",
      income: 5000,
      expenses: 2500,
      balance: 2500,
    },
  ];

  it("shows empty state when no data is provided", () => {
    render(<MonthlyTrend />);

    expect(
      screen.getByText("No monthly trend data available")
    ).toBeInTheDocument();
  });

  it("shows empty state when data is empty", () => {
    render(<MonthlyTrend data={[]} />);

    expect(
      screen.getByText("No monthly trend data available")
    ).toBeInTheDocument();
  });

  it("renders the default title and description", () => {
    render(<MonthlyTrend data={monthlyData} />);

    expect(
      screen.getByRole("heading", { name: "Monthly trend" })
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Income and expenses over the last six months"
      )
    ).toBeInTheDocument();
  });

  it("renders custom title and description", () => {
    render(
      <MonthlyTrend
        data={monthlyData}
        title="Period trend"
        description="Income and expenses for the selected period"
      />
    );

    expect(
      screen.getByRole("heading", { name: "Period trend" })
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Income and expenses for the selected period"
      )
    ).toBeInTheDocument();
  });

  it("renders the trend chart", () => {
    render(<MonthlyTrend data={monthlyData} />);

    expect(
      screen.getByRole("img", {
        name: "Monthly income and expense trend",
      })
    ).toBeInTheDocument();
  });

  it("renders income and expense legends", () => {
    render(<MonthlyTrend data={monthlyData} />);

    expect(screen.getByText("Income")).toBeInTheDocument();
    expect(screen.getByText("Expenses")).toBeInTheDocument();
  });

  it("renders the correct number of data points", () => {
    render(<MonthlyTrend data={monthlyData} />);

    const incomePoints = document.querySelectorAll(
      ".trend-point--income"
    );

    const expensePoints = document.querySelectorAll(
      ".trend-point--expense"
    );

    expect(incomePoints).toHaveLength(3);
    expect(expensePoints).toHaveLength(3);
  });

  it("renders month labels for monthly granularity", () => {
    render(
      <MonthlyTrend
        data={monthlyData}
        granularity="month"
      />
    );

    expect(screen.getByText("Jun")).toBeInTheDocument();
    expect(screen.getByText("Jul")).toBeInTheDocument();
    expect(screen.getByText("Aug")).toBeInTheDocument();
  });

  it("renders day labels for day granularity", () => {
    const dailyData: TrendDataPoint[] = [
      {
        date: "2026-08-10",
        income: 1000,
        expenses: 400,
        balance: 600,
      },
      {
        date: "2026-08-11",
        income: 1500,
        expenses: 500,
        balance: 1000,
      },
    ];

    render(
      <MonthlyTrend
        data={dailyData}
        granularity="day"
      />
    );

    expect(screen.getByText("Aug 10")).toBeInTheDocument();
    expect(screen.getByText("Aug 11")).toBeInTheDocument();
  });

  it("uses custom labels when provided", () => {
    const data: TrendDataPoint[] = [
      {
        date: "2026-08",
        label: "Current",
        income: 3000,
        expenses: 1000,
        balance: 2000,
      },
      {
        date: "2026-09",
        label: "Next",
        income: 4000,
        expenses: 1500,
        balance: 2500,
      },
    ];

    render(<MonthlyTrend data={data} />);

    expect(screen.getByText("Current")).toBeInTheDocument();
    expect(screen.getByText("Next")).toBeInTheDocument();
  });

  it("renders grid lines and axis values", () => {
    render(<MonthlyTrend data={monthlyData} />);

    const gridLines = document.querySelectorAll(
      ".trend-grid-line"
    );

    const axisLabels = document.querySelectorAll(
      ".trend-axis-label"
    );

    expect(gridLines).toHaveLength(3);
    expect(axisLabels.length).toBeGreaterThan(0);
  });

  it("renders income and expense lines", () => {
    render(<MonthlyTrend data={monthlyData} />);

    expect(
      document.querySelector(".trend-line--income")
    ).toBeInTheDocument();

    expect(
      document.querySelector(".trend-line--expense")
    ).toBeInTheDocument();
  });

  it("shows income tooltip when an income point receives focus", () => {
    render(<MonthlyTrend data={monthlyData} />);

    const incomePoints = document.querySelectorAll(
      ".trend-point--income"
    );

    fireEvent.focus(incomePoints[0]);

    expect(
      screen.getByText("Jun · Income")
    ).toBeInTheDocument();

    expect(
      screen.getByText("$3,000")
    ).toBeInTheDocument();
  });

  it("shows expense tooltip when an expense point receives focus", () => {
    render(<MonthlyTrend data={monthlyData} />);

    const expensePoints = document.querySelectorAll(
      ".trend-point--expense"
    );

    fireEvent.focus(expensePoints[1]);

    expect(
      screen.getByText("Jul · Expenses")
    ).toBeInTheDocument();

    expect(
      screen.getByText("$2,000")
    ).toBeInTheDocument();
  });

  it("shows tooltip when hovering over an income point", () => {
    render(<MonthlyTrend data={monthlyData} />);

    const incomePoints = document.querySelectorAll(
      ".trend-point--income"
    );

    fireEvent.mouseEnter(incomePoints[2]);

    expect(
      screen.getByText("Aug · Income")
    ).toBeInTheDocument();

    const tooltip = document.querySelector(".trend-tooltip");

expect(tooltip).toBeInTheDocument();
expect(tooltip).toHaveTextContent("$5,000");
  });

  it("shows tooltip when hovering over an expense point", () => {
    render(<MonthlyTrend data={monthlyData} />);

    const expensePoints = document.querySelectorAll(
      ".trend-point--expense"
    );

    fireEvent.mouseEnter(expensePoints[0]);

    expect(
      screen.getByText("Jun · Expenses")
    ).toBeInTheDocument();

    expect(
      screen.getByText("$1,500")
    ).toBeInTheDocument();
  });

  it("removes tooltip when mouse leaves the chart", () => {
    render(<MonthlyTrend data={monthlyData} />);

    const chart = screen.getByRole("img", {
      name: "Monthly income and expense trend",
    });

    const incomePoints = document.querySelectorAll(
      ".trend-point--income"
    );

    fireEvent.mouseEnter(incomePoints[0]);

    expect(
      screen.getByText("Jun · Income")
    ).toBeInTheDocument();

    fireEvent.mouseLeave(chart);

    expect(
      screen.queryByText("Jun · Income")
    ).not.toBeInTheDocument();
  });

  it("supports keyboard focus on data points", () => {
    render(<MonthlyTrend data={monthlyData} />);

    const incomePoints = document.querySelectorAll(
      ".trend-point--income"
    );

    expect(incomePoints[0]).toHaveAttribute(
      "tabindex",
      "0"
    );
  });
});