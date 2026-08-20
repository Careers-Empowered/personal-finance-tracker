import { categorizationRules } from "./rules";
import type { CategorySuggestion, TransactionType } from "./types";

export function suggestCategoryByRules(
  description: string,
  type: TransactionType,
): CategorySuggestion | null {
  if (!description?.trim()) {
    return null;
  }

  const normalizedDescription = description.trim().toLowerCase();

  const matchedRule = categorizationRules.find(
    (rule) =>
      rule.type === type &&
      normalizedDescription.includes(rule.keyword.toLowerCase()),
  );

  if (!matchedRule) {
    return null;
  }

  return {
    category: matchedRule.category,
    source: "RULE",
    confidence: 1,
  };
}