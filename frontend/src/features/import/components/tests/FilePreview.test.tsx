import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import FilePreview from "../FilePreview";

describe("FilePreview Component", () => {
  const sampleCSV = `date,description,amount,debit/credit,account,category
2025-01-15,Target Shopping,45.50,debit,Main Checking,Shopping
2025-01-16,Employer Salary,3000.00,credit,Main Checking,Salary
2025-01-17,Coffee Shop,5.00,debit,Main Checking,Food & Dining`;

  const createMockFile = (content: string, name = "test.csv") => {
    return new File([content], name, { type: "text/csv" });
  };

  const defaultProps = {
    file: createMockFile(sampleCSV),
    onBack: vi.fn(),
    onConfirmMapping: vi.fn(),
  };

  it("reads CSV file, auto-maps columns using smart aliases, and displays preview table", async () => {
    render(<FilePreview {...defaultProps} />);

    expect(screen.getByText("File Preview & Mapping")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("3 rows loaded.")).toBeInTheDocument();
    });

    // Check table headers
    expect(screen.getByRole("columnheader", { name: "date" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "description" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "amount" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "debit/credit" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "account" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "category" })).toBeInTheDocument();

    // Check rows loaded
    expect(screen.getByText("Target Shopping")).toBeInTheDocument();
    expect(screen.getByText("Employer Salary")).toBeInTheDocument();
    expect(screen.getByText("Coffee Shop")).toBeInTheDocument();
  });

  it("handles empty file error", async () => {
    const emptyFile = createMockFile("");
    render(<FilePreview {...defaultProps} file={emptyFile} />);

    await waitFor(() => {
      expect(
        screen.getByText(/The file is empty\.|Unable to read the file\./i)
      ).toBeInTheDocument();
    });
  });

  it("allows editing a row value and saving the change", async () => {
    const user = userEvent.setup();
    render(<FilePreview {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("Target Shopping")).toBeInTheDocument();
    });

    const editButtons = screen.getAllByRole("button", { name: "Edit" });
    await user.click(editButtons[0]);

    // An input should appear with value Target Shopping
    const editInput = screen.getByDisplayValue("Target Shopping");
    await user.clear(editInput);
    await user.type(editInput, "Supermarket");

    const saveButton = screen.getByRole("button", { name: "Save" });
    await user.click(saveButton);

    expect(screen.getByText("Supermarket")).toBeInTheDocument();
    expect(screen.queryByDisplayValue("Supermarket")).not.toBeInTheDocument();
  });

  it("allows deleting a single row", async () => {
    const user = userEvent.setup();
    render(<FilePreview {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("3 rows loaded.")).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole("button", { name: "Delete" });
    await user.click(deleteButtons[0]); // Delete first row (Target Shopping)

    expect(screen.queryByText("Target Shopping")).not.toBeInTheDocument();
    expect(screen.getByText("2 rows loaded.")).toBeInTheDocument();
  });

  it("allows selecting multiple rows and performing bulk deletion", async () => {
    const user = userEvent.setup();
    render(<FilePreview {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("3 rows loaded.")).toBeInTheDocument();
    });

    // Select all checkbox in the header
    const checkboxes = screen.getAllByRole("checkbox");
    await user.click(checkboxes[0]);

    const deleteSelectedBtn = screen.getByRole("button", {
      name: /Delete 3 Selected/i,
    });
    expect(deleteSelectedBtn).toBeInTheDocument();

    await user.click(deleteSelectedBtn);
    expect(screen.getByText("0 rows loaded.")).toBeInTheDocument();
  });

  it("shows error if required fields are missing during confirm mapping", async () => {
    const user = userEvent.setup();
    const partialCSV = `colA,colB\nval1,val2`;
    render(
      <FilePreview {...defaultProps} file={createMockFile(partialCSV)} />
    );

    await waitFor(() => {
      expect(screen.getByText("1 rows loaded.")).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole("button", {
      name: /Confirm Mapping/i,
    });
    await user.click(confirmButton);

    expect(
      screen.getByText(/Please map all required fields/i)
    ).toBeInTheDocument();
    expect(defaultProps.onConfirmMapping).not.toHaveBeenCalled();
  });

  it("shows error if mapped amount column contains non-numeric values", async () => {
    const user = userEvent.setup();
    const invalidAmountCSV = `date,description,amount,debit/credit,account,category
2025-01-15,Store,NotANumber,debit,Checking,Shopping`;

    render(
      <FilePreview
        {...defaultProps}
        file={createMockFile(invalidAmountCSV)}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("1 rows loaded.")).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole("button", {
      name: /Confirm Mapping/i,
    });
    await user.click(confirmButton);

    expect(
      screen.getByText(/Row 1 has an invalid amount/i)
    ).toBeInTheDocument();
    expect(defaultProps.onConfirmMapping).not.toHaveBeenCalled();
  });

  it("successfully confirms mapping and transforms rows into ImportedTransaction objects", async () => {
    const user = userEvent.setup();
    render(<FilePreview {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("3 rows loaded.")).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole("button", {
      name: /Confirm Mapping/i,
    });
    await user.click(confirmButton);

    expect(defaultProps.onConfirmMapping).toHaveBeenCalledWith([
      {
        date: "2025-01-15",
        title: "Target Shopping",
        amount: 45.5,
        type: "expense",
        account: "Main Checking",
        category: "Shopping",
      },
      {
        date: "2025-01-16",
        title: "Employer Salary",
        amount: 3000,
        type: "income",
        account: "Main Checking",
        category: "Salary",
      },
      {
        date: "2025-01-17",
        title: "Coffee Shop",
        amount: 5,
        type: "expense",
        account: "Main Checking",
        category: "Food & Dining",
      },
    ]);
  });

  it("calls onBack when Back button is clicked", async () => {
    const user = userEvent.setup();
    render(<FilePreview {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Back" })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Back" }));
    expect(defaultProps.onBack).toHaveBeenCalledTimes(1);
  });
});
