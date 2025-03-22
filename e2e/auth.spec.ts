import { test, expect, Page } from "@playwright/test";
import { faker } from "@faker-js/faker/locale/ja";

import { login } from "./helper";

test("ユーザーがログインできること", async ({ page }) => {
  await login(page, "test@example.com", "password123");

  await page.waitForTimeout(4000);
  await page.getByRole("button", { name: "User menu" }).click();
  await expect(page.getByText("test@example.com")).toBeVisible();
});

test("管理者でログインできること", async ({ page }) => {
  await login(page, "admin@example.com", "admin123");

  await page.waitForTimeout(4000);
  await page.getByRole("button", { name: "User menu" }).click();
  await expect(page.getByText("admin@example.com")).toBeVisible();
});

test("ログアウトできること", async ({ page }) => {
  await login(page, "test@example.com", "password123");
  await page.getByRole("button", { name: "User menu" }).click();
  await page.getByRole("menuitem", { name: "サインアウト" }).click();
  await page.waitForTimeout(4000);
  await expect(page.url()).toBe("http://localhost:3010/sign-in");
});

test("ユーザが新規登録できること", async ({ page }) => {
  await page.goto("/sign-up");

  const email = faker.internet.email();
  const password = faker.internet.password({
    length: 12,
    memorable: true,
    pattern: /[A-Za-z0-9!@#$%^&*]/,
    prefix: "A1!",
  });
  const name = faker.person.fullName();

  await page.getByRole("textbox", { name: "お名前" }).fill(name);
  await page
    .getByRole("textbox", {
      name: "メールアドレス",
    })
    .fill(email);

  await page
    .getByRole("textbox", {
      name: "パスワード",
    })
    .fill(password);
  await page.getByRole("button", { name: "アカウント作成" }).click();

  await page.waitForTimeout(4000);
  await page.getByRole("button", { name: "User menu" }).click();
  await expect(page.getByText(email)).toBeVisible();
});
