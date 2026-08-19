import {
  cleanup,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import axios from "axios";

import CreateCategory from "./CreateCategory";
import { CategoryProvider } from "../context/CategoryContext";

import type { Category } from "./categoryTypes";

vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockedAxios = vi.mocked(axios);

const customCategory: Category = {
  id: "custom-1",
  name: "Pet Care",
  type: "expense",
  icon: "🐾",
  color: "#E8F1FF",
  isCustom: true,
};

const incomeCategory: Category = {
  id: "income-1",
  name: "Salary",
  type: "income",
  icon: "💼",
  color: "#E8F1FF",
  isCustom: false,
};

const toApiCategory = (category: Category) => ({
  id: category.id,
  userId: category.isCustom ? "test-user" : null,
  name: category.name,
  type:
    category.type === "income"
      ? "INCOME"
      : "EXPENSE",
  icon: category.icon,
  color: category.color,
  isDefault: !category.isCustom,
  subcategories: [],
});

/*
 * The component has two "+ Add Category" buttons
 * when the category list is empty:
 *
 * 1. Header button
 * 2. Empty-state button
 *
 * We intentionally select the first/header button.
 */
const getAddCategoryButton = () => {
  const buttons = screen.getAllByRole("button", {
    name: "+ Add Category",
  });

  return buttons[0];
};

const renderCreateCategory = (
  categories: Category[] = [],
  onCategoryCreate?: (
    category: Category,
  ) => void,
) => {
  mockedAxios.get.mockResolvedValue({
    data: {
      data: categories.map(toApiCategory),
    },
  });

  return render(
    <CategoryProvider>
      <CreateCategory
        onCategoryCreate={onCategoryCreate}
      />
    </CategoryProvider>,
  );
};

describe("CreateCategory", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();

    mockedAxios.get.mockResolvedValue({
      data: {
        data: [],
      },
    });
  });

  it("should render the Categories heading", () => {
    renderCreateCategory();

    expect(
      screen.getByRole("heading", {
        name: "Categories",
      }),
    ).toBeInTheDocument();
  });

  it("should open the create category form", async () => {
    const user = userEvent.setup();

    renderCreateCategory();

    await user.click(getAddCategoryButton());

    expect(
      screen.getByRole("heading", {
        name: "Create Category",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Category Name"),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Create Category",
      }),
    ).toBeInTheDocument();
  });

  it("should show an error when category name is empty", async () => {
    const user = userEvent.setup();

    renderCreateCategory();

    await user.click(getAddCategoryButton());

    await user.click(
      screen.getByRole("button", {
        name: "Create Category",
      }),
    );

    expect(
      screen.getByRole("alert"),
    ).toHaveTextContent(
      "Please enter a category name.",
    );
  });

  it("should prevent duplicate category names", async () => {
    const user = userEvent.setup();

    renderCreateCategory([
      customCategory,
    ]);

    await waitFor(() => {
      expect(
        screen.getByText("Pet Care"),
      ).toBeInTheDocument();
    });

    await user.click(getAddCategoryButton());

    await user.type(
      screen.getByLabelText("Category Name"),
      "pet care",
    );

    await user.click(
      screen.getByRole("button", {
        name: "Create Category",
      }),
    );

    expect(
      screen.getByRole("alert"),
    ).toHaveTextContent(
      "This category already exists.",
    );

    expect(
      mockedAxios.post,
    ).not.toHaveBeenCalled();
  });

  it("should create a new custom category", async () => {
    const user = userEvent.setup();

    const onCategoryCreate = vi.fn();

    mockedAxios.post.mockResolvedValue({
      data: {
        data: {
          id: "created-1",
          name: "Pet Care",
          type: "EXPENSE",
          icon: "🐾",
          color: "#E8F1FF",
          isDefault: false,
        },
      },
    });

    renderCreateCategory(
      [],
      onCategoryCreate,
    );

    await user.click(getAddCategoryButton());

    await user.type(
      screen.getByLabelText("Category Name"),
      "Pet Care",
    );

    await user.click(
      screen.getByRole("button", {
        name: "Create Category",
      }),
    );

    await waitFor(() => {
      expect(
        onCategoryCreate,
      ).toHaveBeenCalledTimes(1);
    });

    expect(
      onCategoryCreate,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Pet Care",
        type: "expense",
        isCustom: true,
      }),
    );

    expect(
      screen.getByText("Pet Care"),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("status"),
    ).toHaveTextContent(
      '"Pet Care" category created successfully.',
    );
  });

  it("should trim spaces from category name", async () => {
    const user = userEvent.setup();

    const onCategoryCreate = vi.fn();

    mockedAxios.post.mockResolvedValue({
      data: {
        data: {
          id: "travel-1",
          name: "Travel",
          type: "EXPENSE",
          icon: "✈️",
          color: "#E8F1FF",
          isDefault: false,
        },
      },
    });

    renderCreateCategory(
      [],
      onCategoryCreate,
    );

    await user.click(getAddCategoryButton());

    await user.type(
      screen.getByLabelText("Category Name"),
      "   Travel   ",
    );

    await user.click(
      screen.getByRole("button", {
        name: "Create Category",
      }),
    );

    await waitFor(() => {
      expect(
        onCategoryCreate,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Travel",
        }),
      );
    });
  });

  it("should switch between expense and income categories", async () => {
    const user = userEvent.setup();

    renderCreateCategory([
      customCategory,
      incomeCategory,
    ]);

    await waitFor(() => {
      expect(
        screen.getByText("Pet Care"),
      ).toBeInTheDocument();
    });

    expect(
      screen.queryByText("Salary"),
    ).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: "Income",
      }),
    );

    await waitFor(() => {
      expect(
        screen.getByText("Salary"),
      ).toBeInTheDocument();
    });

    expect(
      screen.queryByText("Pet Care"),
    ).not.toBeInTheDocument();
  });

  it("should allow editing a custom category", async () => {
    const user = userEvent.setup();

    renderCreateCategory([
      customCategory,
    ]);

    await waitFor(() => {
      expect(
        screen.getByText("Pet Care"),
      ).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole("button", {
        name: "Edit",
      }),
    );

    expect(
      screen.getByText("Edit Category"),
    ).toBeInTheDocument();
  });

  it("should allow deleting a custom category", async () => {
    const user = userEvent.setup();

    renderCreateCategory([
      customCategory,
    ]);

    await waitFor(() => {
      expect(
        screen.getByText("Pet Care"),
      ).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole("button", {
        name: "Delete",
      }),
    );

    expect(
      screen.getByText("Delete Category"),
    ).toBeInTheDocument();
  });

  it("should not show edit and delete actions for default categories", async () => {
    const user = userEvent.setup();

    renderCreateCategory([
      incomeCategory,
    ]);

    /*
     * The component starts on Expense.
     * Salary is an Income category, so switch
     * to Income before checking it.
     */
    await user.click(
      screen.getByRole("button", {
        name: "Income",
      }),
    );

    await waitFor(() => {
      expect(
        screen.getByText("Salary"),
      ).toBeInTheDocument();
    });

    expect(
      screen.queryByRole("button", {
        name: "Edit",
      }),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole("button", {
        name: "Delete",
      }),
    ).not.toBeInTheDocument();
  });

  it("should call onCategoryCreate callback when a category is created", async () => {
    const user = userEvent.setup();

    const onCategoryCreate = vi.fn();

    mockedAxios.post.mockResolvedValue({
      data: {
        data: {
          id: "freelance-1",
          name: "Freelance",
          type: "INCOME",
          icon: "💼",
          color: "#E8F1FF",
          isDefault: false,
        },
      },
    });

    renderCreateCategory(
      [],
      onCategoryCreate,
    );

    await user.click(getAddCategoryButton());

    await user.type(
      screen.getByLabelText("Category Name"),
      "Freelance",
    );

    await user.selectOptions(
      screen.getByLabelText("Category Type"),
      "income",
    );

    await user.click(
      screen.getByRole("button", {
        name: "Create Category",
      }),
    );

    await waitFor(() => {
      expect(
        onCategoryCreate,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Freelance",
          type: "income",
          isCustom: true,
        }),
      );
    });
  });
});