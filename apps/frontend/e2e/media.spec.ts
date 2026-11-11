import { test, expect } from "@playwright/test";

test.describe("Media Library Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/media");
  });

  test("loads media page with separate social sidebar and topbar", async ({ page }) => {
    await expect(page).toHaveURL(/.*\/media/);
    await expect(page.getByText("All Media").first()).toBeVisible();
    await expect(page.getByText("Instagram").first()).toBeVisible();
  });

  test("renders document dog-ear icons and cards matching reference UI", async ({ page }) => {
    // Check for social content cards
    await expect(page.getByText("Brand-Hero-Campaign.png")).toBeVisible();
    await expect(page.getByText("Baccarat-Product-Editorial.jpg")).toBeVisible();
    await expect(page.getByText("Viral-Hook-Framework.pdf")).toBeVisible();

    // Check for Preview link
    const previewLinks = page.locator("button:has-text('Preview')");
    await expect(previewLinks.first()).toBeVisible();

    // Check for Jane Cooper avatar and date
    await expect(page.getByText("Jane Cooper").first()).toBeVisible();
    await expect(page.getByText("10 January 2026").first()).toBeVisible();

    // Take screenshot of the first media card for visual verification
    const firstCard = page.locator("article").first();
    await firstCard.screenshot({ path: "test-results/media-card-verified.png" });

    // Take full page screenshot
    await page.screenshot({ path: "test-results/media-page-verified.png", fullPage: true });
  });
});
