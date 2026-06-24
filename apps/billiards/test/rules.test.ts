import { describe, expect, it } from "vitest";
import { MAX_SHOT_POWER, MIN_SHOT_POWER } from "../src/game/constants";
import { createBilliardsState, getHudSnapshot, shootCueBall, updateBilliards } from "../src/game/rules";
import { getCueBall } from "../src/game/state";

const idleCommand = {
  aimDelta: 0,
  powerDelta: 0,
  shootPressed: false,
  pausePressed: false,
  resetPressed: false
};

describe("billiards rules", () => {
  it("clamps shot power and blocks double shots while balls are rolling", () => {
    const state = createBilliardsState();
    const accepted = shootCueBall(state, 0, MAX_SHOT_POWER * 5);

    expect(accepted).toBe(true);
    expect(getCueBall(state).velocity.x).toBeCloseTo(MAX_SHOT_POWER, 4);
    expect(state.status).toBe("rolling");
    expect(shootCueBall(state, 0, MIN_SHOT_POWER)).toBe(false);
  });

  it("keeps the player after pocketing an object ball", () => {
    const state = createBilliardsState();
    state.status = "rolling";
    state.shot.pocketedThisShot = 1;

    for (let i = 0; i < 5; i += 1) updateBilliards(state, idleCommand, 0.016);

    expect(state.status).toBe("ready");
    expect(state.currentPlayer).toBe(1);
    expect(getHudSnapshot(state).message).toContain("连续击球");
  });

  it("switches player and respots cue ball after a scratch", () => {
    const state = createBilliardsState();
    const cue = getCueBall(state);
    state.status = "rolling";
    cue.pocketed = true;
    state.shot.scratched = true;

    for (let i = 0; i < 5; i += 1) updateBilliards(state, idleCommand, 0.016);

    expect(state.status).toBe("ready");
    expect(state.currentPlayer).toBe(2);
    expect(cue.pocketed).toBe(false);
    expect(state.message).toContain("母球");
  });

  it("declares a win after the last object ball is pocketed", () => {
    const state = createBilliardsState();
    state.status = "rolling";
    state.pocketedCount = 15;

    for (let i = 0; i < 5; i += 1) updateBilliards(state, idleCommand, 0.016);

    expect(state.status).toBe("won");
    expect(state.message).toContain("清台完成");
  });
});
