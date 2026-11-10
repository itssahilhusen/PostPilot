import { test, expect } from "@playwright/test";

test.describe("Workflow Studio Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/workflow");
  });

  test("loads workflow page successfully", async ({ page }) => {
    await expect(page).toHaveURL(/.*\/workflow/);
    await expect(page.locator("input[placeholder='Search nodes...']")).toBeVisible();
  });

  test("filters node templates when searching", async ({ page }) => {
    const searchInput = page.locator("input[placeholder='Search nodes...']");
    await searchInput.fill("Runway");
    await expect(page.getByText("Runway Gen-4.5")).toBeVisible();

    await searchInput.fill("NonExistentNodeName123");
    await expect(page.getByText("Runway Gen-4.5")).not.toBeVisible();
  });

  test("displays sticky action toolbar with credits counter and execute button", async ({ page }) => {
    const runButton = page.locator("button[title*='Execute Pipeline']");
    await expect(runButton).toBeVisible();

    // Verify credits badge is displayed
    const creditsBadge = page.locator("span:has-text('130')");
    await expect(creditsBadge).toBeVisible();
  });

  test("renders curved SVG connecting wires between nodes", async ({ page }) => {
    const svgLayer = page.locator("svg").filter({ has: page.locator("defs") });
    await expect(svgLayer.first()).toBeVisible();

    // Verify SVG paths have non-empty 'd' attributes
    const paths = page.locator("svg path[d^='M']");
    const count = await paths.count();
    expect(count).toBeGreaterThan(0);
  });
});

