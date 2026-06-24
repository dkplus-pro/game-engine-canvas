import { describe, expect, it } from "vitest";
import { BALL_DIAMETER, BALL_RADIUS, MAX_SHOT_POWER, TABLE_RECT } from "../src/game/constants";
import { updatePhysics } from "../src/game/physics";
import { createBilliardsState, shootCueBall, updateBilliards } from "../src/game/rules";
import { createBilliardsRuntime } from "../src/game/runtime";

const idleCommand = {
  aimDelta: 0,
  powerDelta: 0,
  shootPressed: false,
  pausePressed: false,
  resetPressed: false
};

describe("billiards simulation", () => {
  it("creates a deterministic non-overlapping cue plus 15-ball rack", () => {
    const state = createBilliardsState();

    expect(state.balls).toHaveLength(16);
    expect(state.balls.filter((ball) => ball.kind !== "cue")).toHaveLength(15);
    for (let i = 0; i < state.balls.length; i += 1) {
      for (let j = i + 1; j < state.balls.length; j += 1) {
        const a = state.balls[i]!;
        const b = state.balls[j]!;
        expect(a.position.distanceTo(b.position)).toBeGreaterThanOrEqual(BALL_DIAMETER - 0.05);
      }
    }
  });

  it("clamps shot power and starts rolling through the engine world runtime", () => {
    const runtime = createBilliardsRuntime();

    runtime.input.keyDown("Space");
    runtime.world.update(0.016);

    const cue = runtime.state.balls.find((ball) => ball.kind === "cue")!;
    expect(runtime.state.status).toBe("rolling");
    expect(runtime.state.shotCount).toBe(1);
    expect(cue.velocity.length()).toBeGreaterThan(0);

    const state = createBilliardsState();
    expect(shootCueBall(state, 0, MAX_SHOT_POWER * 5)).toBe(true);
    expect(state.shot.power).toBe(MAX_SHOT_POWER);
  });

  it("transfers velocity during equal-mass circle collisions", () => {
    const state = createBilliardsState();
    const cue = state.balls.find((ball) => ball.kind === "cue")!;
    const target = state.balls.find((ball) => ball.number === 1)!;
    state.balls = [cue, target];
    cue.position.set(420, 320);
    target.position.set(420 + BALL_DIAMETER - 1, 320);
    cue.velocity.set(260, 0);
    target.velocity.set(0, 0);

    updatePhysics(state, 0.016);

    expect(cue.velocity.x).toBeLessThan(80);
    expect(target.velocity.x).toBeGreaterThan(180);
  });

  it("bounces off cushions and handles cue-ball scratch after balls settle", () => {
    const state = createBilliardsState();
    const cue = state.balls.find((ball) => ball.kind === "cue")!;
    state.balls = [cue];
    cue.position.set(TABLE_RECT.left + BALL_RADIUS + 1, TABLE_RECT.center.y);
    cue.velocity.set(-240, 0);

    updatePhysics(state, 0.02);

    expect(cue.position.x).toBe(TABLE_RECT.left + BALL_RADIUS);
    expect(cue.velocity.x).toBeGreaterThan(0);

    state.status = "rolling";
    cue.position.set(TABLE_RECT.left + BALL_RADIUS, TABLE_RECT.top + BALL_RADIUS);
    cue.velocity.set(0, 0);
    for (let i = 0; i < 5; i += 1) updateBilliards(state, idleCommand, 0.016);

    expect(cue.pocketed).toBe(false);
    expect(state.currentPlayer).toBe(2);
    expect(state.status).toBe("ready");
  });

  it("declares a win when the final object ball drops", () => {
    const state = createBilliardsState();
    const cue = state.balls.find((ball) => ball.kind === "cue")!;
    const finalBall = state.balls.find((ball) => ball.number === 15)!;
    state.balls.forEach((ball) => {
      if (ball.kind !== "cue" && ball.number !== 15) ball.pocketed = true;
    });
    state.balls = [cue, finalBall, ...state.balls.filter((ball) => ball.kind !== "cue" && ball.number !== 15)];
    state.pocketedCount = 14;
    state.status = "rolling";
    finalBall.pocketed = false;
    finalBall.position.set(TABLE_RECT.left + BALL_RADIUS, TABLE_RECT.top + BALL_RADIUS);
    finalBall.velocity.set(0, 0);

    for (let i = 0; i < 5; i += 1) updateBilliards(state, idleCommand, 0.016);

    expect(state.status).toBe("won");
    expect(state.pocketedCount).toBe(15);
  });
});
