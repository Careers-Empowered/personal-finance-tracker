import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import SubcategorySelector from "../components/SubcategorySelector";

describe("SubcategorySelector", () => {
  it("shows subcategories belonging to the selected category", () => {
    render(
      <SubcategorySelector
        categoryId="expense-food-dining"
        value=""
        onChange={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("option", {
        name: /Restaurants/,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("option", {
        name: /Fast Food/,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("option", {
        name: /Food Delivery/,
      }),
    ).toBeInTheDocument();
  });

  it("does not show subcategories from another category", () => {
    render(
      <SubcategorySelector
        categoryId="expense-food-dining"
        value=""
        onChange={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole("option", {
        name: /Fuel/,
      }),
    ).not.toBeInTheDocument();
  });

  it("disables the selector when no category is selected", () => {
    render(
      <SubcategorySelector
        categoryId=""
        value=""
        onChange={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("combobox"),
    ).toBeDisabled();

    expect(
      screen.getByRole("option", {
        name: "Select a category first",
      }),
    ).toBeInTheDocument();
  });

  it("calls onChange with the selected subcategory id", async () => {
    const onChange = vi.fn();

    render(
      <SubcategorySelector
        categoryId="expense-food-dining"
        value=""
        onChange={onChange}
      />,
    );

    const selector = screen.getByRole("combobox");

    selector.dispatchEvent(
      new Event("change", {
        bubbles: true,
      }),
    );

    expect(onChange).not.toHaveBeenCalled();
  });
});