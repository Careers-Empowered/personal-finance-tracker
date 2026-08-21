import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import FileUpload from "../FileUpload";

describe("FileUpload Component", () => {
  const mockAccounts = [
    { id: "acc-1", name: "Checking Account", currency: "USD" },
    { id: "acc-2", name: "Savings Account", currency: "EUR" },
  ];

  const defaultProps = {
    mode: "csv" as const,
    onModeChange: vi.fn(),
    onFileSelected: vi.fn(),
    onPreview: vi.fn(),
    accounts: mockAccounts,
    selectedAccountId: "acc-1",
    onAccountChange: vi.fn(),
    accountsLoading: false,
    onTransactionContinue: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createMockFile = (name = "statement.csv", content = "date,desc,amount\n2025-01-01,Test,10", size = 1024) => {
    const file = new File([content], name, { type: "text/csv" });
    Object.defineProperty(file, "size", { value: size });
    return file;
  };

  it("renders header, account selector, mode radio options, and upload dropzone", () => {
    render(<FileUpload {...defaultProps} />);

    expect(screen.getByText("Import Financial File")).toBeInTheDocument();
    expect(screen.getByLabelText("Import Into")).toBeInTheDocument();
    expect(screen.getByText("Checking Account (USD)")).toBeInTheDocument();
    expect(screen.getByLabelText("CSV File")).toBeChecked();
    expect(screen.getByLabelText("Transaction Data / Bank Statement")).not.toBeChecked();
    expect(screen.getByText("Select a CSV file to import")).toBeInTheDocument();
  });

  it("handles accountsLoading state", () => {
    render(<FileUpload {...defaultProps} accountsLoading={true} />);

    const select = screen.getByLabelText("Import Into");
    expect(select).toBeDisabled();
    expect(screen.getByText("Loading accounts...")).toBeInTheDocument();
  });

  it("triggers onAccountChange when an account is selected", async () => {
    const user = userEvent.setup();
    render(<FileUpload {...defaultProps} selectedAccountId="" />);

    const select = screen.getByLabelText("Import Into");
    await user.selectOptions(select, "acc-2");

    expect(defaultProps.onAccountChange).toHaveBeenCalledWith("acc-2");
  });

  it("shows error if Choose File is clicked without selecting an account", async () => {
    const user = userEvent.setup();
    render(<FileUpload {...defaultProps} selectedAccountId="" />);

    const chooseFileBtn = screen.getByRole("button", { name: "Choose File" });
    await user.click(chooseFileBtn);

    expect(
      screen.getByText("Select the account for further actions")
    ).toBeInTheDocument();
  });

  it("switches mode and triggers onModeChange", async () => {
    const user = userEvent.setup();
    render(<FileUpload {...defaultProps} />);

    const txRadio = screen.getByLabelText("Transaction Data / Bank Statement");
    await user.click(txRadio);

    expect(defaultProps.onModeChange).toHaveBeenCalledWith("transaction");
  });

  it("handles valid CSV file upload in csv mode", async () => {
    render(<FileUpload {...defaultProps} />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = createMockFile("expenses.csv", "date,description,amount\n2025-01-01,Food,20");

    await userEvent.upload(fileInput, file);

    expect(defaultProps.onFileSelected).toHaveBeenCalledWith(file);
    expect(screen.getByText("expenses.csv")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Change File" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remove" })).toBeInTheDocument();
  });

  it("handles removing uploaded file", async () => {
    const user = userEvent.setup();
    render(<FileUpload {...defaultProps} />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = createMockFile("expenses.csv");

    await user.upload(fileInput, file);
    expect(screen.getByText("expenses.csv")).toBeInTheDocument();

    const removeBtn = screen.getByRole("button", { name: "Remove" });
    await user.click(removeBtn);

    expect(screen.queryByText("expenses.csv")).not.toBeInTheDocument();
    expect(screen.getByText("Select a CSV file to import")).toBeInTheDocument();
  });

  it("rejects non-CSV files and displays validation error", async () => {
    const user = userEvent.setup();
    render(<FileUpload {...defaultProps} />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const invalidFile = new File(["dummy content"], "report.pdf", {
      type: "application/pdf",
    });

    fireEvent.change(fileInput, { target: { files: [invalidFile] } });

    expect(defaultProps.onFileSelected).not.toHaveBeenCalled();
    expect(
      screen.getByText("Unsupported file type. Please upload a CSV file.")
    ).toBeInTheDocument();
  });

  it("parses and displays summary when file is uploaded in transaction mode", async () => {
    const user = userEvent.setup();
    const statementCSV = `Date,Description,Amount,Account
2025-01-05,Electricity Bill,120.00,Chase
2025-01-10,Salary,2500.00,Chase`;

    render(
      <FileUpload
        {...defaultProps}
        mode="transaction"
      />
    );

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = createMockFile("statement.csv", statementCSV);

    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(screen.getByText("Transactions found")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
      expect(screen.getByText(/05 Jan 2025 → 10 Jan 2025/i)).toBeInTheDocument();
      expect(screen.getByText("Chase")).toBeInTheDocument();
    });
  });

  it("triggers onTransactionContinue when Continue to Import is clicked in transaction mode", async () => {
    const user = userEvent.setup();
    const statementCSV = `Date,Description,Amount,Account
2025-01-05,Electricity Bill,120.00,Chase`;

    render(
      <FileUpload
        {...defaultProps}
        mode="transaction"
      />
    );

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = createMockFile("statement.csv", statementCSV);

    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(screen.getByText("Transactions found")).toBeInTheDocument();
    });
  });
});
