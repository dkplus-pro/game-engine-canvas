import { expect, test, type Page } from "@playwright/test";

function collectPageErrors(page: Page): string[] {
  const errors: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => {
    errors.push(error.message);
  });

  return errors;
}

test.describe("billiards app", () => {
  test("starts fullscreen canvas gameplay and toggles pause without browser errors", async ({ page }) => {
    const errors = collectPageErrors(page);

    await page.goto("/");

    await expect(page.getByRole("main", { name: "霓虹桌球全屏游戏" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "霓虹桌球" })).toBeVisible();
    await expect(page.getByLabel("桌球 Canvas")).toBeVisible();
    await expect(page.locator("body")).toHaveCSS("overflow", "hidden");

    await page.getByRole("button", { name: "开始开球" }).click();
    await expect(page.getByText("READY")).toBeVisible();
    await page.getByRole("button", { name: "强击" }).click();
    await expect(page.getByText("ROLLING")).toBeVisible();

    await page.keyboard.press("KeyP");
    await expect(page.getByText("PAUSED")).toBeVisible();
    await page.keyboard.press("KeyP");
    await expect(page.getByText(/ROLLING|READY/)).toBeVisible();

    expect(errors).toEqual([]);
  });

  test("keeps controls touch-friendly on mobile viewport", async ({ page }) => {
    const errors = collectPageErrors(page);
    await page.setViewportSize({ width: 390, height: 844 });

    await page.goto("/");

    const startButton = page.getByRole("button", { name: "开始开球" });
    await expect(startButton).toBeVisible();
    await startButton.focus();
    await expect(startButton).toBeFocused();

    const startBox = await startButton.boundingBox();
    expect(startBox?.height).toBeGreaterThanOrEqual(44);
    expect(startBox?.width).toBeGreaterThanOrEqual(44);

    await startButton.click();
    for (const name of ["向左瞄准", "向右瞄准", "轻击", "中击", "强击"]) {
      const control = page.getByRole("button", { name });
      await expect(control).toBeVisible();
      const box = await control.boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(44);
      expect(box?.width).toBeGreaterThanOrEqual(44);
    }

    expect(errors).toEqual([]);
  });
});
