import { query } from "../../infrastructure/postgres/db";
import { prisma } from "../../infrastructure/postgres/prisma";

export class InsufficientFundsError extends Error {
  public currentBalance: number;
  public requiredAmount: number;

  constructor(currentBalance: number, requiredAmount: number) {
    super(
      `Insufficient account balance. Available: ${currentBalance}, Required: ${requiredAmount}`
    );
    this.name = "InsufficientFundsError";
    this.currentBalance = currentBalance;
    this.requiredAmount = requiredAmount;
  }
}

export interface BalanceCheckResult {
  sufficient: boolean;
  currentBalance: number;
  requiredAmount: number;
  remainingBalance: number;
}

/**
 * BalanceValidator module to ensure accounts have sufficient funds
 * before completing transactions, updates, or balance transfers.
 */
export const balanceValidator = {
  /**
   * Check if an account has sufficient balance for an expense/deduction.
   * Throws InsufficientFundsError if currentBalance < requiredAmount.
   */
  async validateSufficientBalance(
    accountId: string,
    requiredAmount: number
  ): Promise<BalanceCheckResult> {
    if (requiredAmount <= 0) {
      return {
        sufficient: true,
        currentBalance: 0,
        requiredAmount,
        remainingBalance: 0,
      };
    }

    let currentBalance = 0;
    try {
      const { rows } = await query(
        "SELECT balance FROM accounts WHERE id = $1",
        [accountId]
      );
      if (rows.length > 0) {
        currentBalance = Number(rows[0].balance);
      } else {
        const account = await prisma.account.findUnique({
          where: { id: accountId },
        });
        if (!account) {
          throw new Error("ACCOUNT_NOT_FOUND");
        }
        currentBalance = Number(account.balance);
      }
    } catch (err: any) {
      if (err.message === "ACCOUNT_NOT_FOUND") throw err;
      const account = await prisma.account.findUnique({
        where: { id: accountId },
      });
      if (!account) {
        throw new Error("ACCOUNT_NOT_FOUND");
      }
      currentBalance = Number(account.balance);
    }

    if (currentBalance < requiredAmount) {
      throw new InsufficientFundsError(currentBalance, requiredAmount);
    }

    return {
      sufficient: true,
      currentBalance,
      requiredAmount,
      remainingBalance: currentBalance - requiredAmount,
    };
  },

  /**
   * Validates account balance when updating an existing transaction.
   * Calculates net change in balance for the target account.
   */
  async validateForTransactionUpdate(
    accountId: string,
    existingAmount: number,
    existingType: "INCOME" | "EXPENSE",
    newAmount: number,
    newType: "INCOME" | "EXPENSE"
  ): Promise<BalanceCheckResult> {
    let currentBalance = 0;
    const { rows } = await query(
      "SELECT balance FROM accounts WHERE id = $1",
      [accountId]
    );
    if (rows.length > 0) {
      currentBalance = Number(rows[0].balance);
    } else {
      const account = await prisma.account.findUnique({
        where: { id: accountId },
      });
      if (!account) {
        throw new Error("ACCOUNT_NOT_FOUND");
      }
      currentBalance = Number(account.balance);
    }

    // Balance if old transaction is reverted
    const revertedBalance =
      existingType === "EXPENSE"
        ? currentBalance + existingAmount
        : currentBalance - existingAmount;

    // Balance after applying new transaction
    const finalBalance =
      newType === "EXPENSE"
        ? revertedBalance - newAmount
        : revertedBalance + newAmount;

    if (finalBalance < 0) {
      throw new InsufficientFundsError(currentBalance, newAmount);
    }

    return {
      sufficient: true,
      currentBalance,
      requiredAmount: newAmount,
      remainingBalance: finalBalance,
    };
  },

  /**
   * Helper function to check balance synchronously given a known balance value.
   */
  checkBalance(currentBalance: number, amount: number): boolean {
    return currentBalance >= amount;
  },
};
