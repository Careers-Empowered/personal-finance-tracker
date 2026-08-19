import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import AccountAnalysis from "../features/dashboard/components/FinancialInsights";

import type {
  Account,
  CategorySpending,
  SummaryData,
} from "../types/dashboard";

const createAccount = (
  overrides: Partial<Account> = {},
): Account => ({
  id: "1",
  name: "Checking Account",
  balance: 2500.5,
  currency: "USD",
  income: 4200,
  expenses: 1699.5,
  transactionCount: 18,

  dashboard: {
    daily: {
      income: 450,
      expenses: 120,
      balance: 330,
      transactionCount: 4,
    },

    monthly: {
      income: 4200,
      expenses: 1699.5,
      balance: 2500.5,
      transactionCount: 18,
    },

    spendingByCategory: [],

    monthlyTrend: [],

    dailyTrend: [],
  },

  ...overrides,
});

const defaultSummary: SummaryData = {
  income: 4200,
  expenses: 1699.5,
  balance: 2500.5,
  transactionCount: 18,
};

const defaultSpendingByCategory: CategorySpending[] = [
  {
    category: "Food & Dining",
    amount: 520,
  },
  {
    category: "Transportation",
    amount: 310,
  },
  {
    category: "Shopping",
    amount: 420,
  },
  {
    category: "Bills & Utilities",
    amount: 449.5,
  },
];

const renderInsights = ({
  account = createAccount(),
  summary = defaultSummary,
  spendingByCategory = defaultSpendingByCategory,
}: {
  account?: Account;
  summary?: SummaryData;
  spendingByCategory?: CategorySpending[];
} = {}) =>
  render(
    <AccountAnalysis
      account={account}
      summary={summary}
      spendingByCategory={spendingByCategory}
    />,
  );

describe("FinancialInsights", () => {
  it("renders the financial insights heading and description", () => {
    renderInsights();

    expect(
      screen.getByRole("heading", {
        name: "Financial insights",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "A quick interpretation of your financial activity",
      ),
    ).toBeInTheDocument();
  });

  it("shows empty state when no account is provided", () => {
    renderInsights({
      account: undefined,
    });

    expect(
      screen.getByText("No financial insights available"),
    ).toBeInTheDocument();
  });

  it("shows positive cash flow insight", () => {
    renderInsights();

    expect(
      screen.getByText("Positive cash flow"),
    ).toBeInTheDocument();
  });

  it("shows the income and expense values in the cash flow insight", () => {
    renderInsights();

    expect(
      screen.getByText(
        "You earned $4,200.00 and spent $1,699.50 this period.",
      ),
    ).toBeInTheDocument();
  });

  it("shows strong savings rate insight", () => {
    renderInsights();

    expect(
      screen.getByText("Strong savings rate"),
    ).toBeInTheDocument();
  });

  it("shows the correct savings rate", () => {
    renderInsights();

    expect(
      screen.getByText(
        "You're keeping 59.5% of your income after expenses.",
      ),
    ).toBeInTheDocument();
  });

  it("shows spending control insight", () => {
    renderInsights();

    expect(
      screen.getByText("Spending is under control"),
    ).toBeInTheDocument();
  });

  it("shows the correct spending percentage", () => {
    renderInsights();

    expect(
      screen.getByText(
        "Your expenses represent 40.5% of your income.",
      ),
    ).toBeInTheDocument();
  });

  it("shows the top spending category", () => {
    renderInsights();

    expect(
      screen.getByText("Top spending category"),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Food & Dining is your largest expense at $520.00.",
      ),
    ).toBeInTheDocument();
  });

  it("identifies a different top spending category", () => {
    renderInsights({
      spendingByCategory: [
        {
          category: "Shopping",
          amount: 900,
        },
        {
          category: "Food & Dining",
          amount: 300,
        },
        {
          category: "Transportation",
          amount: 200,
        },
      ],
    });

    expect(
      screen.getByText(
        "Shopping is your largest expense at $900.00.",
      ),
    ).toBeInTheDocument();
  });

  it("handles negative cash flow", () => {
    renderInsights({
      summary: {
        income: 2000,
        expenses: 3000,
        balance: -1000,
        transactionCount: 10,
      },
    });

    expect(
      screen.getByText("Negative cash flow"),
    ).toBeInTheDocument();
  });

  it("handles negative cash flow values correctly", () => {
    renderInsights({
      summary: {
        income: 2000,
        expenses: 3000,
        balance: -1000,
        transactionCount: 10,
      },
    });

    expect(
      screen.getByText(
        "You spent $3,000.00 while earning $2,000.00 this period.",
      ),
    ).toBeInTheDocument();
  });

  it("handles zero income without producing NaN or Infinity", () => {
    renderInsights({
      summary: {
        income: 0,
        expenses: 500,
        balance: -500,
        transactionCount: 5,
      },
    });

    expect(
      screen.queryByText(/NaN/),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText(/Infinity/),
    ).not.toBeInTheDocument();
  });

  it("handles zero expenses", () => {
    renderInsights({
      summary: {
        income: 5000,
        expenses: 0,
        balance: 5000,
        transactionCount: 5,
      },
      spendingByCategory: [],
    });

    expect(
      screen.getByText("Positive cash flow"),
    ).toBeInTheDocument();
  });

  it("handles no spending categories", () => {
    renderInsights({
      spendingByCategory: [],
    });

    expect(
      screen.queryByText("Top spending category"),
    ).not.toBeInTheDocument();
  });

  it("formats INR currency using the selected account currency", () => {
    const account = createAccount({
      name: "Indian Account",
      currency: "INR",
    });

    renderInsights({
      account,
      summary: {
        income: 50000,
        expenses: 20000,
        balance: 30000,
        transactionCount: 20,
      },
      spendingByCategory: [
        {
          category: "Food & Dining",
          amount: 8000,
        },
        {
          category: "Shopping",
          amount: 5000,
        },
      ],
    });

    expect(
      screen.getByText(
        "You earned ₹50,000.00 and spent ₹20,000.00 this period.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Food & Dining is your largest expense at ₹8,000.00.",
      ),
    ).toBeInTheDocument();
  });

  it("uses the provided summary instead of account financial totals", () => {
    const account = createAccount({
      income: 1000,
      expenses: 500,
      balance: 500,
    });

    renderInsights({
      account,
      summary: {
        income: 10000,
        expenses: 2500,
        balance: 7500,
        transactionCount: 25,
      },
    });

    expect(
      screen.getByText(
        "You earned $10,000.00 and spent $2,500.00 this period.",
      ),
    ).toBeInTheDocument();
  });

  it("uses the largest category amount when determining the top category", () => {
    renderInsights({
      spendingByCategory: [
        {
          category: "Transportation",
          amount: 100,
        },
        {
          category: "Entertainment",
          amount: 750,
        },
        {
          category: "Shopping",
          amount: 300,
        },
      ],
    });

    expect(
      screen.getByText(
        "Entertainment is your largest expense at $750.00.",
      ),
    ).toBeInTheDocument();
  });
});