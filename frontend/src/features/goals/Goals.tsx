import React, { useEffect, useState } from "react";
import GoalCard from "./GoalCard";
import GoalTypeModal from "./GoalTypeModal";
import CategoryModal from "./CategoryModal";

import { Goal, GoalCategory, GoalPeriod, GoalType } from "./types/goal";

import "./Goals.css";

const STORAGE_KEY = "personal-finance-goals";

const getToday = (): string => {
  return new Date().toISOString().split("T")[0];
};

const calculateEndDate = (
  startDate: string,
  period: GoalPeriod
): string => {
  const date = new Date(`${startDate}T00:00:00`);

  if (period === "weekly") {
    date.setDate(date.getDate() + 7);
  }

  if (period === "monthly") {
    date.setMonth(date.getMonth() + 1);
  }

  if (period === "yearly") {
    date.setFullYear(date.getFullYear() + 1);
  }

  return date.toISOString().split("T")[0];
};

const Goals: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>(() => {
    const savedGoals = localStorage.getItem(STORAGE_KEY);

    if (!savedGoals) {
      return [];
    }

    try {
      return JSON.parse(savedGoals) as Goal[];
    } catch {
      return [];
    }
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [isGoalTypeModalOpen, setIsGoalTypeModalOpen] = useState(false);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const [goalType, setGoalType] = useState<GoalType>("savings");

  const [category, setCategory] =
    useState<GoalCategory>("Money");

  const [name, setName] = useState("");

  const [targetAmount, setTargetAmount] = useState("");

  const [currentAmount, setCurrentAmount] = useState("");

  const [period, setPeriod] =
    useState<GoalPeriod>("monthly");

  const [startDate, setStartDate] = useState(getToday());

  const [endDate, setEndDate] = useState(
    calculateEndDate(getToday(), "monthly")
  );

  const [error, setError] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    setEndDate(calculateEndDate(startDate, period));
  }, [startDate, period]);

  const resetForm = () => {
    const today = getToday();

    setName("");
    setTargetAmount("");
    setCurrentAmount("");
    setGoalType("savings");
    setCategory("Money");
    setPeriod("monthly");
    setStartDate(today);
    setEndDate(calculateEndDate(today, "monthly"));
    setError("");
  };

  const openAddGoalModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const closeAddGoalModal = () => {
    setIsAddModalOpen(false);
    setError("");
  };

  const handleCreateGoal = () => {
    const target = Number(targetAmount);
    const current = Number(currentAmount || 0);

    if (!name.trim()) {
      setError("Please enter a goal name.");
      return;
    }

    if (!targetAmount || target <= 0) {
      setError("Please enter a valid target amount.");
      return;
    }

    if (current < 0) {
      setError("Current amount cannot be negative.");
      return;
    }

    if (current > target) {
      setError("Current amount cannot be greater than target amount.");
      return;
    }

    const newGoal: Goal = {
      id: Date.now(),
      name: name.trim(),
      type: goalType,
      targetAmount: target,
      currentAmount: current,
      category,
      period,
      startDate,
      endDate,
    };

    setGoals((previousGoals) => [
      ...previousGoals,
      newGoal,
    ]);

    closeAddGoalModal();
  };

  const handleAddAmount = (
    goalId: number,
    amount: number
  ) => {
    setGoals((previousGoals) =>
      previousGoals.map((goal) => {
        if (goal.id !== goalId) {
          return goal;
        }

        const updatedAmount = Math.min(
          goal.currentAmount + amount,
          goal.targetAmount
        );

        return {
          ...goal,
          currentAmount: updatedAmount,
        };
      })
    );
  };

  const handleDeleteGoal = (goalId: number) => {
    const shouldDelete = window.confirm(
      "Are you sure you want to delete this goal?"
    );

    if (!shouldDelete) {
      return;
    }

    setGoals((previousGoals) =>
      previousGoals.filter((goal) => goal.id !== goalId)
    );
  };

  return (
    <div className="goals-page">
      <div className="goals-header">
        <div>
          <span className="page-eyebrow">Financial Planning</span>

          <h1>Goals</h1>

          <p>
            Set targets, track your progress and stay focused
            on what matters.
          </p>
        </div>

        <button
          className="create-goal-button"
          onClick={openAddGoalModal}
        >
          + Add Goal
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="empty-goals">
          <div className="empty-icon">🎯</div>

          <h2>No goals yet</h2>

          <p>
            Create your first financial goal and start
            tracking your progress.
          </p>

          <button
            className="create-goal-button"
            onClick={openAddGoalModal}
          >
            Create Your First Goal
          </button>
        </div>
      ) : (
        <div className="goals-grid">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onAddAmount={handleAddAmount}
              onDelete={handleDeleteGoal}
            />
          ))}
        </div>
      )}

      {/* Add Goal Modal */}

      {isAddModalOpen && (
        <div
          className="goal-modal-overlay"
          onClick={closeAddGoalModal}
        >
          <div
            className="add-goal-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h2>Create New Goal</h2>
                <p>
                  Define your target and start tracking it.
                </p>
              </div>

              <button
                className="modal-close"
                onClick={closeAddGoalModal}
              >
                ×
              </button>
            </div>

            <div className="form-group">
              <label htmlFor="goal-name">
                Goal Name
              </label>

              <input
                id="goal-name"
                type="text"
                placeholder="Example: New Laptop"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="target-amount">
                Target Amount
              </label>

              <input
                id="target-amount"
                type="number"
                min="1"
                placeholder="Enter target amount"
                value={targetAmount}
                onChange={(event) =>
                  setTargetAmount(event.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="current-amount">
                Current Amount
              </label>

              <input
                id="current-amount"
                type="number"
                min="0"
                placeholder="Enter current amount"
                value={currentAmount}
                onChange={(event) =>
                  setCurrentAmount(event.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label>Goal Type</label>

              <button
                className="select-field"
                onClick={() =>
                  setIsGoalTypeModalOpen(true)
                }
              >
                <span>
                  {goalType === "savings"
                    ? "Savings Goal"
                    : "Expense Goal"}
                </span>

                <span>⌄</span>
              </button>
            </div>

            <div className="form-group">
              <label>Category</label>

              <button
                className="select-field"
                onClick={() =>
                  setIsCategoryModalOpen(true)
                }
              >
                <span>{category}</span>

                <span>⌄</span>
              </button>
            </div>

            <div className="form-group">
              <label htmlFor="goal-period">
                Target Period
              </label>

              <select
                id="goal-period"
                value={period}
                onChange={(event) =>
                  setPeriod(
                    event.target.value as GoalPeriod
                  )
                }
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div className="date-grid">
              <div className="form-group">
                <label htmlFor="start-date">
                  Start Date
                </label>

                <input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(event) =>
                    setStartDate(event.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label htmlFor="end-date">
                  End Date
                </label>

                <input
                  id="end-date"
                  type="date"
                  value={endDate}
                  readOnly
                />

                <small>
                  Automatically calculated from the target
                  period.
                </small>
              </div>
            </div>

            {error && (
              <div className="form-error">
                {error}
              </div>
            )}

            <button
              className="submit-goal-button"
              onClick={handleCreateGoal}
            >
              Create Goal
            </button>
          </div>
        </div>
      )}

      <GoalTypeModal
        isOpen={isGoalTypeModalOpen}
        selectedType={goalType}
        onSelect={setGoalType}
        onClose={() =>
          setIsGoalTypeModalOpen(false)
        }
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        selectedCategory={category}
        onSelect={setCategory}
        onClose={() =>
          setIsCategoryModalOpen(false)
        }
      />
    </div>
  );
};

export default Goals;