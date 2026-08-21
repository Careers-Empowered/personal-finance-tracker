import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import DatabaseDuplicateCheck, {
  DatabaseDuplicateMatch,
} from "../DatabaseDuplicateCheck";
import type { ValidatedTransaction } from "../../types/import";

describe("DatabaseDuplicateCheck Component", () => {
  const mockTransactions: ValidatedTransaction[] = [
    {
      row: 1,
      data: {
        date: "2025-01-20",
        title: "Starbucks Coffee",
        amount: 5.75,
        type: "expense",
        account: "Chase Checking",
        category: "Food & Dining",
      },
      errors: [],
      isValid: true,
      excluded: false,
    },
    {
      row: 2,
      data: {
        date: "2025-01-21",
        title: "Freelance Client",
        amount: 800,
        type: "income",
        account: "Chase Checking",
        category: "Income",
      },
      errors: [],
      isValid: true,
      excluded: false,
    },
  ];

  const mockMatches: DatabaseDuplicateMatch[] = [
    {
      row: 1,
      exists: true,
      existingTransaction: {
        id: "tx-db-1",
        date: "2025-01-20",
        title: "Starbucks Coffee",
        amount: 5.75,
        type: "EXPENSE",
        account: {
          id: "acc-1",
          name: "Chase Checking",
        },
      },
    },
    {
      row: 2,
      exists: true,
      existingTransaction: {
        id: "tx-db-2",
        date: "2025-01-21",
        title: "Freelance Client",
        amount: "800.00",
        type: "INCOME",
        account: {
          id: "acc-1",
          name: "Chase Checking",
        },
      },
    },
  ];

  const defaultProps = {
    transactions: mockTransactions,
    matches: mockMatches,
    onBack: vi.fn(),
    onContinue: vi.fn(),
  };

  it("returns null if there are no existing duplicate matches", () => {
    const { container } = render(
      <DatabaseDuplicateCheck
        {...defaultProps}
        matches={[
          { row: 1, exists: false },
          { row: 2, exists: false },
        ]}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("renders warning banner with duplicate count correctly for multiple duplicates", () => {
    render(<DatabaseDuplicateCheck {...defaultProps} />);

    expect(screen.getByText("Database Duplicate Check")).toBeInTheDocument();
    expect(screen.getByText(/2 transactions already exist/i)).toBeInTheDocument();
    expect(
      screen.getByText("These transactions were already found in your selected account.")
    ).toBeInTheDocument();
  });

  it("renders warning banner with singular text when only 1 duplicate exists", () => {
    render(
      <DatabaseDuplicateCheck
        {...defaultProps}
        matches={[mockMatches[0]]}
      />
    );

    expect(screen.getByText(/1 transaction already exist/i)).toBeInTheDocument();
  });

  it("renders imported transaction details and matching database transaction details", () => {
    render(<DatabaseDuplicateCheck {...defaultProps} />);

    // Row headers
    expect(screen.getByText("Row 1")).toBeInTheDocument();
    expect(screen.getByText("Row 2")).toBeInTheDocument();

    // Titles
    expect(screen.getAllByText("Starbucks Coffee")).toHaveLength(2); // One in imported, one in db
    expect(screen.getAllByText("Freelance Client")).toHaveLength(2);

    // Formatted amounts
    expect(screen.getAllByText("5.75")).toHaveLength(2);
    expect(screen.getAllByText("800.00")).toHaveLength(2);

    // Formatted types
    expect(screen.getAllByText("Expense")).toHaveLength(2);
    expect(screen.getAllByText("Income")).toHaveLength(2);

    // Account name in database match
    expect(screen.getAllByText("Chase Checking")).toHaveLength(2);
  });

  it("handles missing or unformatted fields gracefully", () => {
    const sparseMatch: DatabaseDuplicateMatch[] = [
      {
        row: 3,
        exists: true,
        existingTransaction: {
          id: "tx-sparse",
          date: undefined,
          title: undefined,
          amount: undefined,
          type: undefined,
          account: undefined,
        },
      },
    ];

    render(
      <DatabaseDuplicateCheck
        {...defaultProps}
        transactions={[]}
        matches={sparseMatch}
      />
    );

    expect(screen.getByText("Row 3")).toBeInTheDocument();
    // Default dashes for missing values
    expect(screen.getAllByText("-").length).toBeGreaterThan(0);
  });

  it("calls onBack when Back button is clicked", async () => {
    const user = userEvent.setup();
    render(<DatabaseDuplicateCheck {...defaultProps} />);

    const backButton = screen.getByRole("button", { name: /Back/i });
    await user.click(backButton);

    expect(defaultProps.onBack).toHaveBeenCalledTimes(1);
  });

  it("calls onContinue when Continue to Import button is clicked", async () => {
    const user = userEvent.setup();
    render(<DatabaseDuplicateCheck {...defaultProps} />);

    const continueButton = screen.getByRole("button", {
      name: /Continue to Import/i,
    });
    await user.click(continueButton);

    expect(defaultProps.onContinue).toHaveBeenCalledTimes(1);
  });
});
