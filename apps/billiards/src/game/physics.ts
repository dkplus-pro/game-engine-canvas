import { Vec2, clamp } from "@game-engine-canvas/engine";
import {
  BALL_RADIUS,
  BALL_RESTITUTION,
  CUSHION_RESTITUTION,
  FRICTION_PER_SECOND,
  PLAY_MAX_X,
  PLAY_MAX_Y,
  PLAY_MIN_X,
  PLAY_MIN_Y,
  POCKET_RADIUS,
  STOP_SPEED,
  pockets
} from "./constants";
import type { Ball, BilliardsState } from "./types";

export function advanceBilliardsPhysics(state: BilliardsState, deltaTime: number): void {
  const dt = Math.min(deltaTime, 0.05);
  for (const ball of state.balls) {
    if (ball.pocketed) continue;
    integrateBall(ball, dt);
    resolveCushions(state, ball);
  }

  resolveBallCollisions(state);
  resolvePockets(state);
}

export function areBallsStopped(state: BilliardsState): boolean {
  return state.balls.every((ball) => ball.pocketed || ball.velocity.length() <= STOP_SPEED);
}

export function stopSlowBalls(state: BilliardsState): void {
  for (const ball of state.balls) {
    if (ball.velocity.length() <= STOP_SPEED) {
      ball.velocity.set(0, 0);
    }
  }
}

export function resolveBallCollision(a: Ball, b: Ball): boolean {
  if (a.pocketed || b.pocketed) return false;
  const delta = Vec2.from(b.position).subtract(a.position);
  const distance = Math.max(delta.length(), 0.0001);
  const minDistance = BALL_RADIUS * 2;
  if (distance >= minDistance) return false;

  const normal = delta.scale(1 / distance);
  const overlap = minDistance - distance;
  a.position.add(Vec2.from(normal).scale(-overlap / 2));
  b.position.add(Vec2.from(normal).scale(overlap / 2));

  // Equal-mass billiards exchange only the normal velocity component. Tangential velocity remains unchanged.
  const relativeVelocity = Vec2.from(b.velocity).subtract(a.velocity);
  const speedAlongNormal = relativeVelocity.dot(normal);
  if (speedAlongNormal >= 0) return true;

  const impulse = (-(1 + BALL_RESTITUTION) * speedAlongNormal) / 2;
  a.velocity.add(Vec2.from(normal).scale(-impulse));
  b.velocity.add(Vec2.from(normal).scale(impulse));
  return true;
}

function integrateBall(ball: Ball, dt: number): void {
  ball.position.add(Vec2.from(ball.velocity).scale(dt));
  const friction = Math.pow(FRICTION_PER_SECOND, dt * 60);
  ball.velocity.scale(friction);
}

function resolveCushions(state: BilliardsState, ball: Ball): void {
  const minX = PLAY_MIN_X + BALL_RADIUS;
  const maxX = PLAY_MAX_X - BALL_RADIUS;
  const minY = PLAY_MIN_Y + BALL_RADIUS;
  const maxY = PLAY_MAX_Y - BALL_RADIUS;
  let hit = false;

  if (ball.position.x < minX || ball.position.x > maxX) {
    ball.position.x = clamp(ball.position.x, minX, maxX);
    ball.velocity.x = -ball.velocity.x * CUSHION_RESTITUTION;
    hit = true;
  }
  if (ball.position.y < minY || ball.position.y > maxY) {
    ball.position.y = clamp(ball.position.y, minY, maxY);
    ball.velocity.y = -ball.velocity.y * CUSHION_RESTITUTION;
    hit = true;
  }

  if (hit && state.shot) {
    state.shot.cushionHits += 1;
  }
}

function resolveBallCollisions(state: BilliardsState): void {
  for (let i = 0; i < state.balls.length; i += 1) {
    for (let j = i + 1; j < state.balls.length; j += 1) {
      if (resolveBallCollision(state.balls[i]!, state.balls[j]!)) {
        state.stats.collisions += 1;
        if (state.shot) {
          state.shot.collisions += 1;
        }
      }
    }
  }
}

function resolvePockets(state: BilliardsState): void {
  for (const ball of state.balls) {
    if (ball.pocketed) continue;
    const pocket = pockets.find((item) => item.distanceTo(ball.position) <= POCKET_RADIUS);
    if (!pocket) continue;

    ball.pocketed = true;
    ball.position.copy(pocket);
    ball.velocity.set(0, 0);
    state.stats.pockets += 1;
    if (state.shot) {
      if (ball.number === 0) state.shot.cuePocketed = true;
      else state.shot.pocketedNumbers.push(ball.number);
    }
  }
}
