import type { CSSProperties } from "react";
import type { ValidatedTransaction } from "../types/import";

export interface DatabaseDuplicateMatch {
  row: number;
  exists: boolean;
  existingTransaction?: {
    id?: string;
    accountId?: string;
    date?: string;
    title?: string;
    amount?: number | string;
    type?: "INCOME" | "EXPENSE" | string;
    account?: {
      id?: string;
      name?: string;
    };
  };
}

interface DatabaseDuplicateCheckProps {
  databaseDuplicateMatches: DatabaseDuplicateMatch[];
  transactionsForImport: ValidatedTransaction[];
  selectedAccountId: string;
  isImporting: boolean;
  onBack: () => void;
  onExcludeDuplicates: () => void | Promise<void>;
}

const styles = {
  section: {
    width: "100%",
    maxWidth: "1100px",
    margin: "0 auto",
    boxSizing: "border-box",
  } as CSSProperties,
  card: {
    backgroundColor: "#ffffff",
    border: "1px solid #dedede",
    borderRadius: "16px",
    padding: "2rem",
    boxSizing: "border-box",
  } as CSSProperties,
};

export default function BankStatementDatabaseDuplicateCheck({
  databaseDuplicateMatches,
  transactionsForImport,
  selectedAccountId,
  isImporting,
  onBack,
  onExcludeDuplicates,
}: DatabaseDuplicateCheckProps) {
  return (
    <section style={styles.section}>
      <div style={styles.card}>
        <div style={{ marginBottom: "1.5rem" }}>
          <h2
            style={{
              margin: 0,
              fontSize: "1.75rem",
              lineHeight: 1.25,
              fontWeight: 700,
              color: "#111827",
            }}
          >
            Database Duplicate Check
          </h2>

          <p
            style={{
              margin: "0.6rem 0 0",
              color: "#667085",
              fontSize: "1rem",
              lineHeight: 1.5,
            }}
          >
            Review transactions that already exist in the selected account
            before importing them.
          </p>
        </div>

        <div
          style={{
            marginBottom: "1.5rem",
            padding: "1rem 1.25rem",
            borderRadius: "12px",
            border: "1px solid #f3b5b5",
            backgroundColor: "#fff6f6",
            color: "#c5221f",
            boxSizing: "border-box",
          }}
        >
          <div style={{ fontWeight: 700, fontSize: "1rem" }}>
            ⚠ Database Duplicate Warning
          </div>

          <div
            style={{
              marginTop: "0.4rem",
              color: "#7f1d1d",
              lineHeight: 1.5,
            }}
          >
            {databaseDuplicateMatches.length} transaction
            {databaseDuplicateMatches.length === 1 ? "" : "s"} from this
            import already{" "}
            {databaseDuplicateMatches.length === 1 ? "exists" : "exist"} in
            the selected account.
          </div>

          <div
            style={{
              marginTop: "0.35rem",
              color: "#667085",
              lineHeight: 1.5,
            }}
          >
            You can remove these duplicate rows from the current import
            batch.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          {databaseDuplicateMatches.map((match) => {
            const importedTransaction = transactionsForImport.find(
              (transaction) => transaction.row === match.row
            );

            const imported = importedTransaction?.data;
            const existing = match.existingTransaction;

            const importedDate = imported?.date
              ? String(imported.date).split("T")[0]
              : "-";

            const existingDate = existing?.date
              ? String(existing.date).split("T")[0]
              : "-";

            return (
              <div
                key={`${match.row}-${existing?.id ?? "existing"}`}
                style={{
                  border: "1px solid #f1b8b8",
                  borderRadius: "14px",
                  padding: "1.25rem",
                  backgroundColor: "#fff9f9",
                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "1rem",
                    marginBottom: "1rem",
                    flexWrap: "wrap",
                  }}
                >
                  <strong style={{ fontSize: "1.05rem", color: "#111827" }}>
                    Row {match.row}
                  </strong>

                  <span
                    style={{
                      fontWeight: 700,
                      color: "#c5221f",
                      fontSize: "1rem",
                    }}
                  >
                    Already exists
                  </span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: "1rem",
                  }}
                >
                  <RecordCard
                    title="Imported File"
                    backgroundColor="#f7f8fa"
                    borderColor="#eceef0"
                    date={importedDate}
                    titleValue={imported?.title}
                    amount={imported?.amount}
                    type={imported?.type}
                  />

                  <RecordCard
                    title="Existing Database Record"
                    backgroundColor="#fff3e7"
                    borderColor="#f2d2b3"
                    date={existingDate}
                    titleValue={existing?.title}
                    amount={existing?.amount}
                    type={existing?.type}
                    account={existing?.account?.name}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
            marginTop: "1.75rem",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={onBack}
            style={{
              padding: "0.8rem 1.3rem",
              border: "none",
              borderRadius: "10px",
              backgroundColor: "#f1f3f4",
              color: "#111827",
              fontSize: "1rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Back
          </button>

          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              flexWrap: "wrap",
              justifyContent: "flex-end",
            }}
          >
            <button
              type="button"
              disabled={!selectedAccountId || isImporting}
              onClick={onExcludeDuplicates}
              style={{
                padding: "0.8rem 1.3rem",
                border: "none",
                borderRadius: "10px",
                backgroundColor: "#188038",
                color: "#ffffff",
                fontSize: "1rem",
                fontWeight: 700,
                cursor:
                  selectedAccountId && !isImporting
                    ? "pointer"
                    : "not-allowed",
                opacity:
                  selectedAccountId && !isImporting ? 1 : 0.55,
              }}
            >
              {isImporting
                ? "Importing..."
                : `Exclude ${databaseDuplicateMatches.length} Duplicate${
                    databaseDuplicateMatches.length === 1 ? "" : "s"
                  } & Continue`}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function RecordCard({
  title,
  backgroundColor,
  borderColor,
  date,
  titleValue,
  amount,
  type,
  account,
}: {
  title: string;
  backgroundColor: string;
  borderColor: string;
  date: string;
  titleValue?: string;
  amount?: number | string;
  type?: string;
  account?: string;
}) {
  return (
    <div
      style={{
        padding: "1.15rem",
        borderRadius: "10px",
        backgroundColor,
        border: `1px solid ${borderColor}`,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          fontWeight: 700,
          fontSize: "1rem",
          marginBottom: "0.9rem",
          color: "#111827",
        }}
      >
        {title}
      </div>

      <div style={{ lineHeight: 1.65, color: "#111827" }}>
        <div>
          <strong>Date:</strong> {date}
        </div>
        <div>
          <strong>Title:</strong> {titleValue || "-"}
        </div>
        <div>
          <strong>Amount:</strong> {amount ?? "-"}
        </div>
        <div>
          <strong>Type:</strong> {type || "-"}
        </div>
        {account !== undefined && (
          <div>
            <strong>Account:</strong> {account || "-"}
          </div>
        )}
      </div>
    </div>
  );
}