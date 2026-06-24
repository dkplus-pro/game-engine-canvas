import { Vec2, clamp } from "@game-engine-canvas/engine";
import { BALL_RADIUS, BALL_RESTITUTION, CUSHION_RESTITUTION, FELT_FRICTION, MAX_PHYSICS_STEP, STOP_SPEED } from "./constants";
import { isBallInPocket } from "./table";
import type { Ball, BilliardsState } from "./types";

export function updateBilliardsPhysics(state: BilliardsState, deltaTime: number): void {
  let remaining = Math.max(0, deltaTime);

  // Sub-step the circle solver so fast cue shots cannot tunnel through the rack.
  while (remaining > 0) {
    const dt = Math.min(remaining, MAX_PHYSICS_STEP);
    moveBalls(state, dt);
    resolveBallCollisions(state.balls);
    remaining -= dt;
  }
}

export function areBallsSleeping(state: BilliardsState): boolean {
  return state.balls.every((ball) => ball.pocketed || ball.velocity.length() <= STOP_SPEED);
}

function moveBalls(state: BilliardsState, dt: number): void {
  for (const ball of state.balls) {
    if (ball.pocketed) continue;

    ball.position.add(ball.velocity.clone().scale(dt));
    applyFriction(ball, dt);
    resolveCushions(ball, state);
    pocketBallIfNeeded(ball, state);
  }
}

function applyFriction(ball: Ball, dt: number): void {
  const speed = ball.velocity.length();
  if (speed <= STOP_SPEED) {
    ball.velocity.set(0, 0);
    return;
  }

  const nextSpeed = Math.max(0, speed - FELT_FRICTION * dt);
  ball.velocity.normalize().scale(nextSpeed);
}

function resolveCushions(ball: Ball, state: BilliardsState): void {
  const { playfield } = state.table;
  const minX = playfield.left + BALL_RADIUS;
  const maxX = playfield.right - BALL_RADIUS;
  const minY = playfield.top + BALL_RADIUS;
  const maxY = playfield.bottom - BALL_RADIUS;
  const nextX = clamp(ball.position.x, minX, maxX);
  const nextY = clamp(ball.position.y, minY, maxY);

  if (nextX !== ball.position.x) {
    ball.position.x = nextX;
    ball.velocity.x *= -CUSHION_RESTITUTION;
  }
  if (nextY !== ball.position.y) {
    ball.position.y = nextY;
    ball.velocity.y *= -CUSHION_RESTITUTION;
  }
}

function pocketBallIfNeeded(ball: Ball, state: BilliardsState): void {
  const pocket = isBallInPocket(ball.position, state.table);
  if (!pocket) return;

  ball.pocketed = true;
  ball.velocity.set(0, 0);
  state.turn.pocketedNumbers.push(ball.number);
  if (ball.kind === "cue") {
    state.turn.scratch = true;
  }
}

function resolveBallCollisions(balls: Ball[]): void {
  for (let i = 0; i < balls.length; i += 1) {
    for (let j = i + 1; j < balls.length; j += 1) {
      resolveBallPair(balls[i]!, balls[j]!);
    }
  }
}

function resolveBallPair(a: Ball, b: Ball): void {
  if (a.pocketed || b.pocketed) return;

  const delta = Vec2.from(b.position).subtract(a.position);
  const distance = delta.length();
  const minimumDistance = BALL_RADIUS * 2;
  if (distance <= 0 || distance >= minimumDistance) return;

  const normal = delta.scale(1 / distance);
  const overlap = minimumDistance - distance;
  a.position.add(normal.clone().scale(-overlap / 2));
  b.position.add(normal.clone().scale(overlap / 2));

  // Equal-mass impulse: exchange only the velocity component along the contact normal.
  const relativeVelocity = Vec2.from(b.velocity).subtract(a.velocity);
  const separatingSpeed = relativeVelocity.dot(normal);
  if (separatingSpeed > 0) return;

  const impulse = (-(1 + BALL_RESTITUTION) * separatingSpeed) / 2;
  a.velocity.add(normal.clone().scale(-impulse));
  b.velocity.add(normal.clone().scale(impulse));
}
