import { expect, test } from "@playwright/test";

test("dashboard renders the core Entix.app operating view", async ({ page }) => {
  await page.goto("/dashboard");

  await expect(page.getByRole("heading", { name: "لوحة التحكم" })).toBeVisible();
  await expect(page.getByText("صحة الكيان")).toBeVisible();
  await expect(page.getByText("ربط Entix Books")).toBeVisible();
});

test("health endpoint reports database and auth readiness", async ({ request }) => {
  const response = await request.get("/api/health");

  expect(response.ok()).toBeTruthy();
  const body = await response.json();

  expect(body.app.database).toBe("entix_app_core");
  expect(body.auth.provider).toBe("better-auth/google");
});
