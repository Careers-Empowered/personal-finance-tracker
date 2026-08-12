import React from "react";
import { GoalType } from "./types/goal";

interface GoalTypeModalProps {
  isOpen: boolean;
  selectedType: GoalType;
  onSelect: (type: GoalType) => void;
  onClose: () => void;
}

const GoalTypeModal: React.FC<GoalTypeModalProps> = ({
  isOpen,
  selectedType,
  onSelect,
  onClose,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="goal-modal-overlay" onClick={onClose}>
      <div
        className="goal-type-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2>Select Goal Type</h2>
            <p>Choose what you want to achieve.</p>
          </div>

          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <button
          className={`goal-type-option ${
            selectedType === "savings" ? "selected" : ""
          }`}
          onClick={() => {
            onSelect("savings");
            onClose();
          }}
        >
          <div className="goal-type-icon savings-icon">↗</div>

          <div className="goal-type-content">
            <h3>Savings Goal</h3>
            <p>Save money towards a specific target.</p>
          </div>

          {selectedType === "savings" && (
            <span className="selected-check">✓</span>
          )}
        </button>

        <button
          className={`goal-type-option ${
            selectedType === "expense" ? "selected" : ""
          }`}
          onClick={() => {
            onSelect("expense");
            onClose();
          }}
        >
          <div className="goal-type-icon expense-icon">₹</div>

          <div className="goal-type-content">
            <h3>Expense Goal</h3>
            <p>Plan an amount for a future expense.</p>
          </div>

          {selectedType === "expense" && (
            <span className="selected-check">✓</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default GoalTypeModal;