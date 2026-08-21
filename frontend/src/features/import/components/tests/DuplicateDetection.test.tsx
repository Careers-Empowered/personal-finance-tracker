import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import DuplicateDetection from "../DuplicateDetection";
import type { ValidatedTransaction } from "../../types/import";

describe("DuplicateDetection Component", () => {
  const mockDuplicateTransactions: ValidatedTransaction[] = [
    {
      row: 1,
      data: {
        date: "2025-01-20",
        title: "Coffee Shop",
        amount: 4.5,
        type: "expense",
        account: "Main Checking",
        category: "Food & Dining",
      },
      errors: [],
      isValid: true,
      excluded: false,
    },
    {
      row: 2,
      data: {
        date: "2025-01-20",
        title: "Coffee Shop",
        amount: 4.5,
        type: "expense",
        account: "Main Checking",
        category: "Food & Dining",
      },
      errors: [
        {
          field: "transaction",
          message: "Potential duplicate transaction found on row 1.",
        },
      ],
      isValid: false,
      excluded: false,
    },
    {
      row: 3,
      data: {
        date: "2025-01-21",
        title: "Grocery Store",
        amount: 50.0,
        type: "expense",
        account: "Main Checking",
        category: "Food & Dining",
      },
      errors: [],
      isValid: true,
      excluded: false,
    },
  ];

  const defaultProps = {
    transactions: mockDuplicateTransactions,
    onBack: vi.fn(),
    onContinue: vi.fn(),
  };

  it("renders summary with transactions checked, duplicates found, and unique transactions", () => {
    render(<DuplicateDetection {...defaultProps} />);

    expect(screen.getByText("Duplicate Detection")).toBeInTheDocument();
    expect(screen.getByText("Transactions Checked")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument(); // Checked
    expect(screen.getByText("Duplicates Found")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument(); // Duplicates Found
    expect(screen.getByText("Unique Transactions")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument(); // Unique Transactions
  });

  it("shows success banner when no duplicates require attention", () => {
    const noDuplicates = [mockDuplicateTransactions[0], mockDuplicateTransactions[2]];
    render(<DuplicateDetection {...defaultProps} transactions={noDuplicates} />);

    expect(
      screen.getByText("✓ No duplicate transactions require attention.")
    ).toBeInTheDocument();
  });

  it("handles selecting and deselecting duplicate rows individually and in bulk", async () => {
    const user = userEvent.setup();
    render(<DuplicateDetection {...defaultProps} />);

    const selectAllCheckbox = screen.getByLabelText(/Select All Duplicates/i);
    expect(selectAllCheckbox).not.toBeChecked();

    // Select All
    await user.click(selectAllCheckbox);
    expect(selectAllCheckbox).toBeChecked();

    // Unselect All
    await user.click(selectAllCheckbox);
    expect(selectAllCheckbox).not.toBeChecked();

    // Single row select
    const rowCheckbox = screen.getByLabelText(/Row 2/i);
    await user.click(rowCheckbox);
    expect(rowCheckbox).toBeChecked();
    expect(selectAllCheckbox).toBeChecked(); // Since only 1 duplicate
  });

  it("allows excluding a duplicate row and enables Continue", async () => {
    const user = userEvent.setup();
    render(<DuplicateDetection {...defaultProps} />);

    // Initially continue is disabled because of unresolved duplicate
    const continueButton = screen.getByRole("button", {
      name: /Continue with 2 Transactions/i,
    });
    expect(continueButton).toBeDisabled();

    // Exclude row 2
    const excludeButton = screen.getByRole("button", { name: "Exclude" });
    await user.click(excludeButton);

    // Now 0 active duplicates, 2 unique transactions, Continue is enabled
    expect(
      screen.getByText("✓ No duplicate transactions require attention.")
    ).toBeInTheDocument();
    expect(continueButton).not.toBeDisabled();

    await user.click(continueButton);
    expect(defaultProps.onContinue).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ row: 1 }),
        expect.objectContaining({ row: 3 }),
      ]),
      [{ row: 2, action: "exclude" }]
    );
  });

  it("allows bulk excluding selected duplicate rows", async () => {
    const user = userEvent.setup();
    render(<DuplicateDetection {...defaultProps} />);

    await user.click(screen.getByLabelText(/Select All Duplicates/i));
    const excludeSelectedBtn = screen.getByRole("button", {
      name: /Exclude Selected/i,
    });
    await user.click(excludeSelectedBtn);

    expect(
      screen.getByText("✓ No duplicate transactions require attention.")
    ).toBeInTheDocument();
  });

  it("handles Add Anyway flow with reason note", async () => {
    const user = userEvent.setup();
    render(<DuplicateDetection {...defaultProps} />);

    const addAnywayBtn = screen.getByRole("button", { name: "Add Anyway" });
    await user.click(addAnywayBtn);

    // Note dialog opens
    expect(screen.getByText("Add Transaction Anyway")).toBeInTheDocument();

    const noteInput = screen.getByPlaceholderText(/Two separate ATM withdrawals/i);
    await user.type(noteInput, "Recurring subscription with duplicate merchant name");

    const addAnywayButtons = screen.getAllByRole("button", { name: "Add Anyway" });
    const modalConfirmBtn = addAnywayButtons[addAnywayButtons.length - 1];
    await user.click(modalConfirmBtn);

    // Modal closes and row is marked as Added Anyway
    expect(screen.getByText("✓ Added Anyway")).toBeInTheDocument();
    expect(
      screen.getByText("Recurring subscription with duplicate merchant name")
    ).toBeInTheDocument();

    // Continue is now enabled with 3 transactions (1, 2, 3)
    const continueBtn = screen.getByRole("button", {
      name: /Continue with 3 Transactions/i,
    });
    expect(continueBtn).not.toBeDisabled();

    await user.click(continueBtn);
    expect(defaultProps.onContinue).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ row: 1 }),
        expect.objectContaining({ row: 2 }),
        expect.objectContaining({ row: 3 }),
      ]),
      [
        {
          row: 2,
          action: "add-anyway",
          note: "Recurring subscription with duplicate merchant name",
        },
      ]
    );
  });

  it("allows editing note for a row that was added anyway", async () => {
    const user = userEvent.setup();
    render(<DuplicateDetection {...defaultProps} />);

    // Add anyway first
    await user.click(screen.getByRole("button", { name: "Add Anyway" }));
    const noteInput = screen.getByPlaceholderText(/Two separate ATM withdrawals/i);
    await user.type(noteInput, "First reason");
    const addButtons = screen.getAllByRole("button", { name: "Add Anyway" });
    await user.click(addButtons[addButtons.length - 1]);

    // Now button says Edit Notes
    const editNotesBtn = screen.getByRole("button", { name: "Edit Notes" });
    await user.click(editNotesBtn);

    expect(screen.getByText("Edit Add Anyway Note")).toBeInTheDocument();
    const saveChangesBtn = screen.getByRole("button", { name: "Save Changes" });
    await user.clear(screen.getByPlaceholderText(/Two separate ATM withdrawals/i));
    await user.type(
      screen.getByPlaceholderText(/Two separate ATM withdrawals/i),
      "Updated reason"
    );
    await user.click(saveChangesBtn);

    expect(screen.getByText("Updated reason")).toBeInTheDocument();
  });

  it("handles Fix Duplicate Transaction flow", async () => {
    const user = userEvent.setup();
    render(<DuplicateDetection {...defaultProps} />);

    const fixBtn = screen.getByRole("button", { name: "Fix" });
    await user.click(fixBtn);

    expect(screen.getByText("Fix Duplicate Transaction")).toBeInTheDocument();

    // Update the description/title so it is no longer duplicate
    const descInput = screen.getByDisplayValue("Coffee Shop");
    await user.clear(descInput);
    await user.type(descInput, "Tea House");

    const saveChangesBtn = screen.getByRole("button", { name: "Save Changes" });
    await user.click(saveChangesBtn);

    // After fix, dialog is closed
    expect(screen.queryByText("Fix Duplicate Transaction")).not.toBeInTheDocument();
  });

  it("cancels Fix modal without saving changes", async () => {
    const user = userEvent.setup();
    render(<DuplicateDetection {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: "Fix" }));
    expect(screen.getByText("Fix Duplicate Transaction")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByText("Fix Duplicate Transaction")).not.toBeInTheDocument();
  });

  it("calls onBack when Back button is clicked", async () => {
    const user = userEvent.setup();
    render(<DuplicateDetection {...defaultProps} />);

    const backBtn = screen.getByRole("button", { name: "Back" });
    await user.click(backBtn);

    expect(defaultProps.onBack).toHaveBeenCalledTimes(1);
  });
});
