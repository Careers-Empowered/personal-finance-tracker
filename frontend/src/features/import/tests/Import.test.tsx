import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Import from "../Import";
import api from "../../../shared/utils/api";
import { suggestCategoryByRules } from "../categorization/ruleCategorizationService";
//import { suggestCategory } from "../categorization/categorySuggestionService";

vi.mock("../../../shared/utils/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock("../categorization/ruleCategorizationService", () => ({
  suggestCategoryByRules: vi.fn(),
}));

vi.mock("../categorization/categorySuggestionService", () => ({
  suggestCategory: vi.fn(),
}));

describe("Import Page Component", () => {
  const mockAccounts = [
    { id: "acc-1", name: "Primary Checking", currency: "USD" },
    { id: "acc-2", name: "Savings", currency: "USD" },
  ];

  const mockCategories = [
    { id: "cat-food", name: "Food & Dining" },
    { id: "cat-income", name: "Income" },
  ];

  const mockSubcategories = [
    { id: "sub-food", name: "Groceries", categoryId: "cat-food" },
    { id: "sub-salary", name: "Salary", categoryId: "cat-income" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    window.alert = vi.fn();
    window.confirm = vi.fn(() => true);
  });

  it("loads user accounts on mount and renders upload step", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockAccounts });

    render(<Import />);

    expect(screen.getByRole("heading", { name: "Import" })).toBeInTheDocument();

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith("/api/transactions/accounts");
      expect(screen.getByText("Primary Checking (USD)")).toBeInTheDocument();
    });
  });

  it("handles account loading failure with alert", async () => {
    vi.mocked(api.get).mockRejectedValueOnce(new Error("Accounts load error"));

    render(<Import />);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        "Unable to load accounts. Please refresh the page and try again."
      );
    });
  });

  it("executes standard CSV step-by-step import workflow", async () => {
    const user = userEvent.setup();

    // 1. Initial accounts load
    vi.mocked(api.get).mockImplementation(async (url: string) => {
      if (url === "/api/transactions/accounts") {
        return { data: mockAccounts };
      }
      if (url === "/api/transactions/categories") {
        return { data: mockCategories };
      }
      if (url === "/api/transactions/subcategories") {
        return { data: mockSubcategories };
      }
      return { data: [] };
    });

    vi.mocked(api.post).mockImplementation(async (url: string) => {
      if (url === "/api/transactions/check-existing") {
        return { data: { existingTransactions: [] } };
      }
      if (url === "/api/transactions") {
        return { data: { id: "tx-new-1" } };
      }
      return { data: {} };
    });

    render(<Import />);

    await waitFor(() => {
      expect(screen.getByLabelText("Import Into")).toBeInTheDocument();
    });

    // Select account
    await user.selectOptions(screen.getByLabelText("Import Into"), "acc-1");

    // Upload CSV file
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const csvContent = `date,description,amount,debit/credit,account,category\n2025-01-15,Supermarket,50.00,debit,Primary Checking,Food & Dining`;
    const file = new File([csvContent], "transactions.csv", { type: "text/csv" });
    await user.upload(fileInput, file);

    // Click Preview
    expect(screen.getByText("transactions.csv")).toBeInTheDocument();
    // Simulate mapping confirm from FilePreview
    // Since FilePreview is rendered when step === 'preview'
    // Let's click choose file / preview if exposed or test workflow
  });

  it("handles Bank Statement / Transaction Data import flow", async () => {
    const user = userEvent.setup();

    vi.mocked(api.get).mockImplementation(async (url: string) => {
      if (url === "/api/transactions/accounts") {
        return { data: mockAccounts };
      }
      if (url === "/api/transactions/categories") {
        return { data: mockCategories };
      }
      if (url === "/api/transactions/subcategories") {
        return { data: mockSubcategories };
      }
      return { data: [] };
    });

    vi.mocked(api.post).mockImplementation(async (url: string) => {
      if (url === "/api/transactions/check-existing") {
        return { data: { existingTransactions: [] } };
      }
      if (url === "/api/transactions") {
        return { data: { id: "tx-imported-1" } };
      }
      return { data: {} };
    });

    vi.mocked(suggestCategoryByRules).mockReturnValue("Food & Dining");

    render(<Import />);

    await waitFor(() => {
      expect(screen.getByLabelText("Import Into")).toBeInTheDocument();
    });

    // Select account
    await user.selectOptions(screen.getByLabelText("Import Into"), "acc-1");

    // Switch to Transaction Data mode
    await user.click(screen.getByLabelText("Transaction Data / Bank Statement"));

    // Upload transaction CSV
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const statementCSV = `Date,Description,Amount,Account\n2025-01-15,Supermarket,50.00,Checking`;
    const file = new File([statementCSV], "statement.csv", { type: "text/csv" });
    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(screen.getByText("Transactions found")).toBeInTheDocument();
    });

    // In transaction mode, FileUpload displays summary with Continue
    const continueBtn = screen.getByRole("button", { name: "Continue" });
    await user.click(continueBtn);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        "/api/transactions/check-existing",
        expect.anything()
      );
      expect(api.post).toHaveBeenCalledWith(
        "/api/transactions",
        expect.objectContaining({
          accountId: "acc-1",
          categoryId: "cat-food",
          subcategoryId: "sub-food",
          amount: 50,
          title: "Supermarket",
        })
      );
    });

    expect(window.alert).toHaveBeenCalledWith(
      "1 transactions imported successfully."
    );
  });

  it("handles database duplicates warning and excluding them before import", async () => {
    const user = userEvent.setup();

    vi.mocked(api.get).mockImplementation(async (url: string) => {
      if (url === "/api/transactions/accounts") {
        return { data: mockAccounts };
      }
      if (url === "/api/transactions/categories") {
        return { data: mockCategories };
      }
      if (url === "/api/transactions/subcategories") {
        return { data: mockSubcategories };
      }
      return { data: [] };
    });

    // Return 1 existing duplicate and 1 non-duplicate
    vi.mocked(api.post).mockImplementation(async (url: string) => {
      if (url === "/api/transactions/check-existing") {
        return {
          data: {
            existingTransactions: [
              {
                row: 1,
                exists: true,
                existingTransaction: {
                  id: "tx-existing-1",
                  date: "2025-01-15",
                  title: "Existing Item",
                  amount: 20,
                  type: "EXPENSE",
                },
              },
            ],
          },
        };
      }
      if (url === "/api/transactions") {
        return { data: { id: "tx-created-2" } };
      }
      return { data: {} };
    });

    vi.mocked(suggestCategoryByRules).mockReturnValue("Food & Dining");

    render(<Import />);

    await waitFor(() => {
      expect(screen.getByLabelText("Import Into")).toBeInTheDocument();
    });

    await user.selectOptions(screen.getByLabelText("Import Into"), "acc-1");
    await user.click(screen.getByLabelText("Transaction Data / Bank Statement"));

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const statementCSV = `Date,Description,Amount,Account
2025-01-15,Existing Item,20.00,Checking
2025-01-16,New Item,40.00,Checking`;

    const file = new File([statementCSV], "statement.csv", { type: "text/csv" });
    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(screen.getByText("Transactions found")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Continue" }));

    // Database duplicate check step appears
    await waitFor(() => {
      expect(screen.getByText("Database Duplicate Check")).toBeInTheDocument();
      expect(screen.getByText("⚠ Database Duplicate Warning")).toBeInTheDocument();
      expect(screen.getByText(/1 transaction from this import already exists/i)).toBeInTheDocument();
    });

    // Click Exclude 1 Duplicate & Continue
    const excludeAndContinueBtn = screen.getByRole("button", {
      name: /Exclude 1 Duplicate & Continue/i,
    });
    await user.click(excludeAndContinueBtn);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        "/api/transactions",
        expect.objectContaining({
          title: "New Item",
          amount: 40,
        })
      );
    });

    expect(window.alert).toHaveBeenCalledWith(
      "1 transactions imported successfully."
    );
  });
});
