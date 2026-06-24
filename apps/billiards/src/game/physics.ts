import { Vec2, clamp, subtractVec2, type Vec2Like } from "@game-engine-canvas/engine";
import {
  BALL_DIAMETER,
  BALL_RADIUS,
  BALL_RESTITUTION,
  CUSHION_RESTITUTION,
  HEAD_SPOT,
  LINEAR_FRICTION,
  POCKET_RADIUS,
  ROLLING_FRICTION,
  STOP_SPEED,
  TABLE_RECT,
  pockets
} from "./constants";
import type { BallState, BilliardsState } from "./types";

export function updatePhysics(state: BilliardsState, deltaTime: number): void {
  const dt = Math.min(Math.max(deltaTime, 0), 0.033);
  for (const ball of activeBalls(state)) {
    moveBall(ball, dt);
    resolveCushions(ball);
  }

  resolveBallCollisions(state.balls);
  resolvePockets(state);
  applyStopThreshold(state.balls);
}

export function areBallsMoving(balls: readonly BallState[]): boolean {
  return balls.some((ball) => !ball.pocketed && ball.velocity.length() > STOP_SPEED);
}

export function activeBalls(state: BilliardsState): BallState[] {
  return state.balls.filter((ball) => !ball.pocketed);
}

export function findCueBall(state: BilliardsState): BallState {
  const cue = state.balls.find((ball) => ball.kind === "cue");
  if (!cue) throw new Error("Cue ball is missing from billiards state.");
  return cue;
}

export function placeCueBall(state: BilliardsState): void {
  const cue = findCueBall(state);
  cue.pocketed = false;
  cue.position.copy(findOpenHeadSpot(state));
  cue.velocity.set(0, 0);
}

export function distanceToNearestPocket(point: Vec2Like): number {
  return Math.min(...pockets.map((pocket) => pocket.distanceTo(point)));
}

function moveBall(ball: BallState, dt: number): void {
  ball.position.add(ball.velocity.clone().scale(dt));

  // Two friction terms keep slow shots readable while still stopping long rolls.
  const drag = Math.pow(LINEAR_FRICTION, dt * 60);
  ball.velocity.scale(drag);
  const speed = ball.velocity.length();
  if (speed > 0) {
    const nextSpeed = Math.max(0, speed - ROLLING_FRICTION * dt);
    ball.velocity.scale(nextSpeed / speed);
  }
}

function resolveCushions(ball: BallState): void {
  const minX = TABLE_RECT.left + BALL_RADIUS;
  const maxX = TABLE_RECT.right - BALL_RADIUS;
  const minY = TABLE_RECT.top + BALL_RADIUS;
  const maxY = TABLE_RECT.bottom - BALL_RADIUS;

  if (ball.position.x < minX) {
    ball.position.x = minX;
    if (ball.velocity.x < 0) ball.velocity.x = -ball.velocity.x * CUSHION_RESTITUTION;
  }
  if (ball.position.x > maxX) {
    ball.position.x = maxX;
    if (ball.velocity.x > 0) ball.velocity.x = -ball.velocity.x * CUSHION_RESTITUTION;
  }
  if (ball.position.y < minY) {
    ball.position.y = minY;
    if (ball.velocity.y < 0) ball.velocity.y = -ball.velocity.y * CUSHION_RESTITUTION;
  }
  if (ball.position.y > maxY) {
    ball.position.y = maxY;
    if (ball.velocity.y > 0) ball.velocity.y = -ball.velocity.y * CUSHION_RESTITUTION;
  }
}

function resolveBallCollisions(balls: readonly BallState[]): void {
  const active = balls.filter((ball) => !ball.pocketed);
  for (let i = 0; i < active.length; i += 1) {
    for (let j = i + 1; j < active.length; j += 1) {
      const a = active[i]!;
      const b = active[j]!;
      resolvePair(a, b);
    }
  }
}

function resolvePair(a: BallState, b: BallState): void {
  const delta = subtractVec2(b.position, a.position);
  const distance = Math.max(delta.length(), 0.0001);
  if (distance >= BALL_DIAMETER) return;

  const normal = delta.scale(1 / distance);
  const overlap = BALL_DIAMETER - distance;
  a.position.add(normal.clone().scale(-overlap / 2));
  b.position.add(normal.clone().scale(overlap / 2));

  const relativeVelocity = subtractVec2(a.velocity, b.velocity);
  const speedAlongNormal = relativeVelocity.dot(normal);
  if (speedAlongNormal <= 0) return;

  const impulse = speedAlongNormal * BALL_RESTITUTION;
  a.velocity.add(normal.clone().scale(-impulse));
  b.velocity.add(normal.clone().scale(impulse));
}

function resolvePockets(state: BilliardsState): void {
  for (const ball of activeBalls(state)) {
    if (distanceToNearestPocket(ball.position) > POCKET_RADIUS) continue;

    ball.pocketed = true;
    ball.velocity.set(0, 0);
    if (ball.kind === "cue") {
      state.shot.scratched = true;
      state.message = "母球落袋：本杆结束后回到开球线";
    } else {
      state.pocketedCount += 1;
      state.shot.pocketedThisShot += 1;
      state.message = `命中 ${ball.number} 号球，继续保持节奏`;
    }
  }
}

function applyStopThreshold(balls: readonly BallState[]): void {
  for (const ball of balls) {
    if (!ball.pocketed && ball.velocity.length() <= STOP_SPEED) {
      ball.velocity.set(0, 0);
    }
  }
}

function findOpenHeadSpot(state: BilliardsState): Vec2 {
  const candidates = [
    HEAD_SPOT,
    new Vec2(HEAD_SPOT.x, HEAD_SPOT.y - BALL_DIAMETER * 1.4),
    new Vec2(HEAD_SPOT.x, HEAD_SPOT.y + BALL_DIAMETER * 1.4),
    new Vec2(HEAD_SPOT.x - BALL_DIAMETER * 1.4, HEAD_SPOT.y),
    new Vec2(HEAD_SPOT.x + BALL_DIAMETER * 1.4, HEAD_SPOT.y)
  ];

  return (
    candidates.find((candidate) =>
      state.balls.every((ball) => ball.kind === "cue" || ball.pocketed || ball.position.distanceTo(candidate) > BALL_DIAMETER * 1.1)
    ) ?? HEAD_SPOT
  ).clone();
}

export function clampShotPower(power: number): number {
  return clamp(power, 0, 920);
}
