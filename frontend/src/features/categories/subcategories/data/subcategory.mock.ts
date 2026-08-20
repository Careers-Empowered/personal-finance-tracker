import type {
  Category,
  Subcategory,
} from "../types/subcategory.types";

export const mockCategories: Category[] = [
  // =========================================
  // EXPENSE CATEGORIES
  // =========================================

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

  // =========================================
  // INCOME CATEGORIES
  // =========================================

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
    icon: "💰",
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
    icon: "💵",
    color: "#FFE8EF",
    isCustom: false,
  },
];

export const mockSubcategories: Subcategory[] = [
  // =========================================
  // FOOD & DINING
  // =========================================

  {
    id: "sub-restaurants",
    name: "Restaurants",
    categoryId: "expense-food-dining",
    icon: "🍽️",
    createdAt: "2026-08-12T10:00:00Z",
    updatedAt: "2026-08-12T10:00:00Z",
  },

  {
    id: "sub-fast-food",
    name: "Fast Food",
    categoryId: "expense-food-dining",
    icon: "🍔",
    createdAt: "2026-08-12T10:01:00Z",
    updatedAt: "2026-08-12T10:01:00Z",
  },

  {
    id: "sub-coffee-tea",
    name: "Coffee & Tea",
    categoryId: "expense-food-dining",
    icon: "☕",
    createdAt: "2026-08-12T10:02:00Z",
    updatedAt: "2026-08-12T10:02:00Z",
  },

  {
    id: "sub-food-delivery",
    name: "Food Delivery",
    categoryId: "expense-food-dining",
    icon: "🛵",
    createdAt: "2026-08-12T10:03:00Z",
    updatedAt: "2026-08-12T10:03:00Z",
  },

  // =========================================
  // TRANSPORTATION
  // =========================================

  {
    id: "sub-fuel",
    name: "Fuel",
    categoryId: "expense-transportation",
    icon: "⛽",
    createdAt: "2026-08-12T10:04:00Z",
    updatedAt: "2026-08-12T10:04:00Z",
  },

  {
    id: "sub-public-transport",
    name: "Public Transport",
    categoryId: "expense-transportation",
    icon: "🚌",
    createdAt: "2026-08-12T10:05:00Z",
    updatedAt: "2026-08-12T10:05:00Z",
  },

  {
    id: "sub-taxi-ride-share",
    name: "Taxi & Ride Share",
    categoryId: "expense-transportation",
    icon: "🚕",
    createdAt: "2026-08-12T10:06:00Z",
    updatedAt: "2026-08-12T10:06:00Z",
  },

  {
    id: "sub-parking",
    name: "Parking",
    categoryId: "expense-transportation",
    icon: "🅿️",
    createdAt: "2026-08-12T10:07:00Z",
    updatedAt: "2026-08-12T10:07:00Z",
  },

  // =========================================
  // HOUSING
  // =========================================

  {
    id: "sub-rent",
    name: "Rent",
    categoryId: "expense-housing",
    icon: "🏠",
    createdAt: "2026-08-12T10:08:00Z",
    updatedAt: "2026-08-12T10:08:00Z",
  },

  {
    id: "sub-maintenance",
    name: "Maintenance",
    categoryId: "expense-housing",
    icon: "🔧",
    createdAt: "2026-08-12T10:09:00Z",
    updatedAt: "2026-08-12T10:09:00Z",
  },

  {
    id: "sub-repairs",
    name: "Repairs",
    categoryId: "expense-housing",
    icon: "🛠️",
    createdAt: "2026-08-12T10:10:00Z",
    updatedAt: "2026-08-12T10:10:00Z",
  },

  {
    id: "sub-home-supplies",
    name: "Home Supplies",
    categoryId: "expense-housing",
    icon: "🧹",
    createdAt: "2026-08-12T10:11:00Z",
    updatedAt: "2026-08-12T10:11:00Z",
  },

  // =========================================
  // SHOPPING
  // =========================================

  {
    id: "sub-clothing",
    name: "Clothing",
    categoryId: "expense-shopping",
    icon: "👕",
    createdAt: "2026-08-12T10:12:00Z",
    updatedAt: "2026-08-12T10:12:00Z",
  },

  {
    id: "sub-electronics",
    name: "Electronics",
    categoryId: "expense-shopping",
    icon: "💻",
    createdAt: "2026-08-12T10:13:00Z",
    updatedAt: "2026-08-12T10:13:00Z",
  },

  {
    id: "sub-accessories",
    name: "Accessories",
    categoryId: "expense-shopping",
    icon: "🎧",
    createdAt: "2026-08-12T10:14:00Z",
    updatedAt: "2026-08-12T10:14:00Z",
  },

  // =========================================
  // HEALTH & MEDICAL
  // =========================================

  {
    id: "sub-doctor",
    name: "Doctor",
    categoryId: "expense-health-medical",
    icon: "🩺",
    createdAt: "2026-08-12T10:15:00Z",
    updatedAt: "2026-08-12T10:15:00Z",
  },

  {
    id: "sub-medicines",
    name: "Medicines",
    categoryId: "expense-health-medical",
    icon: "💊",
    createdAt: "2026-08-12T10:16:00Z",
    updatedAt: "2026-08-12T10:16:00Z",
  },

  {
    id: "sub-pharmacy",
    name: "Pharmacy",
    categoryId: "expense-health-medical",
    icon: "💳",
    createdAt: "2026-08-12T10:17:00Z",
    updatedAt: "2026-08-12T10:17:00Z",
  },

  // =========================================
  // ENTERTAINMENT
  // =========================================

  {
    id: "sub-movies",
    name: "Movies",
    categoryId: "expense-entertainment",
    icon: "🎬",
    createdAt: "2026-08-12T10:18:00Z",
    updatedAt: "2026-08-12T10:18:00Z",
  },

  {
    id: "sub-games",
    name: "Games",
    categoryId: "expense-entertainment",
    icon: "🎮",
    createdAt: "2026-08-12T10:19:00Z",
    updatedAt: "2026-08-12T10:19:00Z",
  },

  {
    id: "sub-hobbies",
    name: "Hobbies",
    categoryId: "expense-entertainment",
    icon: "🎨",
    createdAt: "2026-08-12T10:20:00Z",
    updatedAt: "2026-08-12T10:20:00Z",
  },

  // =========================================
  // SALARY
  // =========================================

  {
    id: "sub-basic-salary",
    name: "Basic Salary",
    categoryId: "income-salary",
    icon: "💼",
    createdAt: "2026-08-12T10:21:00Z",
    updatedAt: "2026-08-12T10:21:00Z",
  },

  {
    id: "sub-bonus",
    name: "Bonus",
    categoryId: "income-salary",
    icon: "🎁",
    createdAt: "2026-08-12T10:22:00Z",
    updatedAt: "2026-08-12T10:22:00Z",
  },

  {
    id: "sub-overtime",
    name: "Overtime",
    categoryId: "income-salary",
    icon: "⏰",
    createdAt: "2026-08-12T10:23:00Z",
    updatedAt: "2026-08-12T10:23:00Z",
  },

  // =========================================
  // FREELANCE
  // =========================================

  {
    id: "sub-freelance-work",
    name: "Freelance Work",
    categoryId: "income-freelance",
    icon: "💻",
    createdAt: "2026-08-12T10:24:00Z",
    updatedAt: "2026-08-12T10:24:00Z",
  },

  {
    id: "sub-consulting",
    name: "Consulting",
    categoryId: "income-freelance",
    icon: "💼",
    createdAt: "2026-08-12T10:25:00Z",
    updatedAt: "2026-08-12T10:25:00Z",
  },

  // =========================================
  // BUSINESS
  // =========================================

  {
    id: "sub-sales",
    name: "Sales",
    categoryId: "income-business",
    icon: "📈",
    createdAt: "2026-08-12T10:26:00Z",
    updatedAt: "2026-08-12T10:26:00Z",
  },

  {
    id: "sub-services",
    name: "Services",
    categoryId: "income-business",
    icon: "💼",
    createdAt: "2026-08-12T10:27:00Z",
    updatedAt: "2026-08-12T10:27:00Z",
  },

  // =========================================
  // INVESTMENTS
  // =========================================

  {
    id: "sub-dividends",
    name: "Dividends",
    categoryId: "income-investments",
    icon: "💰",
    createdAt: "2026-08-12T10:28:00Z",
    updatedAt: "2026-08-12T10:28:00Z",
  },

  {
    id: "sub-capital-gains",
    name: "Capital Gains",
    categoryId: "income-investments",
    icon: "📈",
    createdAt: "2026-08-12T10:29:00Z",
    updatedAt: "2026-08-12T10:29:00Z",
  },

  // =========================================
  // OTHER INCOME
  // =========================================

  {
    id: "sub-miscellaneous",
    name: "Miscellaneous",
    categoryId: "income-other",
    icon: "📦",
    createdAt: "2026-08-12T10:30:00Z",
    updatedAt: "2026-08-12T10:30:00Z",
  },
];