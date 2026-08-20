import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import SubcategoryForm from "../components/SubcategoryForm";
import type {
  Category,
  Subcategory,
} from "../types/subcategory.types";

const categories: Category[] = [
  {
    id: "cat-1",
    name: "Food",
    type: "expense",
    icon: "🍔",
    color: "#ff0000",
    isCustom: false,
  },
];

const subcategories: Subcategory[] = [
  {
    id: "sub-1",
    name: "Groceries",
    categoryId: "cat-1",
    icon: "🛒",
    createdAt: "2026-08-13T00:00:00.000Z",
    updatedAt: "2026-08-13T00:00:00.000Z",
  },
];

describe("SubcategoryForm", () => {
  it("shows an error when the subcategory name is empty", async () => {
    const user = userEvent.setup();

    render(
      <SubcategoryForm
        categories={categories}
        subcategories={[]}
        onSave={vi.fn()}
        onCancelEdit={vi.fn()}
      />,
    );

    await user.click(
      screen.getByRole("button", {
        name: "Add Subcategory",
      }),
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Subcategory name is required.",
    );
  });

  it("shows an error when a duplicate subcategory is submitted", async () => {
    const user = userEvent.setup();

    render(
      <SubcategoryForm
        categories={categories}
        subcategories={subcategories}
        onSave={vi.fn()}
        onCancelEdit={vi.fn()}
      />,
    );

    const nameInput = screen.getByRole("textbox", {
      name: "Subcategory Name",
    });

    await user.type(nameInput, "Groceries");

    await user.click(
      screen.getByRole("button", {
        name: "Add Subcategory",
      }),
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "A subcategory with this name already exists in the selected category.",
    );
  });

  it("saves a new subcategory when valid data is submitted", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();

    render(
      <SubcategoryForm
        categories={categories}
        subcategories={[]}
        onSave={onSave}
        onCancelEdit={vi.fn()}
      />,
    );

    const nameInput = screen.getByRole("textbox", {
      name: "Subcategory Name",
    });

    await user.type(nameInput, "Groceries");

    await user.click(
      screen.getByRole("button", {
        name: "Add Subcategory",
      }),
    );

    expect(onSave).toHaveBeenCalledTimes(1);

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Groceries",
        categoryId: "cat-1",
      }),
    );
  });
});