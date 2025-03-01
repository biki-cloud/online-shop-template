import { test, expect, Page } from "@playwright/test";

test("ユーザー権限でログインできること", async ({ page }) => {
  await page.goto("/sign-in");
  const mail_textbox = await page.getByRole("textbox", {
    name: "メールアドレス",
  });
  await mail_textbox.click();
  await mail_textbox.fill("test@example.com");
  const password_textbox = await page.getByRole("textbox", {
    name: "パスワード",
  });
  await password_textbox.click();
  await password_textbox.fill("password123");

  const submit_button = await page
    .locator("form")
    .getByRole("button", { name: "サインイン" });
  await submit_button.click();

  await page.getByRole("button", { name: "User menu" }).click();
  await page.waitForTimeout(4000);
  await expect(page.getByText("test@example.com")).toBeVisible();
});

test("管理者権限でログインできること", async ({ page }) => {
  await page.goto("/sign-in");
  await page.screenshot({ path: "test-results/auth_before-sign-in.png" });

  const mail_textbox = await page.getByRole("textbox", {
    name: "メールアドレス",
  });
  await mail_textbox.click();
  await mail_textbox.fill("admin@example.com");

  const password_textbox = await page.getByRole("textbox", {
    name: "パスワード",
  });
  await password_textbox.click();
  await password_textbox.fill("admin123");

  const submit_button = await page
    .locator("form")
    .getByRole("button", { name: "サインイン" });
  await submit_button.click();

  await page.waitForTimeout(4000);
  await page.screenshot({ path: "test-results/auth_after-sign-in.png" });
  await page.getByRole("button", { name: "User menu" }).click();
  await expect(page.getByText("admin@example.com")).toBeVisible();
});
