import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  workers: 1,
  timeout: 30_000,
  expect: {
    timeout: 5_000
  },
  use: {
    baseURL: process.env.TANK_BATTLE_BASE_URL ?? "http://127.0.0.1:3100",
    trace: "retain-on-failure"
  },
  webServer: process.env.TANK_BATTLE_SKIP_WEBSERVER
    ? undefined
    : {
        command: "pnpm --filter @game-engine-canvas/tank-battle exec next dev --hostname 127.0.0.1 --port 3100",
        url: "http://127.0.0.1:3100",
        reuseExistingServer: !process.env.CI,
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
