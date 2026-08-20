import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import SpendingByCategory from "./SpendingByCategory";

describe("SpendingByCategory", () => {
  it("renders the section heading and description", () => {
    render(<SpendingByCategory />);

    expect(
      screen.getByRole("heading", { name: "Spending by category" })
    ).toBeInTheDocument();

    expect(
      screen.getByText("A visual breakdown of where your money goes")
    ).toBeInTheDocument();
  });

  it("shows empty state when no spending data is provided", () => {
    render(<SpendingByCategory />);

    expect(
      screen.getByText("No spending data available")
    ).toBeInTheDocument();
  });

  it("shows empty state when data is an empty array", () => {
    render(<SpendingByCategory data={[]} />);

    expect(
      screen.getByText("No spending data available")
    ).toBeInTheDocument();
  });

  it("renders spending categories", () => {
    render(
      <SpendingByCategory
        data={[
          { category: "Food", amount: 500 },
          { category: "Transport", amount: 300 },
        ]}
      />
    );

    expect(screen.getByText("Food")).toBeInTheDocument();
    expect(screen.getByText("Transport")).toBeInTheDocument();
  });

  it("displays the total spending", () => {
    render(
      <SpendingByCategory
        data={[
          { category: "Food", amount: 500 },
          { category: "Transport", amount: 300 },
        ]}
      />
    );

    expect(screen.getByText("$800")).toBeInTheDocument();
  });

  it("displays individual category amounts", () => {
    render(
      <SpendingByCategory
        data={[
          { category: "Food", amount: 500 },
          { category: "Transport", amount: 300 },
        ]}
      />
    );

    expect(screen.getByText("$500")).toBeInTheDocument();
    expect(screen.getByText("$300")).toBeInTheDocument();
  });

  it("calculates and displays category percentages", () => {
    render(
      <SpendingByCategory
        data={[
          { category: "Food", amount: 500 },
          { category: "Transport", amount: 300 },
          { category: "Entertainment", amount: 200 },
        ]}
      />
    );

    expect(screen.getByText("50%")).toBeInTheDocument();
    expect(screen.getByText("30%")).toBeInTheDocument();
    expect(screen.getByText("20%")).toBeInTheDocument();
  });

  it("renders the pie chart with the correct accessible label", () => {
    render(
      <SpendingByCategory
        data={[{ category: "Food", amount: 500 }]}
      />
    );

    expect(
      screen.getByRole("img", {
        name: "Spending by category pie chart",
      })
    ).toBeInTheDocument();
  });

  it("renders the correct total when multiple categories are provided", () => {
    render(
      <SpendingByCategory
        data={[
          { category: "Food", amount: 100 },
          { category: "Bills", amount: 250 },
          { category: "Shopping", amount: 150 },
        ]}
      />
    );

    expect(screen.getByText("$500")).toBeInTheDocument();
  });

  it("handles zero-value categories", () => {
    render(
      <SpendingByCategory
        data={[
          { category: "Food", amount: 0 },
          { category: "Bills", amount: 500 },
        ]}
      />
    );

    expect(screen.getByText("Food")).toBeInTheDocument();
    expect(screen.getByText("Bills")).toBeInTheDocument();
    expect(screen.getAllByText("$500")).toHaveLength(2);
    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  it("applies chart colors to category segments", () => {
    render(
      <SpendingByCategory
        data={[
          { category: "Food", amount: 500 },
          { category: "Bills", amount: 300 },
        ]}
      />
    );

    const chart = screen.getByRole("img", {
      name: "Spending by category pie chart",
    });

    expect(chart).toHaveStyle({
      background:
        "conic-gradient(#d38333 0% 62.5%, #5d8a68 62.5% 100%)",
    });
  });
});