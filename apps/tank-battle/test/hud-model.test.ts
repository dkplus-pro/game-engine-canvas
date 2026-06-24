import { describe, expect, it } from "vitest";
import {
  LEVEL_COUNT,
  createInitialHudState,
  getBaseAlert,
  getCommandHint,
  getStatusLabel,
  reduceHudState
} from "../src/ui/hud-model";

describe("tank battle HUD model", () => {
  it("normalizes selectable levels to the configured campaign range", () => {
    expect(createInitialHudState(-4).level).toBe(1);
    expect(createInitialHudState(999).level).toBe(LEVEL_COUNT);
    expect(createInitialHudState(3.9).level).toBe(3);
  });

  it("starts, pauses, resumes, and restarts without losing selected level or sound preference", () => {
    const selected = reduceHudState(createInitialHudState(2), { type: "toggle-sound" });
    const running = reduceHudState(selected, { type: "start" });
    const paused = reduceHudState(running, { type: "pause" });
    const resumed = reduceHudState(paused, { type: "resume" });
    const restarted = reduceHudState(resumed, { type: "restart" });

    expect(running).toMatchObject({ level: 2, status: "running", showHelp: false });
    expect(paused).toMatchObject({ status: "paused", showHelp: true });
    expect(resumed).toMatchObject({ status: "running", showHelp: false });
    expect(restarted).toMatchObject({ level: 2, status: "running", soundEnabled: false });
  });

  it("deduplicates active controls and reports the highest-priority command hint", () => {
    const initial = createInitialHudState();
    const moving = reduceHudState(initial, { type: "key-down", code: "ArrowLeft" });
    const duplicate = reduceHudState(moving, { type: "key-down", code: "ArrowLeft" });
    const firing = reduceHudState(duplicate, { type: "key-down", code: "Space" });
    const released = reduceHudState(firing, { type: "key-up", code: "ArrowLeft" });

    expect(duplicate.activeKeys).toEqual(["ArrowLeft"]);
    expect(getCommandHint(firing.activeKeys)).toBe("开火");
    expect(released.activeKeys).toEqual(["Space"]);
  });

  it("marks base state for readable HUD alerts", () => {
    expect(getBaseAlert(createInitialHudState())).toBe("safe");
    expect(getBaseAlert({ ...createInitialHudState(), enemyQueue: 5 })).toBe("warning");
    expect(getBaseAlert({ ...createInitialHudState(), baseIntegrity: 30 })).toBe("critical");
    expect(getStatusLabel("game-over")).toBe("任务失败");
  });
});
