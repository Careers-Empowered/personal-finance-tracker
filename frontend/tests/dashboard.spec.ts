import { test, expect } from "@playwright/test";

test.describe("Dashboard E2E", () => {
  test("authenticated user can access the dashboard", async ({ page }) => {
    // Open dashboard directly
    await page.goto("/dashboard");

    // Verify login form is visible
    await expect(
      page.locator("form").getByRole("button", { name: "Log In" }),
    ).toBeVisible();

    // Enter credentials
    await page.locator("#auth-email").fill("hari@gmail.com");

    await page.locator("#auth-password").fill("Tacbot@2004");

    // Submit login form
    await page
      .locator("form")
      .getByRole("button", { name: "Log In" })
      .click();

    // Verify redirect
    await expect(page).toHaveURL(/.*dashboard/);

    // Verify dashboard loaded
    await expect(
      page.getByRole("heading", { name: "Dashboard" }),
    ).toBeVisible();
  });
});

test("should load dashboard data after login", async ({ page }) => {
  await page.goto("/dashboard");

  // Login
  await page.locator("#auth-email").fill("hari@gmail.com");
  await page.locator("#auth-password").fill("Tacbot@2004");

  await page
    .locator("form")
    .getByRole("button", { name: "Log In" })
    .click();

  // Wait for dashboard
  await expect(page).toHaveURL(/.*dashboard/);

  // Verify dashboard loaded
  await expect(
    page.getByRole("heading", { name: "Dashboard" }),
  ).toBeVisible();

  // Verify account selector is loaded
await expect(
  page.getByRole("combobox", { name: "Account" }),
).toBeVisible();

await expect(
  page.getByRole("combobox", { name: "Account" }),
).toHaveValue("all");

  // Verify Monthly Summary section exists
  await expect(
    page.getByText("Monthly Summary"),
  ).toBeVisible();
});

test("should allow selecting a specific account", async ({ page }) => {
  // Open dashboard and login
  await page.goto("/dashboard");

  await page.locator("#auth-email").fill("hari@gmail.com");
  await page.locator("#auth-password").fill("Tacbot@2004");

  await page
    .locator("form")
    .getByRole("button", { name: "Log In" })
    .click();

  // Wait for dashboard
  await expect(page).toHaveURL(/.*dashboard/);

  const accountSelector = page.getByRole("combobox", {
    name: "Account",
  });

  // Verify default selection
  await expect(accountSelector).toHaveValue("all");

  // Select SBI
  await accountSelector.selectOption({
    label: "SBI",
  });

  // Verify SBI is selected
  await expect(accountSelector).toHaveValue(
    await accountSelector.locator("option", { hasText: "SBI" }).getAttribute("value") ?? "",
  );
});

test("should filter dashboard by date range", async ({ page }) => {
  // Open dashboard
  await page.goto("/dashboard");

  // Login
  await page.locator("#auth-email").fill("hari@gmail.com");
  await page.locator("#auth-password").fill("Tacbot@2004");

  await page
    .locator("form")
    .getByRole("button", { name: "Log In" })
    .click();

  // Wait for dashboard
  await expect(page).toHaveURL(/.*dashboard/);

  // Open date range picker
  await page
    .getByRole("button", { name: /Date range/ })
    .click();

  // Fill start date
  const startDate = page.getByLabel("Start date");
  await startDate.fill("2026-08-01");

  // Fill end date
  const endDate = page.getByLabel("End date");
  await endDate.fill("2026-08-31");

  // Apply filter
  await page
    .getByRole("button", { name: "Apply" })
    .click();

  // Verify selected date range is displayed
  await expect(
    page.getByRole("button", {
      name: "2026-08-01 to 2026-08-31",
    }),
  ).toBeVisible();

  // Verify period summary is shown
  await expect(
    page.getByRole("heading", { name: "Period summary" }),
  ).toBeVisible();
});

test("should clear the applied date range", async ({ page }) => {
  await page.goto("/dashboard");

  // Login
  await page.locator("#auth-email").fill("hari@gmail.com");
  await page.locator("#auth-password").fill("Tacbot@2004");

  await page
    .locator("form")
    .getByRole("button", { name: "Log In" })
    .click();

  await expect(page).toHaveURL(/.*dashboard/);

  // Open date picker
  const dateButton = page.getByRole("button", {
    name: /Date range/,
  });

  await dateButton.click();

  // Select date range
  await page.getByLabel("Start date").fill("2026-08-01");
  await page.getByLabel("End date").fill("2026-08-31");

  await page.getByRole("button", { name: "Apply" }).click();

  // Verify date range was applied
  await expect(
    page.getByRole("button", {
      name: "2026-08-01 to 2026-08-31",
    }),
  ).toBeVisible();

  // Open date picker again
  await page
    .getByRole("button", {
      name: "2026-08-01 to 2026-08-31",
    })
    .click();

  // Clear the date range
  await page.getByRole("button", { name: "Clear" }).click();

  // Verify it returned to default state
  await expect(
    page.getByRole("button", { name: /Date range/ }),
  ).toBeVisible();

  // Verify default dashboard view is restored
  await expect(
    page.getByRole("heading", { name: "Monthly Summary" }),
  ).toBeVisible();
});

test("should display transactions when selecting a date with activity", async ({
  page,
}) => {
  // Open dashboard
  await page.goto("/dashboard");

  // Login
  await page.locator("#auth-email").fill("hari@gmail.com");
  await page.locator("#auth-password").fill("Tacbot@2004");

  await page
    .locator("form")
    .getByRole("button", { name: "Log In" })
    .click();

  // Wait for dashboard
  await expect(page).toHaveURL(/.*dashboard/);

  // Verify Daily Activity section
  await expect(
    page.getByRole("heading", { name: "Daily activity" }),
  ).toBeVisible();

  // Click August 20, 2026
  // Click August 27, which has activity and is not selected by default
const activityDate = page.getByRole("gridcell", {
  name: /2026-08-27/,
});

await activityDate.click();

// Verify transaction details panel appears
await expect(
  page.getByRole("heading", {
    name: "Thursday, August 27",
  }),
).toBeVisible();
// Verify the selected day's transaction is displayed
const transactionPanel = page.getByRole("complementary");

await expect(
  transactionPanel.getByText("sample"),
).toBeVisible();
});