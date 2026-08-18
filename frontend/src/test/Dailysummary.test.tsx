import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import DailySummary from "../features/dashboard/components/DailySummary";

import type {
  Account,
  Transaction,
  TrendDataPoint,
} from "../types/dashboard";

const account: Account = {
  id: "account-1",
  name: "SBI",
  balance: 5000,
  convertedBalance: 5000,
  currency: "USD",
  isPrimary: true,
};

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

const transactions: Transaction[] = [
  {
    id: "transaction-1",
    accountId: "account-1",
    date: "2026-08-10T00:00:00.000Z",
    title: "Salary",
    category: "Income",
    subcategory: "Salary",
    amount: 1000,
    type: "income",
    currency: "USD",
  },
  {
    id: "transaction-2",
    accountId: "account-1",
    date: "2026-08-10T00:00:00.000Z",
    title: "Groceries",
    category: "Food",
    subcategory: "Groceries",
    amount: 400,
    type: "expense",
    currency: "USD",
  },
];

describe("DailySummary", () => {
  it("renders the daily activity heading", () => {
    render(<DailySummary />);

    expect(
      screen.getByRole("heading", {
        name: "Daily activity",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Your income and spending by day",
      ),
    ).toBeInTheDocument();
  });

  it("renders monthly income and expense totals", () => {
    render(
      <DailySummary
        data={data}
        currency="USD"
      />,
    );

    expect(
      screen.getByText("$1,500.00"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("$600.00"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("+$900.00"),
    ).toBeInTheDocument();
  });

  it("renders the calendar weekdays", () => {
    render(
      <DailySummary
        data={data}
        currency="USD"
      />,
    );

    expect(screen.getByText("Mon")).toBeInTheDocument();
    expect(screen.getByText("Tue")).toBeInTheDocument();
    expect(screen.getByText("Wed")).toBeInTheDocument();
    expect(screen.getByText("Thu")).toBeInTheDocument();
    expect(screen.getByText("Fri")).toBeInTheDocument();
    expect(screen.getByText("Sat")).toBeInTheDocument();
    expect(screen.getByText("Sun")).toBeInTheDocument();
  });

  it("renders transaction data when a date is selected", async () => {
    const { container } = render(
      <DailySummary
        data={data}
        transactions={transactions}
        accounts={[account]}
        currency="USD"
      />,
    );

    const dateButton =
      container.querySelector(
        'button[aria-label^="2026-08-10"]',
      );

    expect(dateButton).not.toBeNull();

    (dateButton as HTMLButtonElement).click();

    expect(
      await screen.findByText("Salary"),
    ).toBeInTheDocument();

    expect(
      await screen.findByText("Groceries"),
    ).toBeInTheDocument();
  });

  it("shows no transactions message for a selected date without transactions", async () => {
    const { container } = render(
      <DailySummary
        data={data}
        transactions={[]}
        accounts={[account]}
        currency="USD"
      />,
    );

    const dateButton =
      container.querySelector(
        'button[aria-label^="2026-08-10"]',
      );

    expect(dateButton).not.toBeNull();

    (dateButton as HTMLButtonElement).click();

    expect(
      await screen.findByText(
        "No transactions were recorded on this date.",
      ),
    ).toBeInTheDocument();
  });

  it("uses the transaction title", async () => {
    const { container } = render(
      <DailySummary
        data={data}
        transactions={transactions}
        accounts={[account]}
        currency="USD"
      />,
    );

    const dateButton =
      container.querySelector(
        'button[aria-label^="2026-08-10"]',
      );

    expect(dateButton).not.toBeNull();

    (dateButton as HTMLButtonElement).click();

    expect(
      await screen.findByText("Salary"),
    ).toBeInTheDocument();

    expect(
      screen.queryByText("description"),
    ).not.toBeInTheDocument();
  });

  it("renders empty calendar days without crashing", () => {
    render(
      <DailySummary
        data={[]}
        transactions={[]}
        accounts={[]}
      />,
    );

    expect(
      screen.getByRole("heading", {
        name: "Daily activity",
      }),
    ).toBeInTheDocument();
  });
});