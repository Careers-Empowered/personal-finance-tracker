export type GoalType = "savings" | "expense";

export type GoalPeriod = "weekly" | "monthly" | "yearly";

export type GoalCategory =
  | "Money"
  | "Emergency Fund"
  | "Travel"
  | "Education"
  | "Home"
  | "Vehicle"
  | "Health"
  | "Shopping"
  | "Investment"
  | "Personal"
  | "Other";

export interface Goal {
  id: number;
  name: string;
  type: GoalType;
  targetAmount: number;
  currentAmount: number;
  category: GoalCategory;
  period: GoalPeriod;
  startDate: string;
  endDate: string;
}