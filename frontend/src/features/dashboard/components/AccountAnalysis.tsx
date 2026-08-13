import type { Account } from "../types/dashboard";

interface AccountAnalysisProps {
  accounts?: Account[];
}
const formatCurrency = (amount: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);

const AccountAnalysis = ({ accounts = [] }: AccountAnalysisProps) => (
  <section className="dashboard-section">
    <div className="section-header">
      <div>
        <h2>Account analysis</h2>
        <p>Balances for the selected account</p>
      </div>
    </div>
    <div className="account-table-container">
      {accounts.length === 0 ? (
        <div className="empty-state">No account data available</div>
      ) : (
        <table className="account-table">
          <thead>
            <tr>
              <th>Account</th>
              <th>Balance</th>
              <th>This month in</th>
              <th>This month out</th>
              <th>Transactions</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account) => (
              <tr key={account.id}>
                <td>{account.name}</td>
                <td
                  className={
                    account.balance < 0 ? "account-balance--negative" : ""
                  }
                >
                  {formatCurrency(account.balance, account.currency)}
                </td>
                <td>{formatCurrency(account.income, account.currency)}</td>
                <td>{formatCurrency(account.expenses, account.currency)}</td>
                <td>{account.transactionCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  </section>
);
export default AccountAnalysis;
