import { describe, expect, it } from "vitest";

import {
  createCategorySpending,
  createSummary,
  isValidDateRange,
  splitIntoSixPeriods,
} from "../utils/dashboardSelectors";

import type {
  Account,
  DashboardData,
  Transaction,
} from "../types/dashboard";

describe("dashboardSelectors", () => {
  describe("isValidDateRange", () => {
    it("returns true for a valid date range", () => {
      expect(
        isValidDateRange({
          startDate: "2026-08-01",
          endDate: "2026-08-10",
        }),
      ).toBe(true);
    });

    it("returns true when start and end dates are the same", () => {
      expect(
        isValidDateRange({
          startDate: "2026-08-10",
          endDate: "2026-08-10",
        }),
      ).toBe(true);
    });

    it("returns false when start date is after end date", () => {
      expect(
        isValidDateRange({
          startDate: "2026-08-10",
          endDate: "2026-08-01",
        }),
      ).toBe(false);
    });

    it("returns false when start date is missing", () => {
      expect(
        isValidDateRange({
          startDate: "",
          endDate: "2026-08-10",
        }),
      ).toBe(false);
    });

    it("returns false when end date is missing", () => {
      expect(
        isValidDateRange({
          startDate: "2026-08-01",
          endDate: "",
        }),
      ).toBe(false);
    });
  });

  describe("createSummary", () => {
    it("calculates income, expenses, balance, and transaction count", () => {
      const transactions: Transaction[] = [
        {
          id: "1",
          accountId: "account-1",
          date: "2026-08-01",
          title: "Salary",
          category: "Income",
          subcategory: "Salary",
          amount: 5000,
          type: "income",
          currency: "USD",
        },
        {
          id: "2",
          accountId: "account-1",
          date: "2026-08-02",
          title: "Groceries",
          category: "Food",
          subcategory: "Groceries",
          amount: 500,
          type: "expense",
          currency: "USD",
        },
        {
          id: "3",
          accountId: "account-1",
          date: "2026-08-03",
          title: "Transport",
          category: "Transport",
          subcategory: "Bus",
          amount: 200,
          type: "expense",
          currency: "USD",
        },
      ];

      expect(createSummary(transactions)).toEqual({
        income: 5000,
        expenses: 700,
        balance: 4300,
        transactionCount: 3,
      });
    });

    it("returns zero values for an empty transaction list", () => {
      expect(createSummary([])).toEqual({
        income: 0,
        expenses: 0,
        balance: 0,
        transactionCount: 0,
      });
    });

    it("only counts income transactions as income", () => {
      const transactions: Transaction[] = [
        {
          id: "1",
          accountId: "account-1",
          date: "2026-08-01",
          title: "Salary",
          category: "Income",
          subcategory: "Salary",
          amount: 3000,
          type: "income",
          currency: "USD",
        },
        {
          id: "2",
          accountId: "account-1",
          date: "2026-08-02",
          title: "Food",
          category: "Food",
          subcategory: "Groceries",
          amount: 1000,
          type: "expense",
          currency: "USD",
        },
      ];

      const result = createSummary(transactions);

      expect(result.income).toBe(3000);
      expect(result.expenses).toBe(1000);
    });
  });

  describe("createCategorySpending", () => {
    it("groups expenses by category", () => {
      const transactions: Transaction[] = [
        {
          id: "1",
          accountId: "account-1",
          date: "2026-08-01",
          title: "Groceries",
          category: "Food",
          subcategory: "Groceries",
          amount: 300,
          type: "expense",
          currency: "USD",
        },
        {
          id: "2",
          accountId: "account-1",
          date: "2026-08-02",
          title: "Restaurant",
          category: "Food",
          subcategory: "Restaurant",
          amount: 200,
          type: "expense",
          currency: "USD",
        },
        {
          id: "3",
          accountId: "account-1",
          date: "2026-08-03",
          title: "Bus",
          category: "Transport",
          subcategory: "Bus",
          amount: 100,
          type: "expense",
          currency: "USD",
        },
      ];

      expect(createCategorySpending(transactions)).toEqual([
        {
          category: "Food",
          amount: 500,
        },
        {
          category: "Transport",
          amount: 100,
        },
      ]);
    });

    it("ignores income transactions", () => {
      const transactions: Transaction[] = [
        {
          id: "1",
          accountId: "account-1",
          date: "2026-08-01",
          title: "Salary",
          category: "Income",
          subcategory: "Salary",
          amount: 5000,
          type: "income",
          currency: "USD",
        },
        {
          id: "2",
          accountId: "account-1",
          date: "2026-08-02",
          title: "Food",
          category: "Food",
          subcategory: "Groceries",
          amount: 500,
          type: "expense",
          currency: "USD",
        },
      ];

      expect(createCategorySpending(transactions)).toEqual([
        {
          category: "Food",
          amount: 500,
        },
      ]);
    });

    it("returns an empty array when there are no expenses", () => {
      const transactions: Transaction[] = [
        {
          id: "1",
          accountId: "account-1",
          date: "2026-08-01",
          title: "Salary",
          category: "Income",
          subcategory: "Salary",
          amount: 5000,
          type: "income",
          currency: "USD",
        },
      ];

      expect(createCategorySpending(transactions)).toEqual([]);
    });

    it("returns an empty array for empty transactions", () => {
      expect(createCategorySpending([])).toEqual([]);
    });
  });

  describe("splitIntoSixPeriods", () => {
    it("always creates six trend periods", () => {
      const result = splitIntoSixPeriods(
        [],
        "2026-08-01",
        "2026-08-30",
      );

      expect(result).toHaveLength(6);
    });

    it("calculates income and expenses across all periods", () => {
      const transactions: Transaction[] = [
        {
          id: "1",
          accountId: "account-1",
          date: "2026-08-01",
          title: "Salary",
          category: "Income",
          subcategory: "Salary",
          amount: 3000,
          type: "income",
          currency: "USD",
        },
        {
          id: "2",
          accountId: "account-1",
          date: "2026-08-05",
          title: "Food",
          category: "Food",
          subcategory: "Groceries",
          amount: 500,
          type: "expense",
          currency: "USD",
        },
      ];

      const result = splitIntoSixPeriods(
        transactions,
        "2026-08-01",
        "2026-08-30",
      );

      expect(result).toHaveLength(6);

      const totalIncome = result.reduce(
        (sum, period) => sum + period.income,
        0,
      );

      const totalExpenses = result.reduce(
        (sum, period) => sum + period.expenses,
        0,
      );

      expect(totalIncome).toBe(3000);
      expect(totalExpenses).toBe(500);
    });

    it("calculates balance for each period", () => {
      const transactions: Transaction[] = [
        {
          id: "1",
          accountId: "account-1",
          date: "2026-08-01",
          title: "Salary",
          category: "Income",
          subcategory: "Salary",
          amount: 3000,
          type: "income",
          currency: "USD",
        },
        {
          id: "2",
          accountId: "account-1",
          date: "2026-08-02",
          title: "Food",
          category: "Food",
          subcategory: "Groceries",
          amount: 500,
          type: "expense",
          currency: "USD",
        },
      ];

      const result = splitIntoSixPeriods(
        transactions,
        "2026-08-01",
        "2026-08-30",
      );

      const totalBalance = result.reduce(
        (sum, period) => sum + period.balance,
        0,
      );

      expect(totalBalance).toBe(2500);
    });

    it("creates labels for each period", () => {
      const result = splitIntoSixPeriods(
        [],
        "2026-08-01",
        "2026-08-30",
      );

      result.forEach((period) => {
        expect(period.label).toBeTruthy();
        expect(period.label).toContain("–");
      });
    });

    it("returns zero values when there are no transactions", () => {
      const result = splitIntoSixPeriods(
        [],
        "2026-08-01",
        "2026-08-30",
      );

      result.forEach((period) => {
        expect(period.income).toBe(0);
        expect(period.expenses).toBe(0);
        expect(period.balance).toBe(0);
      });
    });
  });
});
