import { test, expect } from "@playwright/test";

test("ログインなし & 商品詳細ページが開けること", async ({ page }) => {
  // ページにアクセス
  await page.goto("/home");
  // スクリーンショットを撮る
  // ボタンをクリックする. getByRoleで指定する
  // 要素を取得する際はgetByRole, getByTextを使う
  await page.getByRole("button", { name: "Products" }).click();
  // 2秒待機
  await page.waitForTimeout(1000); // 2秒待機
  await page
    .getByRole("link", {
      name: "クラシック ホワイト Tシャツ クラシック ホワイト T",
    })
    .click();
  await page.waitForTimeout(1000); // 2秒待機

  // 画面に"クラシック ホワイト Tシャツ"が表示されていることを確認
  // アサート
  await expect(page.getByText("クラシック ホワイト Tシャツ")).toBeVisible();
});
