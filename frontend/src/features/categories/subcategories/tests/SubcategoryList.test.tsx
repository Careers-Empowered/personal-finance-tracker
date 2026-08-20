import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import SubcategoryList from "../components/SubcategoryList";
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
  {
    id: "cat-2",
    name: "Transport",
    type: "expense",
    icon: "🚗",
    color: "#0000ff",
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
  {
    id: "sub-2",
    name: "Restaurants",
    categoryId: "cat-1",
    icon: "🍽️",
    createdAt: "2026-08-13T00:00:00.000Z",
    updatedAt: "2026-08-13T00:00:00.000Z",
  },
];

describe("SubcategoryList", () => {
  it("renders categories and their subcategory counts", () => {
    render(
      <SubcategoryList
        categories={categories}
        subcategories={subcategories}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("heading", {
        name: "Food",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Transport",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("2 subcategories"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("0 subcategories"),
    ).toBeInTheDocument();
  });

  it("renders the subcategories under the correct category", () => {
    render(
      <SubcategoryList
        categories={categories}
        subcategories={subcategories}
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
      screen.getByRole("heading", {
        name: "Restaurants",
      }),
    ).toBeInTheDocument();
  });

  it("shows an empty state when a category has no subcategories", () => {
    render(
      <SubcategoryList
        categories={categories}
        subcategories={[]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    const emptyMessages = screen.getAllByText(
      "No subcategories yet.",
    );

    expect(emptyMessages).toHaveLength(2);
  });
});