// カート機能のテスト
import { test, expect } from "@playwright/test";
import { login } from "./helper";

test("カートに商品を追加できること", async ({ page }) => {
  await login(page, "test@example.com", "password123");

  // 商品一覧ページに移動
  await page.goto("/products");
  await page.waitForURL("/products");

  // 商品詳細ページに移動
  expect(
    page.getByRole("link", {
      name: "クラシック ホワイト Tシャツ クラシック ホワイト T",
    })
  ).toBeVisible();
  await page
    .getByRole("link", {
      name: "クラシック ホワイト Tシャツ クラシック ホワイト T",
    })
    .click();
  await page.getByRole("button", { name: "カートに追加" }).click();
  await page.waitForURL("/cart");

  await expect(
    page.getByRole("heading", { name: "クラシック ホワイト Tシャツ" })
  ).toBeVisible();
});

test.skip("カートに２つの商品を追加できること", async ({ page }) => {
  await login(page, "test@example.com", "password123");

  // 商品一覧ページに移動
  await page.goto("/products");
  await page.waitForURL("/products");

  // 商品詳細ページに移動
  expect(
    page.getByRole("link", {
      name: "クラシック ホワイト Tシャツ クラシック ホワイト T",
    })
  ).toBeVisible();
  await page
    .getByRole("link", {
      name: "クラシック ホワイト Tシャツ クラシック ホワイト T",
    })
    .click();
  await page.getByRole("button", { name: "カートに追加" }).click();
  await page.waitForURL("/cart");

  // 商品一覧ページに移動
  await page.goto("/products");
  await page.waitForURL("/products");

  // 商品詳細ページに移動
  expect(
    page.getByRole("link", {
      name: "デニムジャケット - ヴィンテージウォッシュ",
    })
  ).toBeVisible();
  await page
    .getByRole("link", {
      name: "デニムジャケット - ヴィンテージウォッシュ",
    })
    .click();
  await page.getByRole("button", { name: "カートに追加" }).click();
  await page.waitForURL("/cart");

  await expect(
    page.getByRole("heading", { name: "クラシック ホワイト Tシャツ" })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "デニムジャケット - ヴィンテージウォッシュ",
    })
  ).toBeVisible();
});
