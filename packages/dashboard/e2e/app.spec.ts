import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("loads with user tab by default", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "User Settings" })).toBeVisible();
  });

  test("preserves tab in URL on refresh", async ({ page }) => {
    await page.goto("/?tab=mcp");
    await expect(page.getByRole("heading", { name: "MCP Servers" })).toBeVisible();

    await page.reload();
    await expect(page.getByRole("heading", { name: "MCP Servers" })).toBeVisible();
    expect(page.url()).toContain("tab=mcp");
  });

  test("switches tabs via sidebar", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: /navigate to project/i }).click();
    await expect(page.getByRole("heading", { name: "Project Settings" })).toBeVisible();
    expect(page.url()).toContain("tab=project");

    await page.getByRole("button", { name: /navigate to issues/i }).click();
    await expect(page.getByRole("heading", { name: "Issues" })).toBeVisible();
    expect(page.url()).toContain("tab=issues");
  });

  test("switches tabs via keyboard 1-5", async ({ page }) => {
    await page.goto("/");

    await page.keyboard.press("2");
    await expect(page.getByRole("heading", { name: "Project Settings" })).toBeVisible();

    await page.keyboard.press("3");
    await expect(page.getByRole("heading", { name: "Issues" })).toBeVisible();

    await page.keyboard.press("4");
    await expect(page.getByRole("heading", { name: "MCP Servers" })).toBeVisible();

    await page.keyboard.press("5");
    await expect(page.getByRole("heading", { name: "Stats" })).toBeVisible();

    await page.keyboard.press("1");
    await expect(page.getByRole("heading", { name: "User Settings" })).toBeVisible();
  });
});
