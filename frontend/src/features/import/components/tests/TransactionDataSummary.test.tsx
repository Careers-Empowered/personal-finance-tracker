import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TransactionDataSummary from "../TransactionDataSummary";
import { parseTransactionData } from "../../utils/transactionDataParser";

vi.mock("../../utils/transactionDataParser", () => ({
  parseTransactionData: vi.fn(),
}));

describe("TransactionDataSummary Component", () => {
  const mockFile = new File(["date,amount\n2025-01-01,10"], "statement.csv", {
    type: "text/csv",
  });

  const defaultProps = {
    file: mockFile,
    onContinue: vi.fn(),
    onBack: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("displays loading state initially and then shows transaction summary", async () => {
    vi.mocked(parseTransactionData).mockResolvedValueOnce({
      transactionCount: 42,
      earliestDate: new Date(2025, 0, 1),
      latestDate: new Date(2025, 0, 31),
    });

    render(<TransactionDataSummary {...defaultProps} />);

    expect(screen.getByText("Reading transaction data...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("statement.csv")).toBeInTheDocument();
    });

    expect(screen.getByText("Transactions found")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("Transaction period")).toBeInTheDocument();
    expect(screen.getByText(/01 Jan 2025 → 31 Jan 2025/i)).toBeInTheDocument();
  });

  it("displays error message when parsing fails and allows choosing another file", async () => {
    const user = userEvent.setup();
    vi.mocked(parseTransactionData).mockRejectedValueOnce(
      new Error("Invalid CSV structure")
    );

    render(<TransactionDataSummary {...defaultProps} />);

    await waitFor(() => {
      expect(
        screen.getByText("Unable to read transaction data")
      ).toBeInTheDocument();
      expect(screen.getByText("Invalid CSV structure")).toBeInTheDocument();
    });

    const chooseAnotherBtn = screen.getByRole("button", {
      name: /Choose Another File/i,
    });
    await user.click(chooseAnotherBtn);

    expect(defaultProps.onBack).toHaveBeenCalledTimes(1);
  });

  it("calls onContinue when Continue button is clicked", async () => {
    const user = userEvent.setup();
    vi.mocked(parseTransactionData).mockResolvedValueOnce({
      transactionCount: 10,
      earliestDate: new Date(2025, 0, 1),
      latestDate: new Date(2025, 0, 10),
    });

    render(<TransactionDataSummary {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("statement.csv")).toBeInTheDocument();
    });

    const continueBtn = screen.getByRole("button", { name: "Continue" });
    await user.click(continueBtn);

    expect(defaultProps.onContinue).toHaveBeenCalledTimes(1);
  });

  it("calls onBack when Back button is clicked", async () => {
    const user = userEvent.setup();
    vi.mocked(parseTransactionData).mockResolvedValueOnce({
      transactionCount: 10,
      earliestDate: new Date(2025, 0, 1),
      latestDate: new Date(2025, 0, 10),
    });

    render(<TransactionDataSummary {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("statement.csv")).toBeInTheDocument();
    });

    const backBtn = screen.getByRole("button", { name: "Back" });
    await user.click(backBtn);

    expect(defaultProps.onBack).toHaveBeenCalledTimes(1);
  });
});
