import { expect, test, type Page } from "@playwright/test";

function collectPageErrors(page: Page): string[] {
  const errors: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(message.text());
    }
  });
  page.on("pageerror", (error) => {
    errors.push(error.message);
  });

  return errors;
}

test.describe("tank battle app", () => {
  test("starts fullscreen canvas gameplay and toggles pause without browser errors", async ({ page }) => {
    const errors = collectPageErrors(page);

    await page.goto("/");

    await expect(page.getByRole("main", { name: "坦克大战全屏游戏" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "坦克大战 90" })).toBeVisible();
    await expect(page.getByLabel("坦克大战 Canvas")).toBeVisible();
    await expect(page.locator("body")).toHaveCSS("overflow", "hidden");

    await page.getByRole("button", { name: "2. 河道伏击" }).click();
    await page.getByRole("button", { name: "开始战斗" }).click();
    await expect(page.getByText("PLAYING")).toBeVisible();
    await expect(page.getByText("2", { exact: true }).first()).toBeVisible();

    await page.keyboard.press("KeyP");
    await expect(page.getByText("PAUSED")).toBeVisible();
    await page.keyboard.press("KeyP");
    await expect(page.getByText("PLAYING")).toBeVisible();

    expect(errors).toEqual([]);
  });

  test("keeps controls touch-friendly on mobile viewport", async ({ page }) => {
    const errors = collectPageErrors(page);
    await page.setViewportSize({ width: 390, height: 844 });

    await page.goto("/");

    const startButton = page.getByRole("button", { name: "开始战斗" });
    await expect(startButton).toBeVisible();
    await startButton.focus();
    await expect(startButton).toBeFocused();

    const startBox = await startButton.boundingBox();
    expect(startBox?.height).toBeGreaterThanOrEqual(44);
    expect(startBox?.width).toBeGreaterThanOrEqual(44);

    await startButton.click();
    for (const label of ["上", "左", "下", "右", "开火"]) {
      const control = page.getByRole("button", { name: label });
      await expect(control).toBeVisible();
      const box = await control.boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(44);
      expect(box?.width).toBeGreaterThanOrEqual(44);
    }

    expect(errors).toEqual([]);
  });
});
