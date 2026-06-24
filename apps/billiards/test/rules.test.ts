import { Vec2 } from "@game-engine-canvas/engine";
import { describe, expect, it } from "vitest";
import { EIGHT_BALL_NUMBER, MAX_SHOT_POWER, SHOT_SPEED } from "../src/game/constants";
import { settleTurn, strikeCueBall } from "../src/game/rules";
import { createBilliardsState, getCueBall, getHudSnapshot, getObjectBalls } from "../src/game/state";

describe("billiards rules", () => {
  it("clamps shot power and blocks double shots while balls are rolling", () => {
    const state = createBilliardsState();
    const accepted = strikeCueBall(state, { direction: new Vec2(2, 0), power: 5 });

    expect(accepted).toBe(true);
    expect(getCueBall(state).velocity.x).toBeCloseTo(MAX_SHOT_POWER * SHOT_SPEED, 4);
    expect(state.phase).toBe("rolling");
    expect(strikeCueBall(state, { direction: new Vec2(1, 0), power: 0.4 })).toBe(false);
  });

  it("keeps the active player after pocketing an object ball", () => {
    const state = createBilliardsState();
    state.phase = "rolling";
    state.turn.pocketedNumbers.push(3);

    settleTurn(state);

    expect(state.phase).toBe("aiming");
    expect(state.activePlayer).toBe(1);
    expect(getHudSnapshot(state).message).toContain("继续击球");
  });

  it("switches player and respots cue ball after a scratch", () => {
    const state = createBilliardsState();
    const cue = getCueBall(state);
    state.phase = "rolling";
    cue.pocketed = true;
    state.turn.scratch = true;
    state.turn.pocketedNumbers.push(0);

    settleTurn(state);

    expect(state.phase).toBe("aiming");
    expect(state.activePlayer).toBe(2);
    expect(cue.pocketed).toBe(false);
    expect(cue.position.x).toBeGreaterThan(state.table.playfield.left);
    expect(state.message).toContain("洗袋犯规");
  });

  it("awards the opponent when the eight ball drops early", () => {
    const state = createBilliardsState();
    const eight = getObjectBalls(state).find((ball) => ball.number === EIGHT_BALL_NUMBER)!;
    state.phase = "rolling";
    eight.pocketed = true;
    state.turn.pocketedNumbers.push(EIGHT_BALL_NUMBER);

    settleTurn(state);

    expect(state.phase).toBe("ended");
    expect(state.winner).toBe(2);
    expect(state.message).toContain("过早落袋");
  });
});
