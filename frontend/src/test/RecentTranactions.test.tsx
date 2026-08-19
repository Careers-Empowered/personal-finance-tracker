import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import RecentTransactions from "../features/dashboard/components/Transactions";
import type {
  Account,
  Transaction,
} from "../types/dashboard";

const createAccount = (
  overrides: Partial<Account> = {},
): Account => ({
  id: "account-1",
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
  ...overrides,
});

const transactions: Transaction[] = [
  {
    id: "1",
    accountId: "account-1",
    date: "2026-08-14",
    description: "Salary",
    category: "Income",
    amount: 5000,
    type: "income",
  },
  {
    id: "2",
    accountId: "account-1",
    date: "2026-08-13",
    description: "Grocery Shopping",
    category: "Food",
    amount: 250,
    type: "expense",
  },
];

describe("RecentTransactions", () => {
  it("renders the heading and description", () => {
    render(<RecentTransactions />);

    expect(
      screen.getByRole("heading", { name: "Recent transactions" }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Your latest financial activity"),
    ).toBeInTheDocument();
  });

  it("shows empty state when no transactions are provided", () => {
    render(<RecentTransactions />);

    expect(
      screen.getByText("No recent transactions available"),
    ).toBeInTheDocument();
  });

  it("shows empty state when transactions array is empty", () => {
    render(<RecentTransactions transactions={[]} />);

    expect(
      screen.getByText("No recent transactions available"),
    ).toBeInTheDocument();
  });

  it("renders income transactions correctly", () => {
    render(
      <RecentTransactions
        transactions={[transactions[0]]}
        accounts={[createAccount()]}
      />,
    );

    expect(screen.getByText("Salary")).toBeInTheDocument();
    expect(screen.getByText(/Income · Checking Account · Aug 14/))
      .toBeInTheDocument();

    expect(screen.getByText("+$5,000.00")).toBeInTheDocument();

    const icon = document.querySelector(
      ".recent-transaction__icon--income",
    );

    expect(icon).toBeInTheDocument();
    expect(icon).toHaveTextContent("+");
  });

  it("renders expense transactions correctly", () => {
    render(
      <RecentTransactions
        transactions={[transactions[1]]}
        accounts={[createAccount()]}
      />,
    );

    expect(screen.getByText("Grocery Shopping")).toBeInTheDocument();

    expect(
      screen.getByText(/Food · Checking Account · Aug 13/),
    ).toBeInTheDocument();

    expect(screen.getByText("−$250.00")).toBeInTheDocument();

    const icon = document.querySelector(
      ".recent-transaction__icon--expense",
    );

    expect(icon).toBeInTheDocument();
    expect(icon).toHaveTextContent("−");
  });

  it("displays the correct account name", () => {
    const account = createAccount({
      id: "account-2",
      name: "Savings Account",
    });

    const transaction: Transaction = {
      ...transactions[0],
      accountId: "account-2",
    };

    render(
      <RecentTransactions
        transactions={[transaction]}
        accounts={[account]}
      />,
    );

    expect(
      screen.getByText(/Income · Savings Account · Aug 14/),
    ).toBeInTheDocument();
  });

  it("uses Account when the account cannot be found", () => {
    const transaction: Transaction = {
      ...transactions[0],
      accountId: "unknown-account",
    };

    render(
      <RecentTransactions
        transactions={[transaction]}
        accounts={[createAccount()]}
      />,
    );

    expect(
      screen.getByText(/Income · Account · Aug 14/),
    ).toBeInTheDocument();
  });
it("sorts transactions by date with the newest first", () => {
  const unsortedTransactions: Transaction[] = [
    {
      id: "old",
      accountId: "account-1",
      date: "2026-08-10",
      description: "Old Transaction",
      category: "Other",
      amount: 100,
      type: "expense",
    },
    {
      id: "new",
      accountId: "account-1",
      date: "2026-08-14",
      description: "New Transaction",
      category: "Income",
      amount: 1000,
      type: "income",
    },
    {
      id: "middle",
      accountId: "account-1",
      date: "2026-08-12",
      description: "Middle Transaction",
      category: "Food",
      amount: 200,
      type: "expense",
    },
  ];

  render(
    <RecentTransactions
      transactions={unsortedTransactions}
      accounts={[createAccount()]}
    />,
  );

  const transactionElements = document.querySelectorAll(
    ".recent-transaction",
  );

  expect(transactionElements).toHaveLength(3);

  expect(transactionElements[0]).toHaveTextContent(
    "New Transaction",
  );

  expect(transactionElements[1]).toHaveTextContent(
    "Middle Transaction",
  );

  expect(transactionElements[2]).toHaveTextContent(
    "Old Transaction",
  );
});

  it("displays at most five recent transactions", () => {
    const manyTransactions: Transaction[] = Array.from(
      { length: 7 },
      (_, index) => ({
        id: `transaction-${index}`,
        accountId: "account-1",
        date: `2026-08-${String(14 - index).padStart(2, "0")}`,
        description: `Transaction ${index + 1}`,
        category: "Other",
        amount: 100 + index,
        type: "expense" as const,
      }),
    );

    render(
      <RecentTransactions
        transactions={manyTransactions}
        accounts={[createAccount()]}
      />,
    );

    expect(screen.getByText("Transaction 1")).toBeInTheDocument();
    expect(screen.getByText("Transaction 5")).toBeInTheDocument();

    expect(screen.queryByText("Transaction 6")).not.toBeInTheDocument();
    expect(screen.queryByText("Transaction 7")).not.toBeInTheDocument();
  });

  it("renders multiple transactions", () => {
    render(
      <RecentTransactions
        transactions={transactions}
        accounts={[createAccount()]}
      />,
    );

    expect(screen.getByText("Salary")).toBeInTheDocument();
    expect(screen.getByText("Grocery Shopping")).toBeInTheDocument();
    expect(screen.getByText("+$5,000.00")).toBeInTheDocument();
    expect(screen.getByText("−$250.00")).toBeInTheDocument();
  });

  it("formats transaction dates correctly", () => {
    render(
      <RecentTransactions
        transactions={transactions}
        accounts={[createAccount()]}
      />,
    );

    expect(
      screen.getByText(/Aug 14/),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Aug 13/),
    ).toBeInTheDocument();
  });
});