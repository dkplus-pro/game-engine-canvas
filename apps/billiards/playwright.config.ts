import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  workers: 1,
  timeout: 30_000,
  expect: {
    timeout: 5_000
  },
  use: {
    baseURL: process.env.BILLIARDS_BASE_URL ?? "http://127.0.0.1:3200",
    trace: "retain-on-failure"
  },
  webServer: process.env.BILLIARDS_SKIP_WEBSERVER
    ? undefined
    : {
        command: "pnpm --filter @game-engine-canvas/billiards exec next dev --hostname 127.0.0.1 --port 3200",
        url: "http://127.0.0.1:3200",
        reuseExistingServer: false,
        timeout: 120_000
      },
  projects: [
    {
      name: "chromium-desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 720 } }
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 7"] }
    }
  ]
});
