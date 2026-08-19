const BASE_URL = "http://localhost:3000";

type MatchResponse = {
  data: {
    categoryId: string;
    categoryName: string;
    subcategoryId: string | null;
    subcategoryName: string | null;
    confidence: number;
  };
};

async function match(description: string, type: "EXPENSE" | "INCOME") {
  const response = await fetch(
    `${BASE_URL}/api/category-matcher/match`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        description,
        type,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      `API failed: ${response.status} ${response.statusText}`,
    );
  }

  return (await response.json()) as MatchResponse;
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`❌ ${message}`);
  }
}

async function runTest(
  description: string,
  type: "EXPENSE" | "INCOME",
  expectedCategory: string,
  expectedSubcategory?: string,
) {
  const result = await match(description, type);
  const data = result.data;

  assert(
    data.categoryName === expectedCategory,
    `${description}: expected category "${expectedCategory}", got "${data.categoryName}"`,
  );

  if (expectedSubcategory) {
    assert(
      data.subcategoryName === expectedSubcategory,
      `${description}: expected subcategory "${expectedSubcategory}", got "${data.subcategoryName}"`,
    );
  }

  assert(
    data.confidence > 0,
    `${description}: confidence should be greater than 0`,
  );

  console.log(
    `✅ ${description} → ${data.categoryName}${
      data.subcategoryName ? ` → ${data.subcategoryName}` : ""
    } (confidence: ${data.confidence})`,
  );
}

async function main() {
  console.log("\n🚀 Category Matcher E2E Tests\n");

  await runTest(
    "junk food",
    "EXPENSE",
    "Food & Dining",
    "Fast Food",
  );

  await runTest(
    "petrol",
    "EXPENSE",
    "Transport",
  );

  await runTest(
    "Netflix subscription",
    "EXPENSE",
    "Entertainment",
  );

  await runTest(
    "salary credited",
    "INCOME",
    "Salary",
    "Basic Salary",
  );

  await runTest(
    "buying groceries",
    "EXPENSE",
    "Food & Dining",
  );

  await runTest(
    "bought a new laptop",
    "EXPENSE",
    "Shopping",
  );

  console.log("\n🎉 All Category Matcher E2E tests passed!\n");
}

main().catch((error) => {
  console.error("\n❌ E2E test failed\n");
  console.error(error);
  process.exit(1);
});