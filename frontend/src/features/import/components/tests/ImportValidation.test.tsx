import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ImportValidation, { CategorySuggestion } from "../ImportValidation";
import type { ImportedTransaction } from "../../types/import";

vi.mock("../CategoryEditableDropdown", () => ({
  CategoryEditableDropdown: ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (val: string) => void;
  }) => (
    <input
      data-testid="mock-category-dropdown"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Select category or type custom..."
    />
  ),
  default: ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (val: string) => void;
  }) => (
    <input
      data-testid="mock-category-dropdown"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Select category or type custom..."
    />
  ),
}));

describe("ImportValidation Component", () => {
  const mockTransactions: ImportedTransaction[] = [
    {
      date: "2025-01-15",
      title: "Grocery Store",
      amount: 45.0,
      type: "expense",
      account: "Checking",
      category: "Food & Dining",
    },
    {
      date: "2025-01-16",
      title: "Unknown Merchant",
      amount: 100.0,
      type: "expense",
      account: "Checking",
      category: "", // Needs category only
    },
    {
      date: "invalid-date",
      title: "Malformed Row",
      amount: -10, // Invalid date & negative amount
      type: "expense",
      account: "",
      category: "Misc",
    },
  ];

  const defaultProps = {
    transactions: mockTransactions,
    onContinue: vi.fn(),
    onBack: vi.fn(),
    onCategorize: vi.fn(),
  };

  it("renders summary cards and rows with appropriate validity statuses", () => {
    render(<ImportValidation {...defaultProps} />);

    expect(screen.getByText("Import Validation")).toBeInTheDocument();
    expect(screen.getByText("Total")).toBeInTheDocument();
    expect(screen.getByText("Valid")).toBeInTheDocument();
    expect(screen.getByText("Needs Attention")).toBeInTheDocument();
    expect(screen.getByText("Excluded")).toBeInTheDocument();

    expect(screen.getByText("✓ Valid")).toBeInTheDocument(); // Row 1
    expect(screen.getByText("ⓘ Category needed")).toBeInTheDocument(); // Row 2
    expect(screen.getByText("⚠ Needs Attention")).toBeInTheDocument(); // Row 3
  });

  it("handles excluding and re-including an invalid transaction", async () => {
    const user = userEvent.setup();
    render(<ImportValidation {...defaultProps} />);

    const excludeButtons = screen.getAllByRole("button", { name: "Exclude" });
    await user.click(excludeButtons[0]);

    const includeButton = screen.getByRole("button", { name: "Include" });
    expect(includeButton).toBeInTheDocument();

    await user.click(includeButton);
    expect(screen.queryByRole("button", { name: "Include" })).not.toBeInTheDocument();
  });

  it("allows editing and fixing a malformed transaction", async () => {
    const user = userEvent.setup();
    render(<ImportValidation {...defaultProps} />);

    // Row 3 has malformed non-category fields (last Fix button)
    const fixButtons = screen.getAllByRole("button", { name: "Fix" });
    await user.click(fixButtons[fixButtons.length - 1]);

    // Editing inputs appear
    const dateInput = screen.getByDisplayValue("invalid-date");
    await user.clear(dateInput);
    await user.type(dateInput, "2025-01-20");

    const amountInput = screen.getByDisplayValue("-10");
    await user.clear(amountInput);
    await user.type(amountInput, "10");

    const accountInputs = screen.getAllByDisplayValue("");
    // One of them is account input
    await user.type(accountInputs[0], "Checking");

    const saveFixButton = screen.getByRole("button", { name: "Save Fix" });
    await user.click(saveFixButton);

    // Form closes
    expect(screen.queryByRole("button", { name: "Save Fix" })).not.toBeInTheDocument();
  });

  it("handles AI/Rule category suggestion and accepting it", async () => {
    const user = userEvent.setup();
    const mockSuggestion: CategorySuggestion = {
      category: "Entertainment",
      source: "SLM",
      confidence: 0.95,
    };
    vi.mocked(defaultProps.onCategorize).mockResolvedValue(mockSuggestion);

    render(<ImportValidation {...defaultProps} />);

    const categorizeButton = screen.getByRole("button", {
      name: /✨ Categorize/i,
    });
    await user.click(categorizeButton);

    await waitFor(() => {
      expect(defaultProps.onCategorize).toHaveBeenCalled();
      expect(screen.getByText("Suggested category")).toBeInTheDocument();
      expect(screen.getByText("Entertainment")).toBeInTheDocument();
      expect(screen.getByText(/AI suggestion · 95%/i)).toBeInTheDocument();
    });

    const acceptButton = screen.getByRole("button", {
      name: /Accept category/i,
    });
    await user.click(acceptButton);

    expect(screen.getByText("✓ Category confirmed")).toBeInTheDocument();
  });

  it("shows message when onCategorize is not provided", async () => {
    const user = userEvent.setup();
    render(<ImportValidation {...defaultProps} onCategorize={undefined} />);

    const categorizeButton = screen.getByRole("button", {
      name: /✨ Categorize/i,
    });
    await user.click(categorizeButton);

    expect(
      screen.getByText("Categorization is not connected yet.")
    ).toBeInTheDocument();
  });

  it("allows manually entering a category via dropdown and saving it", async () => {
    const user = userEvent.setup();
    render(<ImportValidation {...defaultProps} />);

    // Row 2 has "Category needed"
    const fixCategoryBtns = screen.getAllByRole("button", { name: "Fix" });
    // Click manual fix for category
    await user.click(fixCategoryBtns[0]);

    const dropdown = screen.getByTestId("mock-category-dropdown");
    await user.type(dropdown, "Utilities");

    const saveBtn = screen.getByRole("button", { name: "Save" });
    await user.click(saveBtn);

    expect(screen.getByText("✓ Category confirmed")).toBeInTheDocument();
  });

  it("calls onBack when Back button is clicked", async () => {
    const user = userEvent.setup();
    render(<ImportValidation {...defaultProps} />);

    const backButton = screen.getByRole("button", { name: "Back" });
    await user.click(backButton);

    expect(defaultProps.onBack).toHaveBeenCalledTimes(1);
  });

  it("calls onContinue with valid transactions when Continue is clicked", async () => {
    const user = userEvent.setup();
    const allValidTransactions: ImportedTransaction[] = [
      {
        date: "2025-01-15",
        title: "Coffee",
        amount: 5,
        type: "expense",
        account: "Checking",
        category: "Food & Dining",
      },
    ];

    render(
      <ImportValidation
        {...defaultProps}
        transactions={allValidTransactions}
      />
    );

    const continueBtn = screen.getByRole("button", {
      name: /Continue with 1 Transactions/i,
    });
    expect(continueBtn).not.toBeDisabled();

    await user.click(continueBtn);
    expect(defaultProps.onContinue).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          data: expect.objectContaining({ title: "Coffee" }),
        }),
      ])
    );
  });
});
