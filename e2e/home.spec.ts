import { test, expect } from "@playwright/test";

test("トップページが正しく表示されること", async ({ page }) => {
  await page.goto("/");

  // タイトルが正しく表示されることを確認
  await expect(page).toHaveTitle(/Online Shop/);

  // ヘッダーが表示されることを確認
  const header = page.getByRole("banner");
  await expect(header).toBeVisible();
});
