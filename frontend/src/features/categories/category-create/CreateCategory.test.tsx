import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import CreateCategory from "./CreateCategory";
import type { Category } from "./categoryTypes";

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

describe("CreateCategory", () => {
  it("should render the Categories heading", () => {
    render(<CreateCategory />);

    expect(
      screen.getByRole("heading", { name: "Categories" })
    ).toBeInTheDocument();
  });

  it("should open the create category form", async () => {
    const user = userEvent.setup();

    render(<CreateCategory />);

    await user.click(
      screen.getByRole("button", {
        name: "+ Add Category",
      })
    );

    expect(
      screen.getByRole("heading", {
        name: "Create Category",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Category Name")
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Create Category",
      })
    ).toBeInTheDocument();
  });

  it("should show an error when category name is empty", async () => {
    const user = userEvent.setup();

    render(<CreateCategory />);

    await user.click(
      screen.getByRole("button", {
        name: "+ Add Category",
      })
    );

    await user.click(
      screen.getByRole("button", {
        name: "Create Category",
      })
    );

    expect(
      screen.getByRole("alert")
    ).toHaveTextContent(
      "Please enter a category name."
    );
  });

  it("should prevent duplicate category names", async () => {
    const user = userEvent.setup();

    render(
      <CreateCategory
        categories={[customCategory]}
      />
    );

    await user.click(
      screen.getByRole("button", {
        name: "+ Add Category",
      })
    );

    await user.type(
      screen.getByLabelText("Category Name"),
      "pet care"
    );

    await user.click(
      screen.getByRole("button", {
        name: "Create Category",
      })
    );

    expect(
      screen.getByRole("alert")
    ).toHaveTextContent(
      "This category already exists."
    );
  });

  it("should create a new custom category", async () => {
    const user = userEvent.setup();

    const onCategoryCreate = vi.fn();

    render(
      <CreateCategory
        categories={[]}
        onCategoryCreate={onCategoryCreate}
      />
    );

    await user.click(
      screen.getByRole("button", {
        name: "+ Add Category",
      })
    );

    await user.type(
      screen.getByLabelText("Category Name"),
      "Pet Care"
    );

    await user.click(
      screen.getByRole("button", {
        name: "Create Category",
      })
    );

    expect(onCategoryCreate).toHaveBeenCalledTimes(1);

    expect(onCategoryCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Pet Care",
        type: "expense",
        isCustom: true,
      })
    );

    expect(
      screen.getByText("Pet Care")
    ).toBeInTheDocument();

    expect(
      screen.getByRole("status")
    ).toHaveTextContent(
      '"Pet Care" category created successfully.'
    );
  });

  it("should trim spaces from category name", async () => {
    const user = userEvent.setup();

    const onCategoryCreate = vi.fn();

    render(
      <CreateCategory
        categories={[]}
        onCategoryCreate={onCategoryCreate}
      />
    );

    await user.click(
      screen.getByRole("button", {
        name: "+ Add Category",
      })
    );

    await user.type(
      screen.getByLabelText("Category Name"),
      "   Travel   "
    );

    await user.click(
      screen.getByRole("button", {
        name: "Create Category",
      })
    );

    expect(onCategoryCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Travel",
      })
    );
  });

  it("should switch between expense and income categories", async () => {
    const user = userEvent.setup();

    render(
      <CreateCategory
        categories={[
          customCategory,
          incomeCategory,
        ]}
      />
    );

    expect(
      screen.getByText("Pet Care")
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Salary")
    ).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: "Income",
      })
    );

    expect(
      screen.getByText("Salary")
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Pet Care")
    ).not.toBeInTheDocument();
  });

  it("should allow editing a custom category", async () => {
    const user = userEvent.setup();

    render(
      <CreateCategory
        categories={[customCategory]}
      />
    );

    await user.click(
      screen.getByRole("button", {
        name: "Edit",
      })
    );

    expect(
      screen.getByText("Edit Category")
    ).toBeInTheDocument();
  });

  it("should allow deleting a custom category", async () => {
    const user = userEvent.setup();

    render(
      <CreateCategory
        categories={[customCategory]}
      />
    );

    await user.click(
      screen.getByRole("button", {
        name: "Delete",
      })
    );

    expect(
      screen.getByText("Delete Category")
    ).toBeInTheDocument();
  });

  it("should not show edit and delete actions for default categories", () => {
    render(
      <CreateCategory
        categories={[incomeCategory]}
      />
    );

    expect(
      screen.queryByRole("button", {
        name: "Edit",
      })
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole("button", {
        name: "Delete",
      })
    ).not.toBeInTheDocument();
  });

  it("should call onCategoryCreate callback when a category is created", async () => {
    const user = userEvent.setup();

    const onCategoryCreate = vi.fn();

    render(
      <CreateCategory
        categories={[]}
        onCategoryCreate={onCategoryCreate}
      />
    );

    await user.click(
      screen.getByRole("button", {
        name: "+ Add Category",
      })
    );

    await user.type(
      screen.getByLabelText("Category Name"),
      "Freelance"
    );

    await user.selectOptions(
      screen.getByLabelText("Category Type"),
      "income"
    );

    await user.click(
      screen.getByRole("button", {
        name: "Create Category",
      })
    );

    expect(onCategoryCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Freelance",
        type: "income",
        isCustom: true,
      })
    );
  });
});