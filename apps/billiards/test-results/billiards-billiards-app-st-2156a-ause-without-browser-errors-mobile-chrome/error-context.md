# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: billiards.spec.ts >> billiards app >> starts fullscreen canvas gameplay and toggles pause without browser errors
- Location: e2e/billiards.spec.ts:19:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('P1')
Expected: visible
Error: strict mode violation: getByText('P1') resolved to 2 elements:
    1) <strong>P1</strong> aka getByRole('strong').filter({ hasText: 'P1' })
    2) <span>P1</span> aka locator('span').filter({ hasText: /^P1$/ })

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('P1')

```

# Page snapshot

```yaml
- generic [active]:
  - main "霓虹桌球全屏游戏" [ref=e1]:
    - generic "霓虹桌球 Canvas" [ref=e2]
    - generic "游戏状态":
      - generic:
        - generic:
          - generic: Turn
          - strong: P1
        - generic:
          - generic: State
          - strong: AIM
        - generic:
          - generic: P1
          - strong: 未定
        - generic:
          - generic: P2
          - strong: 未定
        - generic:
          - generic: Solids
          - strong: "7"
        - generic:
          - generic: Stripes
          - strong: "7"
        - generic:
          - generic: Shots
          - strong: "0"
      - generic "游戏操作" [ref=e3]:
        - button "击球" [ref=e4] [cursor=pointer]
        - button "暂停/继续" [ref=e5] [cursor=pointer]
        - button "重开" [ref=e6] [cursor=pointer]
        - button "全屏" [ref=e7] [cursor=pointer]
    - generic:
      - generic: 拖拽蓄力
    - paragraph: 玩家 1 开球：拖拽蓄力，松手击球
  - button "Open Next.js Dev Tools" [ref=e13] [cursor=pointer]:
    - img [ref=e14]
  - alert [ref=e17]
```

# Test source

```ts
  1  | import { expect, test, type Page } from "@playwright/test";
  2  | 
  3  | function collectPageErrors(page: Page): string[] {
  4  |   const errors: string[] = [];
  5  | 
  6  |   page.on("console", (message) => {
  7  |     if (message.type() === "error") {
  8  |       errors.push(message.text());
  9  |     }
  10 |   });
  11 |   page.on("pageerror", (error) => {
  12 |     errors.push(error.message);
  13 |   });
  14 | 
  15 |   return errors;
  16 | }
  17 | 
  18 | test.describe("billiards app", () => {
  19 |   test("starts fullscreen canvas gameplay and toggles pause without browser errors", async ({ page }) => {
  20 |     const errors = collectPageErrors(page);
  21 | 
  22 |     await page.goto("/");
  23 | 
  24 |     await expect(page.getByRole("main", { name: "霓虹桌球全屏游戏" })).toBeVisible();
  25 |     await expect(page.getByRole("heading", { name: "霓虹桌球" })).toBeVisible();
  26 |     await expect(page.getByLabel("霓虹桌球 Canvas")).toBeVisible();
  27 |     await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
  28 | 
  29 |     await page.getByRole("button", { name: "开始对局" }).click();
  30 |     await expect(page.getByText("AIM")).toBeVisible();
> 31 |     await expect(page.getByText("P1")).toBeVisible();
     |                                        ^ Error: expect(locator).toBeVisible() failed
  32 | 
  33 |     await page.keyboard.press("KeyP");
  34 |     await expect(page.getByText("PAUSED")).toBeVisible();
  35 |     await page.keyboard.press("KeyP");
  36 |     await expect(page.getByText("AIM")).toBeVisible();
  37 | 
  38 |     await page.getByRole("button", { name: "击球" }).click();
  39 |     await expect(page.getByText("ROLLING")).toBeVisible();
  40 | 
  41 |     expect(errors).toEqual([]);
  42 |   });
  43 | 
  44 |   test("keeps controls touch-friendly on mobile viewport", async ({ page }) => {
  45 |     const errors = collectPageErrors(page);
  46 |     await page.setViewportSize({ width: 390, height: 844 });
  47 | 
  48 |     await page.goto("/");
  49 | 
  50 |     const startButton = page.getByRole("button", { name: "开始对局" });
  51 |     await expect(startButton).toBeVisible();
  52 |     await startButton.focus();
  53 |     await expect(startButton).toBeFocused();
  54 | 
  55 |     const startBox = await startButton.boundingBox();
  56 |     expect(startBox?.height).toBeGreaterThanOrEqual(44);
  57 |     expect(startBox?.width).toBeGreaterThanOrEqual(44);
  58 | 
  59 |     await startButton.click();
  60 |     for (const label of ["击球", "暂停/继续", "重开"]) {
  61 |       const control = page.getByRole("button", { name: label });
  62 |       await expect(control).toBeVisible();
  63 |       const box = await control.boundingBox();
  64 |       expect(box?.height).toBeGreaterThanOrEqual(44);
  65 |       expect(box?.width).toBeGreaterThanOrEqual(44);
  66 |     }
  67 | 
  68 |     expect(errors).toEqual([]);
  69 |   });
  70 | });
  71 | 
```