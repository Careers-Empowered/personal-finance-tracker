import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  balanceValidator,
  InsufficientFundsError,
} from "./balanceValidator";
import * as dbModule from "../../infrastructure/postgres/db";

describe("balanceValidator", () => {
  describe("checkBalance", () => {
    it("returns true when current balance is greater than or equal to amount", () => {
      expect(balanceValidator.checkBalance(1000, 500)).toBe(true);
      expect(balanceValidator.checkBalance(1000, 1000)).toBe(true);
    });

    it("returns false when current balance is less than amount", () => {
      expect(balanceValidator.checkBalance(500, 1000)).toBe(false);
      expect(balanceValidator.checkBalance(0, 1)).toBe(false);
    });
  });

  describe("validateSufficientBalance", () => {
    it("passes when amount is 0 or negative", async () => {
      const result = await balanceValidator.validateSufficientBalance(
        "acc-1",
        0
      );
      expect(result.sufficient).toBe(true);
    });

    it("throws InsufficientFundsError when balance is less than required amount", async () => {
      vi.spyOn(dbModule, "query").mockResolvedValueOnce({
        rows: [{ balance: 500 }],
      } as any);

      await expect(
        balanceValidator.validateSufficientBalance("acc-1", 1000)
      ).rejects.toThrow(InsufficientFundsError);
    });

    it("returns result when balance is sufficient", async () => {
      vi.spyOn(dbModule, "query").mockResolvedValueOnce({
        rows: [{ balance: 1500 }],
      } as any);

      const result = await balanceValidator.validateSufficientBalance(
        "acc-1",
        1000
      );
      expect(result.sufficient).toBe(true);
      expect(result.currentBalance).toBe(1500);
      expect(result.remainingBalance).toBe(500);
    });
  });

  describe("validateForTransactionUpdate", () => {
    it("throws InsufficientFundsError if updated expense exceeds balance", async () => {
      // Account balance = 200, existing expense = 100, new expense = 500
      // Reverted balance = 200 + 100 = 300, final = 300 - 500 = -200 (< 0)
      vi.spyOn(dbModule, "query").mockResolvedValueOnce({
        rows: [{ balance: 200 }],
      } as any);

      await expect(
        balanceValidator.validateForTransactionUpdate(
          "acc-1",
          100,
          "EXPENSE",
          500,
          "EXPENSE"
        )
      ).rejects.toThrow(InsufficientFundsError);
    });

    it("allows updated expense if within balance after revert", async () => {
      // Account balance = 200, existing expense = 100, new expense = 250
      // Reverted balance = 200 + 100 = 300, final = 300 - 250 = 50
      vi.spyOn(dbModule, "query").mockResolvedValueOnce({
        rows: [{ balance: 200 }],
      } as any);

      const result = await balanceValidator.validateForTransactionUpdate(
        "acc-1",
        100,
        "EXPENSE",
        250,
        "EXPENSE"
      );

      expect(result.sufficient).toBe(true);
      expect(result.remainingBalance).toBe(50);
    });
  });
});
