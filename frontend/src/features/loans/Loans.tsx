import { useMemo, useState } from "react";
import { brand } from "../../brand/config/brand";

type Loan = {
  id: number;
  name: string;
  lender: string;
  principal: number;
  remaining: number;
  monthlyPayment: number;
  nextPayment: string;
};

export default function Loans() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    name: "",
    lender: "",
    principal: "",
    monthlyPayment: "",
    nextPayment: "",
  });

  const totalBorrowed = useMemo(
    () => loans.reduce((sum, loan) => sum + loan.principal, 0),
    [loans],
  );

  const totalRemaining = useMemo(
    () => loans.reduce((sum, loan) => sum + loan.remaining, 0),
    [loans],
  );

  const totalMonthlyPayment = useMemo(
    () => loans.reduce((sum, loan) => sum + loan.monthlyPayment, 0),
    [loans],
  );

  const totalPaid = totalBorrowed - totalRemaining;

  const repaymentProgress =
    totalBorrowed > 0 ? Math.round((totalPaid / totalBorrowed) * 100) : 0;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);

  const handleAddLoan = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !form.name.trim() ||
      !form.lender.trim() ||
      !form.principal ||
      !form.monthlyPayment ||
      !form.nextPayment
    ) {
      return;
    }

    const principal = Number(form.principal);
    const monthlyPayment = Number(form.monthlyPayment);

    if (principal <= 0 || monthlyPayment <= 0) {
      return;
    }

    const newLoan: Loan = {
      id: Date.now(),
      name: form.name.trim(),
      lender: form.lender.trim(),
      principal,
      remaining: principal,
      monthlyPayment,
      nextPayment: form.nextPayment,
    };

    setLoans((currentLoans) => [...currentLoans, newLoan]);

    setForm({
      name: "",
      lender: "",
      principal: "",
      monthlyPayment: "",
      nextPayment: "",
    });

    setShowForm(false);
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <div>
          <p style={styles.eyebrow}>FINANCIAL OVERVIEW</p>

          <h1 style={styles.title}>Loans</h1>

          <p style={styles.subtitle}>
            Track your loans, repayments and upcoming payments.
          </p>
        </div>

        <button
          type="button"
          style={styles.primaryButton}
          onClick={() => setShowForm(true)}
        >
          + Add Loan
        </button>
      </header>

      {/* Summary Cards */}
      <section style={styles.summaryGrid}>
        <SummaryCard
          label="Total Borrowed"
          value={formatCurrency(totalBorrowed)}
        />

        <SummaryCard
          label="Remaining Balance"
          value={formatCurrency(totalRemaining)}
        />

        <SummaryCard
          label="Monthly Payments"
          value={formatCurrency(totalMonthlyPayment)}
        />

        <SummaryCard label="Active Loans" value={String(loans.length)} />
      </section>

      {/* Repayment Progress */}
      <section style={styles.progressCard}>
        <div style={styles.progressHeader}>
          <div>
            <p style={styles.sectionLabel}>REPAYMENT PROGRESS</p>

            <h2 style={styles.progressTitle}>{repaymentProgress}% paid off</h2>
          </div>

          <strong style={styles.progressAmount}>
            {formatCurrency(totalPaid)} paid
          </strong>
        </div>

        <div style={styles.progressTrack}>
          <div
            style={{
              ...styles.progressBar,
              width: `${repaymentProgress}%`,
            }}
          />
        </div>

        <div style={styles.progressFooter}>
          <span>Paid {formatCurrency(totalPaid)}</span>

          <span>Remaining {formatCurrency(totalRemaining)}</span>
        </div>
      </section>

      {/* Loan Section Header */}
      <section style={styles.sectionHeader}>
        <div>
          <p style={styles.sectionLabel}>YOUR LOANS</p>

          <h2 style={styles.sectionTitle}>Active Loans</h2>
        </div>

        <span style={styles.loanCount}>
          {loans.length} {loans.length === 1 ? "loan" : "loans"}
        </span>
      </section>

      {/* Empty State / Loan Cards */}
      {loans.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>₹</div>

          <h3 style={styles.emptyTitle}>No loans added yet</h3>

          <p style={styles.emptyText}>
            Add your first loan to start tracking your borrowing and repayments.
          </p>

          <button
            type="button"
            style={styles.secondaryButton}
            onClick={() => setShowForm(true)}
          >
            + Add Your First Loan
          </button>
        </div>
      ) : (
        <div style={styles.loanGrid}>
          {loans.map((loan) => {
            const paid = loan.principal - loan.remaining;

            const progress =
              loan.principal > 0
                ? Math.round((paid / loan.principal) * 100)
                : 0;

            return (
              <LoanCard
                key={loan.id}
                loan={loan}
                progress={progress}
                formatCurrency={formatCurrency}
              />
            );
          })}
        </div>
      )}

      {/* Add Loan Modal */}
      {showForm && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <div>
                <p style={styles.sectionLabel}>NEW LOAN</p>

                <h2 style={styles.modalTitle}>Add a loan</h2>
              </div>

              <button
                type="button"
                style={styles.closeButton}
                onClick={() => setShowForm(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddLoan}>
              <div style={styles.formGrid}>
                <Input
                  label="Loan Name"
                  placeholder="e.g. Home Loan"
                  value={form.name}
                  onChange={(value) =>
                    setForm({
                      ...form,
                      name: value,
                    })
                  }
                />

                <Input
                  label="Lender"
                  placeholder="e.g. Bank name"
                  value={form.lender}
                  onChange={(value) =>
                    setForm({
                      ...form,
                      lender: value,
                    })
                  }
                />

                <Input
                  label="Principal Amount"
                  placeholder="Enter amount"
                  type="number"
                  min="0"
                  value={form.principal}
                  onChange={(value) =>
                    setForm({
                      ...form,
                      principal: value,
                    })
                  }
                />

                <Input
                  label="Monthly Payment"
                  placeholder="Enter amount"
                  type="number"
                  min="0"
                  value={form.monthlyPayment}
                  onChange={(value) =>
                    setForm({
                      ...form,
                      monthlyPayment: value,
                    })
                  }
                />

                <Input
                  label="Next Payment Date"
                  type="date"
                  value={form.nextPayment}
                  onChange={(value) =>
                    setForm({
                      ...form,
                      nextPayment: value,
                    })
                  }
                />
              </div>

              <div style={styles.formActions}>
                <button
                  type="button"
                  style={styles.cancelButton}
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

                <button type="submit" style={styles.primaryButton}>
                  Add Loan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* --------------------------------------------------
   Summary Card
-------------------------------------------------- */

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.summaryCard}>
      <p style={styles.summaryLabel}>{label}</p>

      <h3 style={styles.summaryValue}>{value}</h3>
    </div>
  );
}

