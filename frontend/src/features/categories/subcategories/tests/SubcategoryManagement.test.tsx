import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import SubcategoryManagement from "../SubcategoryManagement";
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

const initialSubcategories: Subcategory[] = [
  {
    id: "sub-1",
    name: "Groceries",
    categoryId: "cat-1",
    icon: "🛒",
    createdAt: "2026-08-13T00:00:00.000Z",
    updatedAt: "2026-08-13T00:00:00.000Z",
  },
];

describe("SubcategoryManagement", () => {
  it("renders the subcategory management page", () => {
    render(
      <SubcategoryManagement
        categories={categories}
        initialSubcategories={initialSubcategories}
      />,
    );

    expect(
      screen.getByRole("heading", {
        name: "Subcategory Management",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Groceries",
      }),
    ).toBeInTheDocument();
  });

  it("adds a new subcategory", async () => {
    const user = userEvent.setup();

    render(
      <SubcategoryManagement
        categories={categories}
        initialSubcategories={[]}
      />,
    );

    const nameInput = screen.getByRole("textbox", {
      name: "Subcategory Name",
    });

    await user.type(nameInput, "Restaurants");

    await user.click(
      screen.getByRole("button", {
        name: "Add Subcategory",
      }),
    );

    expect(
      screen.getByRole("heading", {
        name: "Restaurants",
      }),
    ).toBeInTheDocument();
  });

  it("edits an existing subcategory", async () => {
    const user = userEvent.setup();

    render(
      <SubcategoryManagement
        categories={categories}
        initialSubcategories={initialSubcategories}
      />,
    );

    await user.click(
      screen.getByRole("button", {
        name: "Edit Groceries",
      }),
    );

    const nameInput = screen.getByRole("textbox", {
      name: "Subcategory Name",
    });

    await user.clear(nameInput);
    await user.type(nameInput, "Supermarket");

    await user.click(
      screen.getByRole("button", {
        name: "Update Subcategory",
      }),
    );

    expect(
      screen.getByRole("heading", {
        name: "Supermarket",
      }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", {
        name: "Groceries",
      }),
    ).not.toBeInTheDocument();
  });

  it("deletes a subcategory after confirmation", async () => {
    const user = userEvent.setup();

    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(
      <SubcategoryManagement
        categories={categories}
        initialSubcategories={initialSubcategories}
      />,
    );

    await user.click(
      screen.getByRole("button", {
        name: "Delete Groceries",
      }),
    );

    expect(window.confirm).toHaveBeenCalledWith(
      'Are you sure you want to delete "Groceries"?',
    );

    expect(
      screen.queryByRole("heading", {
        name: "Groceries",
      }),
    ).not.toBeInTheDocument();

    vi.restoreAllMocks();
  });

  it("does not delete a subcategory when deletion is cancelled", async () => {
    const user = userEvent.setup();

    vi.spyOn(window, "confirm").mockReturnValue(false);

    render(
      <SubcategoryManagement
        categories={categories}
        initialSubcategories={initialSubcategories}
      />,
    );

    await user.click(
      screen.getByRole("button", {
        name: "Delete Groceries",
      }),
    );

    expect(
      screen.getByRole("heading", {
        name: "Groceries",
      }),
    ).toBeInTheDocument();

    vi.restoreAllMocks();
  });
});