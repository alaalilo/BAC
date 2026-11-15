import { test, expect } from "@playwright/test";

test("choose stream first, complete onboarding and navigate", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /علوم تجريبية/ }).click();
  await page.getByRole("button", { name: "تابع" }).click();
  await page.getByPlaceholder("اسمك أو لقبك").fill("طالب تجريبي");
  await page.getByRole("button", { name: "تابع" }).click();
  await page.getByRole("button", { name: "ابدأ المراجعة" }).click();
  await expect(page.getByRole("heading", { name: /طالب تجريبي/ })).toBeVisible();
  await page.getByRole("button", { name: "موادي" }).first().click();
  await expect(page.getByRole("heading", { name: "موادي" })).toBeVisible();
});
