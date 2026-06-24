import { describe, expect, it } from "vitest";
import { shootCueBall } from "../src/game/rules";
import { createBilliardsRuntime } from "../src/game/runtime";
import { getCueBall } from "../src/game/state";

describe("billiards runtime", () => {
  it("registers an engine World system that advances the cue ball", () => {
    const runtime = createBilliardsRuntime();
    const cue = getCueBall(runtime.state);
    const startX = cue.position.x;

    expect(runtime.world.getSystems().map((system) => system.name)).toContain("BilliardsRules");
    expect(shootCueBall(runtime.state, 0, 260)).toBe(true);
    runtime.world.update(1 / 30);

    expect(cue.position.x).toBeGreaterThan(startX);
    expect(runtime.input.pointer.down).toBe(false);
  });
});
