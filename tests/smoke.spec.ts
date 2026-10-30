import { test, expect } from "@playwright/test";

test.describe("SkillPulse LMS Core End-to-End User Flow", () => {
  test("smoke test: login -> browse catalog -> view external course details", async ({
    page,
  }) => {
    // 1. Visit homepage
    await page.goto("/");
    await expect(page).toHaveTitle(/SkillPulse/);

    // 2. Navigate to login
    await page.goto("/auth/login");
    await expect(page.locator("h1")).toContainText(/Sign In/);

    // 3. Fill in student credentials
    await page.fill('input[type="email"]', "student1@example.com");
    await page.fill('input[type="password"]', "StudentPass123!");
    await page.click('button[type="submit"]');

    // 4. Should redirect to dashboard or home
    await page.waitForURL(/\/(dashboard|courses)?/);

    // 5. Browse courses catalog
    await page.goto("/courses");
    await expect(page.locator("h1")).toContainText(/Explore Masterclasses/);

    // 6. Filter by external courses
    await page.click("text=External Courses");
    await page.waitForURL(/type=EXTERNAL/);

    // 7. Verify course cards render external badge
    const externalBadge = page.locator("text=External").first();
    await expect(externalBadge).toBeVisible();
  });
});