/* --------------------------------------------------
   Loan Card
-------------------------------------------------- */

function LoanCard({
  loan,
  progress,
  formatCurrency,
}: {
  loan: Loan;
  progress: number;
  formatCurrency: (value: number) => string;
}) {
  return (
    <article style={styles.loanCard}>
      <div style={styles.loanHeader}>
        <div>
          <h3 style={styles.loanName}>{loan.name}</h3>

          <p style={styles.lender}>{loan.lender}</p>
        </div>
      </div>

      <div style={styles.balanceArea}>
        <p style={styles.balanceLabel}>Remaining Balance</p>

        <h2 style={styles.balance}>{formatCurrency(loan.remaining)}</h2>
      </div>

      <div style={styles.loanStats}>
        <div>
          <span style={styles.statLabel}>Original Amount</span>

          <strong style={styles.statValue}>
            {formatCurrency(loan.principal)}
          </strong>
        </div>

        <div>
          <span style={styles.statLabel}>Monthly Payment</span>

          <strong style={styles.statValue}>
            {formatCurrency(loan.monthlyPayment)}
          </strong>
        </div>
      </div>

      <div style={styles.loanProgressHeader}>
        <span>Repayment</span>

        <strong>{progress}%</strong>
      </div>

      <div style={styles.smallProgressTrack}>
        <div
          style={{
            ...styles.smallProgressBar,
            width: `${progress}%`,
          }}
        />
      </div>

      <div style={styles.loanBottom}>
        <span style={styles.nextLabel}>Next payment</span>

        <strong style={styles.nextDate}>{loan.nextPayment}</strong>
      </div>
    </article>
  );
}

