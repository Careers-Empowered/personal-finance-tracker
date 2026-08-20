import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import SubcategoryItem from "../components/SubcategoryItem";
import type { Subcategory } from "../types/subcategory.types";

const subcategory: Subcategory = {
  id: "sub-1",
  name: "Groceries",
  categoryId: "cat-1",
  icon: "🛒",
  createdAt: "2026-08-13T00:00:00.000Z",
  updatedAt: "2026-08-13T00:00:00.000Z",
};

describe("SubcategoryItem", () => {
  it("renders the subcategory information", () => {
    render(
      <SubcategoryItem
        subcategory={subcategory}
        categoryName="Food"
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("heading", {
        name: "Groceries",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Food"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("🛒"),
    ).toBeInTheDocument();
  });

  it("calls onEdit when the Edit button is clicked", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();

    render(
      <SubcategoryItem
        subcategory={subcategory}
        categoryName="Food"
        onEdit={onEdit}
        onDelete={vi.fn()}
      />,
    );

    await user.click(
      screen.getByRole("button", {
        name: "Edit Groceries",
      }),
    );

    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onEdit).toHaveBeenCalledWith(subcategory);
  });

  it("calls onDelete when the Delete button is clicked", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();

    render(
      <SubcategoryItem
        subcategory={subcategory}
        categoryName="Food"
        onEdit={vi.fn()}
        onDelete={onDelete}
      />,
    );

    await user.click(
      screen.getByRole("button", {
        name: "Delete Groceries",
      }),
    );

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith(subcategory);
  });
});