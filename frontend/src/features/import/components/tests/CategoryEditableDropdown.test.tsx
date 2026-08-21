import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CategoryEditableDropdown from "../CategoryEditableDropdown";
import { apiFetch } from "../../../../shared/utils/api";

vi.mock("../../../../shared/utils/api", () => ({
  apiFetch: vi.fn(),
}));

describe("CategoryEditableDropdown Component", () => {
  const defaultProps = {
    value: "",
    onChange: vi.fn(),
    placeholder: "Select or type category...",
  };

  const mockCategoriesData = [
    { id: "cat-1", name: "Groceries", type: "EXPENSE", icon: "🛒" },
    { id: "cat-2", name: "Freelance", type: "INCOME", icon: "💼" },
  ];

  const mockTransactionsData = [
    { category: { name: "Groceries" }, subcategory: { name: "Supermarket" } },
    { category: "Groceries" },
    { categoryName: "Utilities" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with placeholder and initial value", () => {
    vi.mocked(apiFetch).mockResolvedValue([]);

    render(
      <CategoryEditableDropdown
        {...defaultProps}
        value="Food & Dining"
        placeholder="Custom placeholder"
      />
    );

    const input = screen.getByPlaceholderText("Custom placeholder") as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.value).toBe("Food & Dining");
  });

  it("fetches categories and transactions on mount and displays them when dropdown is opened", async () => {
    const user = userEvent.setup();
    vi.mocked(apiFetch).mockImplementation(async (url: string) => {
      if (url.includes("/categories")) {
        return mockCategoriesData;
      }
      if (url.includes("/transactions")) {
        return mockTransactionsData;
      }
      return [];
    });

    render(<CategoryEditableDropdown {...defaultProps} />);

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith("/api/transactions/categories");
      expect(apiFetch).toHaveBeenCalledWith("/api/transactions?limit=10000");
    });

    const input = screen.getByPlaceholderText("Select or type category...");
    await user.click(input);

    expect(screen.getByText("Groceries")).toBeInTheDocument();
    expect(screen.getByText("Freelance")).toBeInTheDocument();
    expect(screen.getByText("Supermarket")).toBeInTheDocument();
    expect(screen.getByText("Utilities")).toBeInTheDocument();
    expect(screen.getByText("Food & Dining")).toBeInTheDocument();
  });

  it("toggles dropdown visibility using the toggle arrow button", async () => {
    const user = userEvent.setup();
    vi.mocked(apiFetch).mockResolvedValue([]);

    render(<CategoryEditableDropdown {...defaultProps} />);

    const toggleButton = screen.getByTitle("Toggle category list");
    expect(screen.queryByText("Food & Dining")).not.toBeInTheDocument();

    await user.click(toggleButton);
    expect(screen.getByText("Food & Dining")).toBeInTheDocument();

    await user.click(toggleButton);
    expect(screen.queryByText("Food & Dining")).not.toBeInTheDocument();
  });

  it("filters category options when user types in the input", async () => {
    const user = userEvent.setup();
    vi.mocked(apiFetch).mockResolvedValue([]);

    render(<CategoryEditableDropdown {...defaultProps} />);

    const input = screen.getByPlaceholderText("Select or type category...");
    await user.type(input, "Shop");

    expect(defaultProps.onChange).toHaveBeenCalled();
    expect(screen.getByText("Shopping")).toBeInTheDocument();
    expect(screen.queryByText("Food & Dining")).not.toBeInTheDocument();
  });

  it("selects category on item click and calls onChange with selected category name", async () => {
    const user = userEvent.setup();
    vi.mocked(apiFetch).mockResolvedValue([]);

    render(<CategoryEditableDropdown {...defaultProps} />);

    const input = screen.getByPlaceholderText("Select or type category...");
    await user.click(input);

    const foodOption = screen.getByText("Food & Dining");
    await user.click(foodOption);

    expect(defaultProps.onChange).toHaveBeenCalledWith("Food & Dining");
    expect(screen.queryByText("Housing & Rent")).not.toBeInTheDocument();
  });

  it("shows 'Add custom category' option when value does not match existing categories", async () => {
    const user = userEvent.setup();
    vi.mocked(apiFetch).mockResolvedValue([]);

    render(<CategoryEditableDropdown {...defaultProps} value="Cryptocurrency" />);

    const toggleButton = screen.getByTitle("Toggle category list");
    await user.click(toggleButton);

    const addCustomOption = screen.getByText(/Add custom category: "Cryptocurrency"/i);
    expect(addCustomOption).toBeInTheDocument();

    await user.click(addCustomOption);
    expect(defaultProps.onChange).toHaveBeenCalledWith("Cryptocurrency");
  });

  it("closes dropdown when clicking outside", async () => {
    const user = userEvent.setup();
    vi.mocked(apiFetch).mockResolvedValue([]);

    render(
      <div>
        <div data-testid="outside-element">Outside</div>
        <CategoryEditableDropdown {...defaultProps} />
      </div>
    );

    const input = screen.getByPlaceholderText("Select or type category...");
    await user.click(input);
    expect(screen.getByText("Food & Dining")).toBeInTheDocument();

    // Click outside
    fireEvent.mouseDown(screen.getByTestId("outside-element"));
    expect(screen.queryByText("Food & Dining")).not.toBeInTheDocument();
  });

  it("falls back to default categories if API fetch fails", async () => {
    const user = userEvent.setup();
    vi.mocked(apiFetch).mockRejectedValue(new Error("Network Error"));

    render(<CategoryEditableDropdown {...defaultProps} />);

    const input = screen.getByPlaceholderText("Select or type category...");
    await user.click(input);

    await waitFor(() => {
      expect(screen.getByText("Food & Dining")).toBeInTheDocument();
      expect(screen.getByText("Entertainment")).toBeInTheDocument();
    });
  });

  it("handles empty categories match message", async () => {
    const user = userEvent.setup();
    vi.mocked(apiFetch).mockResolvedValue([]);

    render(<CategoryEditableDropdown {...defaultProps} value="" />);

    const input = screen.getByPlaceholderText("Select or type category...");
    await user.type(input, "xyznonexistent");

    expect(screen.queryByText("Food & Dining")).not.toBeInTheDocument();
  });
});
