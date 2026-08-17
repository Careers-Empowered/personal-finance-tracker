import type { Account, Transaction } from "../../../types/dashboard";

interface RecentTransactionsProps {
  transactions?: Transaction[];
  accounts?: Account[];
}

const formatCurrency = (amount: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${date}T00:00:00`));

const RecentTransactions = ({
  transactions = [],
  accounts = [],
}: RecentTransactionsProps) => {
  const recentTransactions = [...transactions]
    .sort(
      (first, second) =>
        new Date(second.date).getTime() -
        new Date(first.date).getTime(),
    )
    .slice(0, 5);

  const getAccount = (accountId: string) =>
    accounts.find((account) => account.id === accountId);

  return (
    <section className="dashboard-section">
      <div className="section-header">
        <div>
          <h2>Transactions</h2>
          <p>Your financial activity</p>
        </div>
      </div>

      <div className="recent-transactions-card">
        {recentTransactions.length === 0 ? (
          <div className="empty-state">
            No recent transactions available
          </div>
        ) : (
          recentTransactions.map((transaction) => {
            const account = getAccount(transaction.accountId);
            const currency = account?.currency ?? "USD";

            return (
              <div
                className="recent-transaction"
                key={transaction.id}
              >
                <div
                  className={`recent-transaction__icon recent-transaction__icon--${transaction.type}`}
                >
                  {transaction.type === "income" ? "+" : "−"}
                </div>

                <div className="recent-transaction__details">
                  <strong>{transaction.description}</strong>

                  <span>
                    {transaction.category} ·{" "}
                    {account?.name ?? "Account"} ·{" "}
                    {formatDate(transaction.date)}
                  </span>
                </div>

                <strong
                  className={`recent-transaction__amount recent-transaction__amount--${transaction.type}`}
                >
                  {transaction.type === "income" ? "+" : "−"}
                  {formatCurrency(transaction.amount, currency)}
                </strong>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};

export default RecentTransactions;