import { Vec2 } from "@game-engine-canvas/engine";
import { describe, expect, it } from "vitest";
import { BALL_RADIUS, CUE_START, PLAY_MIN_X, pockets } from "../src/game/constants";
import { advanceBilliardsPhysics, resolveBallCollision } from "../src/game/physics";
import { getHudSnapshot, settleShot, updateBilliards } from "../src/game/simulation";
import { createBall, createBilliardsState, getCueBall } from "../src/game/table";
import type { BilliardsState } from "../src/game/types";

function startShot(state: BilliardsState, pocketedNumbers: number[] = []) {
  state.shot = {
    pocketedNumbers,
    cuePocketed: false,
    cushionHits: 0,
    collisions: 1,
    elapsedAfterStop: 0
  };
}

describe("billiards simulation", () => {
  it("creates a deterministic 15-ball rack plus cue ball", () => {
    const first = createBilliardsState();
    const second = createBilliardsState();

    expect(first.balls).toHaveLength(16);
    expect(first.balls.map((ball) => [ball.number, Math.round(ball.position.x), Math.round(ball.position.y)])).toEqual(
      second.balls.map((ball) => [ball.number, Math.round(ball.position.x), Math.round(ball.position.y)])
    );
    expect(getCueBall(first).position.x).toBe(CUE_START.x);
    expect(first.balls.find((ball) => ball.number === 8)?.kind).toBe("eight");
  });

  it("exchanges velocity through equal-mass circular collision", () => {
    const a = createBall(1, 100, 100);
    const b = createBall(2, 100 + BALL_RADIUS * 2 - 1, 100);
    a.velocity.set(200, 0);

    expect(resolveBallCollision(a, b)).toBe(true);
    expect(a.velocity.x).toBeLessThan(20);
    expect(b.velocity.x).toBeGreaterThan(180);
  });

  it("reflects off cushions and records the rail contact", () => {
    const state = createBilliardsState();
    const cue = getCueBall(state);
    cue.position.set(PLAY_MIN_X + BALL_RADIUS - 2, cue.position.y);
    cue.velocity.set(-120, 0);
    startShot(state);

    advanceBilliardsPhysics(state, 0.016);

    expect(cue.velocity.x).toBeGreaterThan(0);
    expect(state.shot?.cushionHits).toBeGreaterThan(0);
  });

  it("spots the cue ball and switches turn after a scratch", () => {
    const state = createBilliardsState();
    const cue = getCueBall(state);
    cue.position.copy(pockets[0]);
    startShot(state);

    advanceBilliardsPhysics(state, 0.016);
    expect(state.shot?.cuePocketed).toBe(true);

    settleShot(state);

    expect(state.currentPlayer).toBe(2);
    expect(state.stats.fouls).toBe(1);
    expect(cue.pocketed).toBe(false);
    expect(cue.position.distanceTo(CUE_START)).toBeLessThan(4);
  });

  it("assigns groups on the first legal object pocket and keeps the shooter", () => {
    const state = createBilliardsState();
    state.balls.find((ball) => ball.number === 1)!.pocketed = true;
    startShot(state, [1]);

    settleShot(state);

    expect(state.currentPlayer).toBe(1);
    expect(state.players[1].group).toBe("solids");
    expect(state.players[2].group).toBe("stripes");
    expect(getHudSnapshot(state).playerOneGroup).toBe("低号");
  });

  it("switches turns when no target ball is pocketed", () => {
    const state = createBilliardsState();
    startShot(state);

    settleShot(state);

    expect(state.currentPlayer).toBe(2);
    expect(state.status).toBe("aiming");
  });

  it("awards the opponent when the eight ball drops before the shooter clears a group", () => {
    const state = createBilliardsState();
    state.balls.find((ball) => ball.number === 8)!.pocketed = true;
    startShot(state, [8]);

    settleShot(state);

    expect(state.status).toBe("won");
    expect(state.winner).toBe(2);
  });

  it("does not advance a rolling ball while paused", () => {
    const state = createBilliardsState();
    const cue = getCueBall(state);
    cue.velocity = new Vec2(300, 0);
    state.status = "rolling";
    updateBilliards(state, { pausePressed: true }, 0.016);
    const pausedX = cue.position.x;

    updateBilliards(state, { pausePressed: false }, 0.5);

    expect(state.status).toBe("paused");
    expect(cue.position.x).toBe(pausedX);
  });
});
