import { Vec2 } from "@game-engine-canvas/engine";
import { describe, expect, it } from "vitest";
import { BALL_RADIUS } from "../src/game/constants";
import { updateBilliardsPhysics } from "../src/game/physics";
import { getCueBall, getObjectBalls, createBilliardsState } from "../src/game/state";

describe("billiards physics", () => {
  it("bounces balls off cushions without leaving the playfield", () => {
    const state = createBilliardsState();
    const cue = getCueBall(state);
    cue.position.set(state.table.playfield.left + BALL_RADIUS + 1, state.table.playfield.center.y);
    cue.velocity.set(-320, 0);

    updateBilliardsPhysics(state, 0.08);

    expect(cue.position.x).toBeGreaterThanOrEqual(state.table.playfield.left + BALL_RADIUS);
    expect(cue.velocity.x).toBeGreaterThan(0);
  });

  it("transfers speed through equal-mass ball collisions", () => {
    const state = createBilliardsState();
    const cue = getCueBall(state);
    const target = getObjectBalls(state)[0]!;
    cue.position.set(220, 260);
    target.position.set(220 + BALL_RADIUS * 2 - 1, 260);
    cue.velocity.set(420, 0);
    target.velocity.set(0, 0);

    updateBilliardsPhysics(state, 1 / 120);

    expect(cue.velocity.x).toBeLessThan(80);
    expect(target.velocity.x).toBeGreaterThan(300);
  });

  it("pockets balls and records the turn event", () => {
    const state = createBilliardsState();
    const target = getObjectBalls(state)[0]!;
    const pocket = state.table.pockets[0]!;
    target.position.copy(pocket.position.clone().add(new Vec2(1, 1)));
    target.velocity.set(-20, -20);

    updateBilliardsPhysics(state, 0.016);

    expect(target.pocketed).toBe(true);
    expect(state.turn.pocketedNumbers).toContain(target.number);
  });
});
