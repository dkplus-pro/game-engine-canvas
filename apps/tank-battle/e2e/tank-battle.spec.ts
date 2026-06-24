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

test.describe("tank battle shell", () => {
  test("loads fullscreen canvas and boot menu without browser errors", async ({ page }) => {
    const errors = collectPageErrors(page);

    await page.goto("/");

    await expect(page.getByRole("main", { name: "坦克大战全屏游戏" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "坦克大战 90" })).toBeVisible();
    await expect(page.getByLabel("坦克大战 Canvas")).toBeVisible();
    await expect(page.getByRole("button", { name: /准备进入|加载素材/ })).toBeVisible();
    await expect(page.locator("body")).toHaveCSS("overflow", "hidden");

    expect(errors).toEqual([]);
  });

  test("keeps primary controls reachable on mobile viewport", async ({ page }) => {
    const errors = collectPageErrors(page);
    await page.setViewportSize({ width: 390, height: 844 });

    await page.goto("/");

    const startButton = page.getByRole("button", { name: /准备进入|加载素材/ });
    await expect(startButton).toBeVisible();
    await startButton.focus();
    await expect(startButton).toBeFocused();

    const box = await startButton.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(errors).toEqual([]);
  });
});