/* --------------------------------------------------
   Input
-------------------------------------------------- */

function Input({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  min,
}: {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  min?: string;
}) {
  return (
    <label style={styles.inputWrapper}>
      <span style={styles.inputLabel}>{label}</span>

      <input
        type={type}
        min={min}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={styles.input}
      />
    </label>
  );
}

/* --------------------------------------------------
   Styles
   All colors and typography come from brand.ts
-------------------------------------------------- */

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100%",
    padding: "34px",
    background: brand.colors.background,
    color: brand.colors.textDark,
    fontFamily: brand.typography.body,
    boxSizing: "border-box",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "28px",
  },

  eyebrow: {
    margin: "0 0 7px",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "1.4px",
    color: brand.colors.textMuted,
  },

  title: {
    margin: 0,
    fontSize: "32px",
    fontWeight: 750,
    fontFamily: brand.typography.heading,
    color: brand.colors.textDark,
  },

  subtitle: {
    margin: "9px 0 0",
    color: brand.colors.textMuted,
    fontSize: "14px",
  },

  primaryButton: {
    border: "none",
    background: brand.colors.primary,
    color: brand.colors.selectedItemText,
    padding: "12px 18px",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: brand.typography.body,
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "14px",
    marginBottom: "18px",
  },

  summaryCard: {
    background: "#ffffff",
    border: `1px solid ${brand.colors.divider}`,
    borderRadius: "15px",
    padding: "20px",
  },

  summaryLabel: {
    margin: 0,
    color: brand.colors.textMuted,
    fontSize: "12px",
  },

  summaryValue: {
    margin: "7px 0 0",
    fontSize: "20px",
    fontFamily: brand.typography.heading,
    color: brand.colors.textDark,
  },

  progressCard: {
    background: "#ffffff",
    border: `1px solid ${brand.colors.divider}`,
    borderRadius: "16px",
    padding: "22px",
    marginBottom: "30px",
  },

  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "18px",
  },

  sectionLabel: {
    margin: 0,
    fontSize: "10px",
    letterSpacing: "1.3px",
    fontWeight: 800,
    color: brand.colors.textMuted,
  },

  progressTitle: {
    margin: "5px 0 0",
    fontSize: "19px",
    fontFamily: brand.typography.heading,
    color: brand.colors.textDark,
  },

  progressAmount: {
    color: brand.colors.textDark,
    fontSize: "13px",
  },

  progressTrack: {
    height: "8px",
    borderRadius: "999px",
    background: brand.colors.background,
    overflow: "hidden",
  },

  progressBar: {
    height: "100%",
    background: brand.colors.primary,
    borderRadius: "999px",
    transition: "width 0.3s ease",
  },

  progressFooter: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "9px",
    fontSize: "12px",
    color: brand.colors.textMuted,
  },

  sectionHeader: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: "14px",
  },

  sectionTitle: {
    margin: "5px 0 0",
    fontSize: "21px",
    fontFamily: brand.typography.heading,
    color: brand.colors.textDark,
  },

  loanCount: {
    fontSize: "12px",
    color: brand.colors.textMuted,
    background: "#ffffff",
    border: `1px solid ${brand.colors.divider}`,
    borderRadius: "999px",
    padding: "6px 10px",
  },

  emptyState: {
    background: "#ffffff",
    border: `1px dashed ${brand.colors.textMuted}`,
    borderRadius: "16px",
    padding: "60px 20px",
    textAlign: "center",
  },

  emptyIcon: {
    width: "48px",
    height: "48px",
    margin: "0 auto 14px",
    borderRadius: "14px",
    background: brand.colors.primary,
    color: brand.colors.selectedItemText,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: "20px",
  },

  emptyTitle: {
    margin: "0 0 8px",
    fontSize: "18px",
    fontFamily: brand.typography.heading,
    color: brand.colors.textDark,
  },

  emptyText: {
    margin: "0 auto 20px",
    maxWidth: "400px",
    color: brand.colors.textMuted,
    fontSize: "13px",
    lineHeight: 1.6,
  },

  secondaryButton: {
    border: `1px solid ${brand.colors.primary}`,
    background: "#ffffff",
    color: brand.colors.primary,
    padding: "10px 15px",
    borderRadius: "9px",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: brand.typography.body,
  },

  loanGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "16px",
  },

  loanCard: {
    background: "#ffffff",
    border: `1px solid ${brand.colors.divider}`,
    borderRadius: "17px",
    padding: "21px",
  },

  loanHeader: {
    display: "flex",
    justifyContent: "space-between",
  },

  loanName: {
    margin: 0,
    fontSize: "17px",
    fontFamily: brand.typography.heading,
    color: brand.colors.textDark,
  },

  lender: {
    margin: "4px 0 0",
    color: brand.colors.textMuted,
    fontSize: "12px",
  },

  balanceArea: {
    marginTop: "25px",
  },

  balanceLabel: {
    margin: 0,
    color: brand.colors.textMuted,
    fontSize: "11px",
  },

  balance: {
    margin: "5px 0 0",
    fontSize: "27px",
    fontFamily: brand.typography.heading,
    color: brand.colors.textDark,
  },

  loanStats: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    borderTop: `1px solid ${brand.colors.divider}`,
    borderBottom: `1px solid ${brand.colors.divider}`,
    margin: "18px 0",
    padding: "14px 0",
  },

  statLabel: {
    display: "block",
    color: brand.colors.textMuted,
    fontSize: "10px",
    marginBottom: "4px",
  },

  statValue: {
    display: "block",
    color: brand.colors.textDark,
    fontSize: "13px",
  },

  loanProgressHeader: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "12px",
    color: brand.colors.textMuted,
    marginBottom: "7px",
  },

  smallProgressTrack: {
    height: "6px",
    background: brand.colors.background,
    borderRadius: "999px",
    overflow: "hidden",
  },

  smallProgressBar: {
    height: "100%",
    background: brand.colors.primary,
    borderRadius: "999px",
  },

  loanBottom: {
    marginTop: "18px",
  },

  nextLabel: {
    display: "block",
    fontSize: "10px",
    color: brand.colors.textMuted,
  },

  nextDate: {
    display: "block",
    marginTop: "3px",
    fontSize: "12px",
    color: brand.colors.textDark,
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(35, 31, 32, 0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    zIndex: 1000,
  },

  modal: {
    width: "100%",
    maxWidth: "650px",
    background: "#ffffff",
    borderRadius: "18px",
    padding: "25px",
    boxSizing: "border-box",
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "23px",
  },

  modalTitle: {
    margin: "5px 0 0",
    fontSize: "24px",
    fontFamily: brand.typography.heading,
    color: brand.colors.textDark,
  },

  closeButton: {
    border: "none",
    background: brand.colors.background,
    color: brand.colors.textDark,
    width: "34px",
    height: "34px",
    borderRadius: "9px",
    fontSize: "22px",
    cursor: "pointer",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "17px",
  },

  inputWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },

  inputLabel: {
    fontSize: "12px",
    fontWeight: 700,
    color: brand.colors.textDark,
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    border: `1px solid ${brand.colors.divider}`,
    borderRadius: "9px",
    padding: "11px 12px",
    fontSize: "13px",
    fontFamily: brand.typography.body,
    color: brand.colors.textDark,
    background: "#ffffff",
    outline: "none",
  },

  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "25px",
  },

  cancelButton: {
    border: `1px solid ${brand.colors.divider}`,
    background: "#ffffff",
    color: brand.colors.textDark,
    padding: "11px 17px",
    borderRadius: "9px",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: brand.typography.body,
  },
};
