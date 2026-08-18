import { dashboardRepository } from "../repositories/dashboard.repository";
import type {
    DashboardResponse,
} from "../domain/dashboard/dashboard.types";

type DashboardTransaction = Awaited<
    ReturnType<typeof dashboardRepository.findTransactions>
>[number];

const toNumber = (value: unknown): number => {
    return Number(value);
};

const getTransactionIncome = (
    transaction: DashboardTransaction,
): number => {
    return transaction.type === "INCOME"
        ? toNumber(transaction.amount)
        : 0;
};

const getTransactionExpense = (
    transaction: DashboardTransaction,
): number => {
    return transaction.type === "EXPENSE"
        ? toNumber(transaction.amount)
        : 0;
};

const getDateKey = (date: Date): string => {
    return date.toISOString().slice(0, 10);
};

const getMonthKey = (date: Date): string => {
    return date.toISOString().slice(0, 7);
};

export const dashboardService = {
    async getDashboard(
        userId: string,
        accountId?: string,
        startDate?: Date,
        endDate?: Date,
    ): Promise<DashboardResponse> {
        const accounts =
            await dashboardRepository.findAccountsByUserId(
                userId,
            );

        let selectedAccount = null;

        if (accountId) {
            selectedAccount =
                await dashboardRepository.findAccountById(
                    userId,
                    accountId,
                );

            if (!selectedAccount) {
                throw new Error("ACCOUNT_NOT_FOUND");
            }
        }

        const transactions =
            await dashboardRepository.findTransactions(
                userId,
                {
                    accountId,
                },
            );

        /*
         * -----------------------------------------
         * SUMMARY
         * -----------------------------------------
         */

        const income = transactions.reduce(
            (total, transaction) =>
                total + getTransactionIncome(transaction),
            0,
        );

        const expenses = transactions.reduce(
            (total, transaction) =>
                total + getTransactionExpense(transaction),
            0,
        );

        const balance = income - expenses;

        const summary = {
            income,
            expenses,
            balance,
            transactionCount: transactions.length,
        };

        /*
         * -----------------------------------------
         * DAILY TREND
         * -----------------------------------------
         */

        const dailyMap = new Map<
            string,
            {
                income: number;
                expenses: number;
            }
        >();

        transactions.forEach((transaction) => {
            const date = getDateKey(
                transaction.date,
            );

            const current = dailyMap.get(date) ?? {
                income: 0,
                expenses: 0,
            };

            current.income +=
                getTransactionIncome(transaction);

            current.expenses +=
                getTransactionExpense(transaction);

            dailyMap.set(date, current);
        });

        const dailyTrend = Array.from(
            dailyMap.entries(),
        )
            .sort(([dateA], [dateB]) =>
                dateA.localeCompare(dateB),
            )
            .map(([date, values]) => ({
                date,
                income: values.income,
                expenses: values.expenses,
                balance:
                    values.income - values.expenses,
            }));

        /*
         * -----------------------------------------
         * MONTHLY TREND
         * -----------------------------------------
         */

        const monthlyMap = new Map<
            string,
            {
                income: number;
                expenses: number;
            }
        >();

        transactions.forEach((transaction) => {
            const month = getMonthKey(
                transaction.date,
            );

            const current = monthlyMap.get(month) ?? {
                income: 0,
                expenses: 0,
            };

            current.income +=
                getTransactionIncome(transaction);

            current.expenses +=
                getTransactionExpense(transaction);

            monthlyMap.set(month, current);
        });

        const monthlyTrend = Array.from(
            monthlyMap.entries(),
        )
            .sort(([monthA], [monthB]) =>
                monthA.localeCompare(monthB),
            )
            .map(([date, values]) => ({
                date,
                income: values.income,
                expenses: values.expenses,
                balance:
                    values.income - values.expenses,
            }));

        /*
         * -----------------------------------------
         * SPENDING BY CATEGORY
         * -----------------------------------------
         */

        const categoryMap = new Map<
            string,
            number
        >();

        transactions.forEach((transaction) => {
            if (
                transaction.type !== "EXPENSE" ||
                !transaction.category
            ) {
                return;
            }

            const category =
                transaction.category.name;

            categoryMap.set(
                category,
                (categoryMap.get(category) ?? 0) +
                toNumber(transaction.amount),
            );
        });

        const spendingByCategory = Array.from(
            categoryMap.entries(),
        )
            .map(([category, amount]) => ({
                category,
                amount,
            }))
            .sort(
                (a, b) => b.amount - a.amount,
            );

        /*
         * -----------------------------------------
         * MAP ACCOUNTS
         * -----------------------------------------
         */

        const mappedAccounts =
            accounts.map((account) => ({
                id: account.id,
                name: account.name.trim(),
                currency: account.currency,
                balance: toNumber(account.balance),
                isPrimary: account.isPrimary,
            }));

        const mappedSelectedAccount =
            selectedAccount
                ? {
                    id: selectedAccount.id,
                    name: selectedAccount.name.trim(),
                    currency: selectedAccount.currency,
                    balance: toNumber(
                        selectedAccount.balance,
                    ),
                    isPrimary:
                        selectedAccount.isPrimary,
                }
                : null;

        /*
         * -----------------------------------------
         * MAP TRANSACTIONS
         * -----------------------------------------
         */

        const latestTransactions =
            transactions
                .slice(0, 10)
                .map((transaction) => ({
                    id: transaction.id,
                    accountId: transaction.accountId,
                    date: transaction.date.toISOString(),
                    title: transaction.Title,
                    category: transaction.category?.name ?? "Uncategorized",
                    subcategory:
                        transaction.subcategory?.name ?? "Uncategorized",
                    amount: toNumber(
                        transaction.amount,
                    ),
                    type:
                        transaction.type === "INCOME"
                            ? ("income" as const)
                            : ("expense" as const),
                    currency:
                        transaction.account.currency,
                }));

        /*
         * -----------------------------------------
         * FINAL RESPONSE
         * -----------------------------------------
         */

        return {
            accounts: mappedAccounts,

            selectedAccount:
                mappedSelectedAccount,

            summary,

            dailyTrend,

            monthlyTrend,

            spendingByCategory,

            transactions:
                latestTransactions,
        };
    },

    async getTransactionsForDate(
  userId: string,
  date: Date,
  accountId?: string,
) {
  const transactions =
    await dashboardRepository.findTransactionsForDate(
      userId,
      date,
      accountId,
    );

  return transactions.map((transaction) => ({
    id: transaction.id,
    accountId: transaction.accountId,
    date: transaction.date.toISOString(),
    title: transaction.Title,
    category:
      transaction.category?.name ??
      "Uncategorized",
    subcategory:
      transaction.subcategory?.name ??
      "Uncategorized",
    amount: toNumber(transaction.amount),
    type:
      transaction.type === "INCOME"
        ? ("income" as const)
        : ("expense" as const),
    currency:
      transaction.account.currency,
  }));
},
};