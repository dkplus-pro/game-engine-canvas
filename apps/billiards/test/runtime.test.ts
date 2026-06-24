import { Vec2 } from "@game-engine-canvas/engine";
import { describe, expect, it } from "vitest";
import { strikeCueBall } from "../src/game/rules";
import { createBilliardsRuntime } from "../src/game/runtime";
import { getCueBall } from "../src/game/state";

describe("billiards runtime", () => {
  it("registers a World system that advances the cue ball", () => {
    const runtime = createBilliardsRuntime();
    const cue = getCueBall(runtime.state);
    const startX = cue.position.x;

    expect(runtime.world.getSystems().map((system) => system.name)).toContain("BilliardsRules");
    expect(strikeCueBall(runtime.state, { direction: new Vec2(1, 0), power: 0.25 })).toBe(true);
    runtime.world.update(1 / 30);

    expect(cue.position.x).toBeGreaterThan(startX);
    expect(runtime.input.pointer.down).toBe(false);
  });
});
