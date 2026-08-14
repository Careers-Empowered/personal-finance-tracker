import { describe, expect, it } from "vitest";

import {
  createCategorySpending,
  createDashboardView,
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
          description: "Salary",
          category: "Income",
          amount: 5000,
          type: "income",
        },
        {
          id: "2",
          accountId: "account-1",
          date: "2026-08-02",
          description: "Groceries",
          category: "Food",
          amount: 500,
          type: "expense",
        },
        {
          id: "3",
          accountId: "account-1",
          date: "2026-08-03",
          description: "Transport",
          category: "Transport",
          amount: 200,
          type: "expense",
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
          description: "Salary",
          category: "Income",
          amount: 3000,
          type: "income",
        },
        {
          id: "2",
          accountId: "account-1",
          date: "2026-08-02",
          description: "Food",
          category: "Food",
          amount: 1000,
          type: "expense",
        },
      ];

      expect(createSummary(transactions).income).toBe(3000);
      expect(createSummary(transactions).expenses).toBe(1000);
    });
  });

  describe("createCategorySpending", () => {
    it("groups expenses by category", () => {
      const transactions: Transaction[] = [
        {
          id: "1",
          accountId: "account-1",
          date: "2026-08-01",
          description: "Groceries",
          category: "Food",
          amount: 300,
          type: "expense",
        },
        {
          id: "2",
          accountId: "account-1",
          date: "2026-08-02",
          description: "Restaurant",
          category: "Food",
          amount: 200,
          type: "expense",
        },
        {
          id: "3",
          accountId: "account-1",
          date: "2026-08-03",
          description: "Bus",
          category: "Transport",
          amount: 100,
          type: "expense",
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
          description: "Salary",
          category: "Income",
          amount: 5000,
          type: "income",
        },
        {
          id: "2",
          accountId: "account-1",
          date: "2026-08-02",
          description: "Food",
          category: "Food",
          amount: 500,
          type: "expense",
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
          description: "Salary",
          category: "Income",
          amount: 5000,
          type: "income",
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
      const transactions: Transaction[] = [];

      const result = splitIntoSixPeriods(
        transactions,
        "2026-08-01",
        "2026-08-30",
      );

      expect(result).toHaveLength(6);
    });

    it("calculates income and expenses for each period", () => {
      const transactions: Transaction[] = [
        {
          id: "1",
          accountId: "account-1",
          date: "2026-08-01",
          description: "Salary",
          category: "Income",
          amount: 3000,
          type: "income",
        },
        {
          id: "2",
          accountId: "account-1",
          date: "2026-08-05",
          description: "Food",
          category: "Food",
          amount: 500,
          type: "expense",
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
          description: "Salary",
          category: "Income",
          amount: 3000,
          type: "income",
        },
        {
          id: "2",
          accountId: "account-1",
          date: "2026-08-02",
          description: "Food",
          category: "Food",
          amount: 500,
          type: "expense",
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

  describe("createDashboardView", () => {
    const account: Account = {
      id: "account-1",
      name: "Checking Account",
      balance: 2000,
      currency: "USD",
      income: 5000,
      expenses: 3000,
      transactionCount: 3,
      dashboard: {
        daily: {
          income: 100,
          expenses: 50,
          balance: 50,
          transactionCount: 1,
        },
        monthly: {
          income: 5000,
          expenses: 3000,
          balance: 2000,
          transactionCount: 3,
        },
        spendingByCategory: [
          {
            category: "Food",
            amount: 500,
          },
        ],
        monthlyTrend: [
          {
            date: "2026-08",
            income: 5000,
            expenses: 3000,
            balance: 2000,
          },
        ],
        dailyTrend: [
          {
            date: "2026-08-10",
            income: 100,
            expenses: 50,
            balance: 50,
          },
        ],
      },
    };

    const transactions: Transaction[] = [
      {
        id: "1",
        accountId: "account-1",
        date: "2026-08-01",
        description: "Salary",
        category: "Income",
        amount: 5000,
        type: "income",
      },
      {
        id: "2",
        accountId: "account-1",
        date: "2026-08-05",
        description: "Food",
        category: "Food",
        amount: 500,
        type: "expense",
      },
      {
        id: "3",
        accountId: "account-2",
        date: "2026-08-06",
        description: "Other account expense",
        category: "Other",
        amount: 100,
        type: "expense",
      },
    ];

    const dashboardData: DashboardData = {
      daily: {
        income: 100,
        expenses: 50,
        balance: 50,
        transactionCount: 1,
      },
      monthly: {
        income: 5100,
        expenses: 3100,
        balance: 2000,
        transactionCount: 3,
      },
      spendingByCategory: [
        {
          category: "Food",
          amount: 500,
        },
      ],
      accounts: [account],
      monthlyTrend: [
        {
          date: "2026-08",
          income: 5100,
          expenses: 3100,
          balance: 2000,
        },
      ],
      dailyTrend: [
        {
          date: "2026-08-10",
          income: 100,
          expenses: 50,
          balance: 50,
        },
      ],
      transactions,
    };

    it("returns all accounts when no account is selected", () => {
      const result = createDashboardView(
        dashboardData,
        "all",
      );

      expect(result.selectedAccount).toBeUndefined();
      expect(result.visibleAccounts).toEqual([account]);
      expect(result.transactions).toHaveLength(3);
    });

    it("returns the selected account", () => {
      const result = createDashboardView(
        dashboardData,
        "account-1",
      );

      expect(result.selectedAccount).toEqual(account);
      expect(result.visibleAccounts).toEqual([account]);
    });

    it("filters transactions by selected account", () => {
      const result = createDashboardView(
        dashboardData,
        "account-1",
      );

      expect(result.transactions).toHaveLength(2);

      expect(
        result.transactions.every(
          (transaction) => transaction.accountId === "account-1",
        ),
      ).toBe(true);
    });

    it("filters transactions by date range", () => {
      const result = createDashboardView(
        dashboardData,
        "all",
        {
          startDate: "2026-08-02",
          endDate: "2026-08-05",
        },
      );

      expect(result.transactions).toHaveLength(1);
      expect(result.transactions[0].description).toBe("Food");
    });

    it("creates a summary from transactions when a valid range is applied", () => {
      const result = createDashboardView(
        dashboardData,
        "all",
        {
          startDate: "2026-08-01",
          endDate: "2026-08-05",
        },
      );

      expect(result.summary).toEqual({
        income: 5000,
        expenses: 500,
        balance: 4500,
        transactionCount: 2,
      });
    });

    it("creates category spending from transactions when a range is applied", () => {
      const result = createDashboardView(
        dashboardData,
        "all",
        {
          startDate: "2026-08-01",
          endDate: "2026-08-05",
        },
      );

      expect(result.spendingByCategory).toEqual([
        {
          category: "Food",
          amount: 500,
        },
      ]);
    });

    it("uses account dashboard data when no range is applied", () => {
      const result = createDashboardView(
        dashboardData,
        "account-1",
      );

      expect(result.summary).toEqual(
        account.dashboard.monthly,
      );

      expect(result.spendingByCategory).toEqual(
        account.dashboard.spendingByCategory,
      );

      expect(result.monthlyTrend).toEqual(
        account.dashboard.monthlyTrend,
      );

      expect(result.dailyTrend).toEqual(
        account.dashboard.dailyTrend,
      );
    });

    it("filters daily trend by date range", () => {
      const data: DashboardData = {
        ...dashboardData,
        dailyTrend: [
          {
            date: "2026-08-01",
            income: 100,
            expenses: 20,
            balance: 80,
          },
          {
            date: "2026-08-10",
            income: 200,
            expenses: 50,
            balance: 150,
          },
        ],
      };

      const result = createDashboardView(
        data,
        "all",
        {
          startDate: "2026-08-05",
          endDate: "2026-08-12",
        },
      );

      expect(result.dailyTrend).toHaveLength(1);
      expect(result.dailyTrend[0].date).toBe(
        "2026-08-10",
      );
    });

    it("filters monthly trend by month when a range is applied", () => {
      const data: DashboardData = {
        ...dashboardData,
        monthlyTrend: [
          {
            date: "2026-07",
            income: 3000,
            expenses: 1000,
            balance: 2000,
          },
          {
            date: "2026-08",
            income: 5000,
            expenses: 3000,
            balance: 2000,
          },
        ],
      };

      const result = createDashboardView(
        data,
        "all",
        {
          startDate: "2026-08-01",
          endDate: "2026-08-31",
        },
      );

      expect(result.monthlyTrend).toHaveLength(6);
    });

    it("uses visible accounts based on account selection", () => {
      const result = createDashboardView(
        dashboardData,
        "account-1",
      );

      expect(result.visibleAccounts).toHaveLength(1);
      expect(result.visibleAccounts[0].id).toBe(
        "account-1",
      );
    });
  });
});