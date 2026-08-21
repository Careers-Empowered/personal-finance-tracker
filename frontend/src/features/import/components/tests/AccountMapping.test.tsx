import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AccountMapping from "../AccountMapping";
import api from "../../../../shared/utils/api";
import type { ValidatedTransaction } from "../../types/import";

vi.mock("../../../../shared/utils/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe("AccountMapping Component", () => {
  const mockTransactions: ValidatedTransaction[] = [
    {
      row: 1,
      data: {
        date: "2025-01-15",
        title: "Grocery Store",
        amount: 54.2,
        type: "expense",
        account: "Checking",
        category: "Food & Dining",
      },
      errors: [],
      isValid: true,
      excluded: false,
    },
    {
      row: 2,
      data: {
        date: "2025-01-16",
        title: "Payroll",
        amount: 2500,
        type: "income",
        account: "Checking",
        category: "Salary",
      },
      errors: [],
      isValid: true,
      excluded: false,
    },
  ];

  const defaultProps = {
    transactions: mockTransactions,
    onBack: vi.fn(),
    onContinue: vi.fn(),
  };

  const mockAccounts = [
    {
      id: "acc-1",
      name: "Primary Checking",
      currency: "USD",
      balance: 1500,
      isPrimary: true,
    },
    {
      id: "acc-2",
      name: "Savings Account",
      currency: "EUR",
      balance: 10000,
      isPrimary: false,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("displays loading state initially and renders accounts once fetched", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockAccounts });

    render(<AccountMapping {...defaultProps} />);

    expect(screen.getByText("Loading your accounts...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByLabelText(/Import Into/i)).toBeInTheDocument();
    });

    expect(screen.getByText("Primary Checking (USD)")).toBeInTheDocument();
    expect(screen.getByText("Savings Account (EUR)")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(
      screen.getByText(/transactions will be imported into the selected account/i)
    ).toBeInTheDocument();
  });

  it("automatically pre-selects the primary account if present", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockAccounts });

    render(<AccountMapping {...defaultProps} />);

    await waitFor(() => {
      const select = screen.getByLabelText(/Import Into/i) as HTMLSelectElement;
      expect(select.value).toBe("acc-1");
    });

    const continueButton = screen.getByRole("button", {
      name: /Continue to Import/i,
    });
    expect(continueButton).not.toBeDisabled();
  });

  it("allows selecting a different account from the dropdown", async () => {
    const user = userEvent.setup();
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockAccounts });

    render(<AccountMapping {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Import Into/i)).toBeInTheDocument();
    });

    const select = screen.getByLabelText(/Import Into/i);
    await user.selectOptions(select, "acc-2");

    expect((select as HTMLSelectElement).value).toBe("acc-2");
  });

  it("calls onContinue with selected account ID when Continue is clicked", async () => {
    const user = userEvent.setup();
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockAccounts });

    render(<AccountMapping {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Import Into/i)).toBeInTheDocument();
    });

    const select = screen.getByLabelText(/Import Into/i);
    await user.selectOptions(select, "acc-2");

    const continueButton = screen.getByRole("button", {
      name: /Continue to Import/i,
    });
    await user.click(continueButton);

    expect(defaultProps.onContinue).toHaveBeenCalledWith("acc-2");
  });

  it("calls onBack when Back button is clicked", async () => {
    const user = userEvent.setup();
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockAccounts });

    render(<AccountMapping {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Back/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /Back/i }));
    expect(defaultProps.onBack).toHaveBeenCalledTimes(1);
  });

  it("handles empty accounts response", async () => {
    const user = userEvent.setup();
    vi.mocked(api.get).mockResolvedValueOnce({ data: [] });

    render(<AccountMapping {...defaultProps} />);

    await waitFor(() => {
      expect(
        screen.getByText(/No accounts are available. Please create an account before importing transactions./i)
      ).toBeInTheDocument();
    });

    const backButton = screen.getByRole("button", { name: /Back/i });
    expect(backButton).toBeInTheDocument();
    await user.click(backButton);
    expect(defaultProps.onBack).toHaveBeenCalledTimes(1);
  });

  it("displays error message when fetching accounts fails and allows going back", async () => {
    const user = userEvent.setup();
    vi.mocked(api.get).mockRejectedValueOnce({
      response: { data: { error: "Network connection failed" } },
    });

    render(<AccountMapping {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("Network connection failed")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /Back/i }));
    expect(defaultProps.onBack).toHaveBeenCalledTimes(1);
  });

  it("displays fallback error message when error response has no custom message", async () => {
    vi.mocked(api.get).mockRejectedValueOnce(new Error("Generic error"));

    render(<AccountMapping {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("Unable to load accounts.")).toBeInTheDocument();
    });
  });

  it("disables Continue to Import if no account is selected", async () => {
    const user = userEvent.setup();
    const accountsWithoutPrimary = [
      {
        id: "acc-3",
        name: "Non-primary Account",
        currency: "USD",
        balance: 500,
        isPrimary: false,
      },
    ];
    vi.mocked(api.get).mockResolvedValueOnce({ data: accountsWithoutPrimary });

    render(<AccountMapping {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Import Into/i)).toBeInTheDocument();
    });

    const select = screen.getByLabelText(/Import Into/i);
    expect((select as HTMLSelectElement).value).toBe("");

    const continueButton = screen.getByRole("button", {
      name: /Continue to Import/i,
    });
    expect(continueButton).toBeDisabled();

    // Clicking it when disabled should not invoke onContinue
    await user.click(continueButton);
    expect(defaultProps.onContinue).not.toHaveBeenCalled();
  });
});
