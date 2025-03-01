// 商品を購入できるかのテスト
import { test, expect } from "@playwright/test";
import { login } from "./helper";
import exp from "constants";

test("ログインあり & ユーザーが商品を購入できること", async ({ page }) => {
  login(page, "test@example.com", "password123");

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
  await expect(page.getByRole("button", { name: "レジに進む" })).toBeVisible();
  await page.getByRole("button", { name: "レジに進む" }).click();
  await expect(page.getByRole("button", { name: "次へ進む" })).toBeVisible();
  await page.getByRole("button", { name: "注文を確定する" }).click();

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

  await page.getByTestId("hosted-payment-submit-button").click();
  await page.waitForTimeout(5000);
  //   await expect(page.url()).toBe("http://localhost:3000/orders/5");
  //   await page.goto("http://localhost:3000/orders/5");
  await expect(page.getByText("注文詳細")).toBeVisible();
});
