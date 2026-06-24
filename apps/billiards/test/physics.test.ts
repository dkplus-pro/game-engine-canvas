import { Vec2 } from "@game-engine-canvas/engine";
import { describe, expect, it } from "vitest";
import { BALL_DIAMETER, BALL_RADIUS, TABLE_RECT } from "../src/game/constants";
import { updatePhysics } from "../src/game/physics";
import { createBilliardsState } from "../src/game/rules";
import { getCueBall, getObjectBalls } from "../src/game/state";

describe("billiards physics", () => {
  it("bounces balls off cushions without leaving the playfield", () => {
    const state = createBilliardsState();
    const cue = getCueBall(state);
    cue.position.set(TABLE_RECT.left + BALL_RADIUS + 1, TABLE_RECT.center.y);
    cue.velocity.set(-320, 0);

    updatePhysics(state, 0.08);

    expect(cue.position.x).toBeGreaterThanOrEqual(TABLE_RECT.left + BALL_RADIUS);
    expect(cue.velocity.x).toBeGreaterThan(0);
  });

  it("transfers speed through equal-mass ball collisions", () => {
    const state = createBilliardsState();
    const cue = getCueBall(state);
    const target = getObjectBalls(state)[0]!;
    state.balls = [cue, target];
    cue.position.set(420, 320);
    target.position.set(420 + BALL_DIAMETER - 1, 320);
    cue.velocity.set(420, 0);
    target.velocity.set(0, 0);

    updatePhysics(state, 1 / 120);

    expect(cue.velocity.x).toBeLessThan(120);
    expect(target.velocity.x).toBeGreaterThan(300);
  });

  it("pockets balls and records the shot event", () => {
    const state = createBilliardsState();
    const target = getObjectBalls(state)[0]!;
    target.position.copy(new Vec2(TABLE_RECT.left + BALL_RADIUS, TABLE_RECT.top + BALL_RADIUS));
    target.velocity.set(0, 0);

    updatePhysics(state, 0.016);

    expect(target.pocketed).toBe(true);
    expect(state.pocketedCount).toBe(1);
    expect(state.shot.pocketedThisShot).toBe(1);
  });
});
