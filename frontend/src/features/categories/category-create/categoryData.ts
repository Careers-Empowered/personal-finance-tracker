import { Category } from "./categoryTypes";

export const DEFAULT_CATEGORIES: Category[] = [
  // Expense Categories
  {
    id: "expense-food-dining",
    name: "Food & Dining",
    type: "expense",
    icon: "🍽️",
    color: "#E8F1FF",
    isCustom: false,
  },
  {
    id: "expense-transportation",
    name: "Transportation",
    type: "expense",
    icon: "🚗",
    color: "#FFF4D6",
    isCustom: false,
  },
  {
    id: "expense-housing",
    name: "Housing",
    type: "expense",
    icon: "🏠",
    color: "#F3E8FF",
    isCustom: false,
  },
  {
    id: "expense-shopping",
    name: "Shopping",
    type: "expense",
    icon: "🛍️",
    color: "#FFE8EF",
    isCustom: false,
  },
  {
    id: "expense-health-medical",
    name: "Health & Medical",
    type: "expense",
    icon: "💊",
    color: "#E8FFF3",
    isCustom: false,
  },
  {
    id: "expense-entertainment",
    name: "Entertainment",
    type: "expense",
    icon: "🎬",
    color: "#FFF0E5",
    isCustom: false,
  },

  // Income Categories
  {
    id: "income-salary",
    name: "Salary",
    type: "income",
    icon: "💼",
    color: "#E8F1FF",
    isCustom: false,
  },
  {
    id: "income-freelance",
    name: "Freelance",
    type: "income",
    icon: "💻",
    color: "#E8FFF3",
    isCustom: false,
  },
  {
    id: "income-business",
    name: "Business",
    type: "income",
    icon: "🏢",
    color: "#FFF4D6",
    isCustom: false,
  },
  {
    id: "income-investments",
    name: "Investments",
    type: "income",
    icon: "📈",
    color: "#F3E8FF",
    isCustom: false,
  },
  {
    id: "income-other",
    name: "Other Income",
    type: "income",
    icon: "💰",
    color: "#FFE8EF",
    isCustom: false,
  },
];

export const CATEGORY_ICONS = [
  "🍽️",
  "🚗",
  "🏠",
  "🛍️",
  "💊",
  "🎬",
  "💼",
  "💻",
  "🏢",
  "📈",
  "💰",
  "✈️",
  "🎓",
  "🐶",
  "🎮",
  "📱",
];

export const CATEGORY_COLORS = [
  "#E8F1FF",
  "#FFF4D6",
  "#F3E8FF",
  "#FFE8EF",
  "#E8FFF3",
  "#FFF0E5",
];