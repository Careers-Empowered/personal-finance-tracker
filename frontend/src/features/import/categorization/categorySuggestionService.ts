import { suggestCategoryByRules } from "./ruleCategorizationService";

import {
  CategorySuggestionService as SLMCategorySuggestionService,
} from "../slm/slmService";

import { QwenProvider } from "../slm/qwenProvider";

import type {
  CategorySuggestion,
  TransactionType,
} from "./types";

const qwenProvider = new QwenProvider();

const slmService =
  new SLMCategorySuggestionService(
    qwenProvider
  );

export async function suggestCategory(
  description: string,
  type: TransactionType,
): Promise<CategorySuggestion | null> {

  // --------------------------------
  // STEP 1: Rule engine
  // --------------------------------

  const ruleSuggestion =
    suggestCategoryByRules(
      description,
      type,
    );

  if (ruleSuggestion) {
    console.log(
      "Category found by rule engine:",
      ruleSuggestion
    );

    return ruleSuggestion;
  }

  // --------------------------------
  // STEP 2: SLM fallback
  // --------------------------------

  console.log(
    "No rule matched. Using SLM:",
    description
  );

  const slmCategory =
    await slmService.suggestCategory(
      description
    );

  if (!slmCategory) {
    return null;
  }

  return {
    category: slmCategory,
    source: "SLM",
    confidence: 0.8,
  };
}