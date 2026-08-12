import React, { useState } from "react";
import { Goal } from "./types/goal";

interface GoalCardProps {
  goal: Goal;
  onAddAmount: (goalId: number, amount: number) => void;
  onDelete: (goalId: number) => void;
}

const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  onAddAmount,
  onDelete,
}) => {
  const [amount, setAmount] = useState("");
  const [showAmountInput, setShowAmountInput] = useState(false);

  const progress =
    goal.targetAmount > 0
      ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
      : 0;

  const handleAddAmount = () => {
    const numericAmount = Number(amount);

    if (!amount || numericAmount <= 0) {
      return;
    }

    onAddAmount(goal.id, numericAmount);

    setAmount("");
    setShowAmountInput(false);
  };

  const formatAmount = (value: number): string => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <article className="goal-card">
      <div className="goal-card-top">
        <div>
          <span className={`goal-type-badge ${goal.type}`}>
            {goal.type === "savings" ? "Savings Goal" : "Expense Goal"}
          </span>

          <h3>{goal.name}</h3>
          <p className="goal-category">{goal.category}</p>
        </div>

        <button
          className="delete-goal-button"
          onClick={() => onDelete(goal.id)}
          title="Delete goal"
        >
          🗑
        </button>
      </div>

      <div className="goal-amount-row">
        <div>
          <span className="amount-label">Current</span>
          <strong>{formatAmount(goal.currentAmount)}</strong>
        </div>

        <div className="target-amount">
          <span className="amount-label">Target</span>
          <strong>{formatAmount(goal.targetAmount)}</strong>
        </div>
      </div>

      <div className="progress-section">
        <div className="progress-info">
          <span>Progress</span>
          <strong>{Math.round(progress)}%</strong>
        </div>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="goal-details">
        <div>
          <span>Period</span>
          <strong>
            {goal.period.charAt(0).toUpperCase() + goal.period.slice(1)}
          </strong>
        </div>

        <div>
          <span>Start</span>
          <strong>{formatDate(goal.startDate)}</strong>
        </div>

        <div>
          <span>End</span>
          <strong>{formatDate(goal.endDate)}</strong>
        </div>
      </div>

      {showAmountInput && (
        <div className="add-amount-box">
          <input
            type="number"
            min="1"
            placeholder="Enter amount"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />

          <button onClick={handleAddAmount}>Add</button>

          <button
            className="cancel-button"
            onClick={() => {
              setAmount("");
              setShowAmountInput(false);
            }}
          >
            Cancel
          </button>
        </div>
      )}

      {!showAmountInput && (
        <button
          className="add-amount-button"
          onClick={() => setShowAmountInput(true)}
        >
          + Add Amount
        </button>
      )}
    </article>
  );
};

export default GoalCard;