import type { CategorizationRule } from "./types";

export const categorizationRules: CategorizationRule[] = [
  // Expense - Food & Dining
  {
    keyword: "swiggy",
    category: "Food & Dining",
    type: "expense",
  },
  {
    keyword: "zomato",
    category: "Food & Dining",
    type: "expense",
  },
  {
    keyword: "restaurant",
    category: "Food & Dining",
    type: "expense",
  },
  {
    keyword: "cafe",
    category: "Food & Dining",
    type: "expense",
  },

  // Expense - Transportation
  {
    keyword: "uber",
    category: "Transportation",
    type: "expense",
  },
  {
    keyword: "ola",
    category: "Transportation",
    type: "expense",
  },
  {
    keyword: "rapido",
    category: "Transportation",
    type: "expense",
  },
  {
    keyword: "petrol",
    category: "Transportation",
    type: "expense",
  },

  // Expense - Housing
  {
    keyword: "rent",
    category: "Housing",
    type: "expense",
  },
  {
    keyword: "apartment",
    category: "Housing",
    type: "expense",
  },

  // Expense - Shopping
  {
    keyword: "amazon",
    category: "Shopping",
    type: "expense",
  },
  {
    keyword: "flipkart",
    category: "Shopping",
    type: "expense",
  },
  {
    keyword: "myntra",
    category: "Shopping",
    type: "expense",
  },

  // Expense - Health & Medical
  {
    keyword: "hospital",
    category: "Health & Medical",
    type: "expense",
  },
  {
    keyword: "pharmacy",
    category: "Health & Medical",
    type: "expense",
  },
  {
    keyword: "medical",
    category: "Health & Medical",
    type: "expense",
  },
  {
    keyword: "doctor",
    category: "Health & Medical",
    type: "expense",
  },

  // Expense - Entertainment
  {
    keyword: "netflix",
    category: "Entertainment",
    type: "expense",
  },
  {
    keyword: "spotify",
    category: "Entertainment",
    type: "expense",
  },
  {
    keyword: "movie",
    category: "Entertainment",
    type: "expense",
  },
  {
    keyword: "cinema",
    category: "Entertainment",
    type: "expense",
  },

  // Income - Salary
  {
    keyword: "salary",
    category: "Salary",
    type: "income",
  },
  {
    keyword: "payroll",
    category: "Salary",
    type: "income",
  },
  {
    keyword: "wages",
    category: "Salary",
    type: "income",
  },

  // Income - Freelance
  {
    keyword: "freelance",
    category: "Freelance",
    type: "income",
  },
  {
    keyword: "freelancing",
    category: "Freelance",
    type: "income",
  },

  // Income - Business
  {
    keyword: "business",
    category: "Business",
    type: "income",
  },
  {
    keyword: "sales",
    category: "Business",
    type: "income",
  },

  // Income - Investments
  {
    keyword: "dividend",
    category: "Investments",
    type: "income",
  },
  {
    keyword: "investment",
    category: "Investments",
    type: "income",
  },
];