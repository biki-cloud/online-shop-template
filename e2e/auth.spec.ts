import { test, expect, Page } from "@playwright/test";

async function login(page: Page, email: string, password: string) {
  await page.goto("/sign-in");

  const mail_textbox = await page.getByRole("textbox", {
    name: "メールアドレス",
  });
  await mail_textbox.fill(email);

  const password_textbox = await page.getByRole("textbox", {
    name: "パスワード",
  });
  await password_textbox.fill(password);

  const submit_button = await page
    .locator("form")
    .getByRole("button", { name: "サインイン" });
  await submit_button.click();
}

test("ユーザー権限でログインできること", async ({ page }) => {
  await login(page, "test@example.com", "password123");

  await page.getByRole("button", { name: "User menu" }).click();
  await page.waitForTimeout(4000);
  await expect(page.getByText("test@example.com")).toBeVisible();
});

test("管理者権限でログインできること", async ({ page }) => {
  await page.screenshot({ path: "test-results/auth_before-sign-in.png" });
  await login(page, "admin@example.com", "admin123");
  await page.screenshot({ path: "test-results/auth_after-sign-in.png" });

  await page.getByRole("button", { name: "User menu" }).click();
  await expect(page.getByText("admin@example.com")).toBeVisible();
});
