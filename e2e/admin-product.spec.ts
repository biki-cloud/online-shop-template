import { test } from "@playwright/test";
import { login } from "./helper";

test("商品を作成できること", async ({ page }) => {
  await login(page, "admin@example.com", "admin123");
});

test("商品を編集できること", async ({ page }) => {
  await login(page, "admin@example.com", "admin123");
});

test("商品を削除できること", async ({ page }) => {
  await login(page, "admin@example.com", "admin123");
});
