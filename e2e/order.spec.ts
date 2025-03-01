// 商品を購入できるかのテスト
import { test, expect } from "@playwright/test";
import { login } from "./helper";

test.skip("ログインあり & ユーザーが商品を購入できること", async ({ page }) => {
  await login(page, "test@example.com", "password123");

  await page.goto("/products");
  await page.waitForURL("/products");

  await expect(
    page.getByRole("button", { name: "Products", exact: true })
  ).toBeVisible();
  await page.getByRole("button", { name: "Products", exact: true }).click();

  await expect(
    page.getByRole("link", {
      name: "クラシック ホワイト Tシャツ クラシック ホワイト T",
    })
  ).toBeVisible();
  await page
    .getByRole("link", {
      name: "クラシック ホワイト Tシャツ クラシック ホワイト T",
    })
    .click();
  await expect(
    page.getByRole("button", { name: "カートに追加" })
  ).toBeVisible();
  await page.getByRole("button", { name: "カートに追加" }).click();
  await page.waitForURL("/cart");
  await expect(page.getByRole("button", { name: "レジに進む" })).toBeVisible();
  await page.getByRole("button", { name: "レジに進む" }).click();
  await page.waitForURL("/checkout");
  await expect(
    page.getByRole("button", { name: "注文を確定する" })
  ).toBeVisible();
  await page.getByRole("button", { name: "注文を確定する" }).click();
  //   await page.waitForURL("https://checkout.stripe.com/*");

  // stripe購入画面
  await page.waitForSelector('input[name="email"]');
  await page.fill('input[name="email"]', "fff@fff.com");

  await page.waitForSelector('input[name="cardNumber"]');
  await page.fill('input[name="cardNumber"]', "4242 4242 4242 4242");

  await page.waitForSelector('input[name="cardExpiry"]');
  await page.fill('input[name="cardExpiry"]', "12 / 29");

  await page.waitForSelector('input[name="cardCvc"]');
  await page.fill('input[name="cardCvc"]', "333");

  await page.waitForSelector('input[name="billingName"]');
  await page.fill('input[name="billingName"]', "eeee");

  await expect(page.getByTestId("hosted-payment-submit-button")).toBeVisible();
  await page.getByTestId("hosted-payment-submit-button").click();
  await page.waitForTimeout(10000);
  //   await page.waitForURL("*/orders/*");
  await expect(page.getByText("注文詳細")).toBeVisible();
});
