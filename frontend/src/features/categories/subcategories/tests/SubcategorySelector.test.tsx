import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import SubcategorySelector from "../components/SubcategorySelector";

describe("SubcategorySelector", () => {
  it("shows subcategories belonging to the selected category", async () => {
    const user = userEvent.setup();

    render(
      <SubcategorySelector
        categoryId="expense-food-dining"
        value=""
        onChange={vi.fn()}
      />,
    );

    await user.click(
      screen.getByRole("button", {
        name: /Select subcategory/,
      }),
    );

    expect(
      screen.getByRole("button", {
        name: /Restaurants/,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /Fast Food/,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /Food Delivery/,
      }),
    ).toBeInTheDocument();
  });

  it("does not show subcategories from another category", async () => {
    const user = userEvent.setup();

    render(
      <SubcategorySelector
        categoryId="expense-food-dining"
        value=""
        onChange={vi.fn()}
      />,
    );

    await user.click(
      screen.getByRole("button", {
        name: /Select subcategory/,
      }),
    );

    expect(
      screen.queryByRole("button", {
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

    const selector = screen.getByRole("button", {
      name: /Select a category first/,
    });

    expect(selector).toBeDisabled();

    expect(
      screen.queryByRole("listbox"),
    ).not.toBeInTheDocument();
  });

  it("calls onChange with the selected subcategory id", async () => {
    const user = userEvent.setup();

    const onChange = vi.fn();

    render(
      <SubcategorySelector
        categoryId="expense-food-dining"
        value=""
        onChange={onChange}
      />,
    );

    await user.click(
      screen.getByRole("button", {
        name: /Select subcategory/,
      }),
    );

    await user.click(
      screen.getByRole("button", {
        name: /Restaurants/,
      }),
    );

    expect(onChange).toHaveBeenCalledTimes(1);

    expect(onChange).toHaveBeenCalledWith(
      "sub-restaurants",
    );
  });

  it("shows the selected subcategory", () => {
    render(
      <SubcategorySelector
        categoryId="expense-food-dining"
        value="sub-restaurants"
        onChange={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", {
        name: /Restaurants/,
      }),
    ).toBeInTheDocument();
  });

  it("allows searching for a subcategory", async () => {
    const user = userEvent.setup();

    render(
      <SubcategorySelector
        categoryId="expense-food-dining"
        value=""
        onChange={vi.fn()}
      />,
    );

    await user.click(
      screen.getByRole("button", {
        name: /Select subcategory/,
      }),
    );

    const searchInput =
      screen.getByPlaceholderText(
        "Search subcategory...",
      );

    await user.type(
      searchInput,
      "Restaurant",
    );

    expect(
      screen.getByRole("button", {
        name: /Restaurants/,
      }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("button", {
        name: /Fast Food/,
      }),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole("button", {
        name: /Food Delivery/,
      }),
    ).not.toBeInTheDocument();
  });

  it("shows no results when the search does not match", async () => {
    const user = userEvent.setup();

    render(
      <SubcategorySelector
        categoryId="expense-food-dining"
        value=""
        onChange={vi.fn()}
      />,
    );

    await user.click(
      screen.getByRole("button", {
        name: /Select subcategory/,
      }),
    );

    const searchInput =
      screen.getByPlaceholderText(
        "Search subcategory...",
      );

    await user.type(
      searchInput,
      "SomethingThatDoesNotExist",
    );

    expect(
      screen.getByText(
        "No subcategories found",
      ),
    ).toBeInTheDocument();
  });

  it("closes the dropdown after selecting a subcategory", async () => {
    const user = userEvent.setup();

    const onChange = vi.fn();

    render(
      <SubcategorySelector
        categoryId="expense-food-dining"
        value=""
        onChange={onChange}
      />,
    );

    await user.click(
      screen.getByRole("button", {
        name: /Select subcategory/,
      }),
    );

    await user.click(
      screen.getByRole("button", {
        name: /Restaurants/,
      }),
    );

    expect(
      screen.queryByRole("listbox"),
    ).not.toBeInTheDocument();
  });

  it("does not open the dropdown when no category is selected", async () => {
    const user = userEvent.setup();

    render(
      <SubcategorySelector
        categoryId=""
        value=""
        onChange={vi.fn()}
      />,
    );

    const selector = screen.getByRole("button", {
      name: /Select a category first/,
    });

    expect(selector).toBeDisabled();

    await user.click(selector);

    expect(
      screen.queryByRole("listbox"),
    ).not.toBeInTheDocument();
  });
});