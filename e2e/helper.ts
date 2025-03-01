import { test, expect, Page } from "@playwright/test";

export async function login(page: Page, email: string, password: string) {
  await page.goto("/sign-in");

  await expect(
    page.getByRole("textbox", {
      name: "メールアドレス",
    })
  ).toBeVisible();
  await page
    .getByRole("textbox", {
      name: "メールアドレス",
    })
    .fill(email);

  await expect(
    page.getByRole("textbox", {
      name: "パスワード",
    })
  ).toBeVisible();
  await page
    .getByRole("textbox", {
      name: "パスワード",
    })
    .fill(password);

  await expect(
    page.locator("form").getByRole("button", { name: "サインイン" })
  ).toBeVisible();
  await page
    .locator("form")
    .getByRole("button", { name: "サインイン" })
    .click();
  await page.getByRole("button", { name: "User menu" }).click();
  await expect(page.getByText(email)).toBeVisible();
  await page.goto("/home");
}
