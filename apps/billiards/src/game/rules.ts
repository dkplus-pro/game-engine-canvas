import { Vec2, clamp, type Vec2Like } from "@game-engine-canvas/engine";
import {
  BALL_DIAMETER,
  DEFAULT_SHOT_POWER,
  FOOT_SPOT,
  HEAD_SPOT,
  MAX_SHOT_POWER,
  MIN_SHOT_POWER,
  TABLE_RECT,
  ballPalette
} from "./constants";
import { areBallsMoving, findCueBall, placeCueBall, updatePhysics } from "./physics";
import type { BallKind, BallState, BilliardsCommand, BilliardsState, HudSnapshot } from "./types";

const idleCommand: BilliardsCommand = {
  aimDelta: 0,
  powerDelta: 0,
  shootPressed: false,
  pausePressed: false,
  resetPressed: false
};

export function createBilliardsState(): BilliardsState {
  return {
    balls: createRack(),
    status: "ready",
    previousStatus: "ready",
    currentPlayer: 1,
    shotCount: 0,
    pocketedCount: 0,
    message: "拖拽母球蓄力，或按 Space 以当前力度击球",
    elapsedTime: 0,
    settledFrames: 0,
    shot: {
      angle: 0,
      power: DEFAULT_SHOT_POWER,
      charging: false,
      pocketedThisShot: 0,
      scratched: false
    }
  };
}

export function updateBilliards(state: BilliardsState, command: BilliardsCommand = idleCommand, deltaTime = 0): void {
  if (command.resetPressed) {
    resetState(state);
    return;
  }
  if (command.pausePressed) togglePause(state);
  if (state.status === "paused" || state.status === "won") return;

  state.elapsedTime += Math.max(0, deltaTime);
  if (state.status === "rolling") {
    updatePhysics(state, deltaTime);
    finishShotIfSettled(state);
    return;
  }

  state.shot.angle = normalizeAngle(state.shot.angle + command.aimDelta);
  state.shot.power = clamp(state.shot.power + command.powerDelta, MIN_SHOT_POWER, MAX_SHOT_POWER);
  if (command.shootPressed) shootCueBall(state, state.shot.angle, state.shot.power);
}

export function shootCueBall(state: BilliardsState, angle = state.shot.angle, power = state.shot.power): boolean {
  if (state.status === "paused" || state.status === "rolling" || state.status === "won") return false;
  if (areBallsMoving(state.balls)) return false;

  const cue = findCueBall(state);
  if (cue.pocketed) placeCueBall(state);

  const safePower = clamp(power, MIN_SHOT_POWER, MAX_SHOT_POWER);
  cue.velocity.copy(vectorFromAngle(angle).scale(safePower));
  state.status = "rolling";
  state.shot.angle = normalizeAngle(angle);
  state.shot.power = safePower;
  state.shot.charging = false;
  state.shot.pocketedThisShot = 0;
  state.shot.scratched = false;
  state.settledFrames = 0;
  state.shotCount += 1;
  state.message = `第 ${state.shotCount} 杆出手，等待球停止`;
  return true;
}

export function aimFromPoint(state: BilliardsState, point: Vec2Like): void {
  if (state.status === "rolling" || state.status === "paused" || state.status === "won") return;
  const cue = findCueBall(state);
  const drag = new Vec2(cue.position.x - point.x, cue.position.y - point.y);
  if (drag.length() < 4) return;
  state.status = "aiming";
  state.shot.charging = true;
  state.shot.angle = Math.atan2(drag.y, drag.x);
  state.shot.power = clamp(drag.length() * 4.2, MIN_SHOT_POWER, MAX_SHOT_POWER);
  state.message = `蓄力 ${Math.round((state.shot.power / MAX_SHOT_POWER) * 100)}%`;
}

export function cancelAim(state: BilliardsState): void {
  if (state.status === "aiming") {
    state.status = "ready";
    state.shot.charging = false;
    state.message = "已取消瞄准，重新拖拽母球蓄力";
  }
}

export function getHudSnapshot(state: BilliardsState): HudSnapshot {
  const remaining = state.balls.filter((ball) => ball.kind !== "cue" && !ball.pocketed).length;
  return {
    player: state.currentPlayer,
    shots: state.shotCount,
    pocketed: state.pocketedCount,
    remaining,
    status: state.status,
    power: Math.round((state.shot.power / MAX_SHOT_POWER) * 100),
    message: state.message
  };
}

export function resetState(state: BilliardsState): void {
  Object.assign(state, createBilliardsState());
}

export function togglePause(state: BilliardsState): void {
  if (state.status === "won") return;
  if (state.status === "paused") {
    state.status = state.previousStatus;
    state.message = "继续击球";
    return;
  }
  state.previousStatus = state.status;
  state.status = "paused";
  state.message = "暂停中";
}

export function isPointOnTable(point: Vec2Like): boolean {
  return TABLE_RECT.containsPoint(point);
}

function createRack(): BallState[] {
  const balls: BallState[] = [createBall(0, "cue", HEAD_SPOT.x, HEAD_SPOT.y)];
  let number = 1;
  for (let row = 0; row < 5; row += 1) {
    const x = FOOT_SPOT.x + row * BALL_DIAMETER * 0.88;
    const rowStartY = FOOT_SPOT.y - (row * BALL_DIAMETER) / 2;
    for (let slot = 0; slot <= row; slot += 1) {
      balls.push(createBall(number, ballKind(number), x, rowStartY + slot * BALL_DIAMETER));
      number += 1;
    }
  }
  return balls;
}

function createBall(number: number, kind: BallKind, x: number, y: number): BallState {
  return {
    id: kind === "cue" ? "cue" : `ball-${number}`,
    number,
    kind,
    color: ballPalette[number] ?? "#f8fafc",
    position: new Vec2(x, y),
    velocity: new Vec2(),
    pocketed: false
  };
}

function ballKind(number: number): BallKind {
  if (number === 8) return "eight";
  return number < 8 ? "solid" : "stripe";
}

function finishShotIfSettled(state: BilliardsState): void {
  if (areBallsMoving(state.balls)) {
    state.settledFrames = 0;
    return;
  }
  state.settledFrames += 1;
  if (state.settledFrames < 4) return;

  if (state.pocketedCount >= 15) {
    state.status = "won";
    state.message = `清台完成！玩家 ${state.currentPlayer} 用 ${state.shotCount} 杆赢得比赛`;
    return;
  }

  if (state.shot.scratched) {
    placeCueBall(state);
    switchPlayer(state);
    state.message = `玩家 ${state.currentPlayer} 球权，母球已回到开球线`;
  } else if (state.shot.pocketedThisShot === 0) {
    switchPlayer(state);
    state.message = `未进球，轮到玩家 ${state.currentPlayer}`;
  } else {
    state.message = `玩家 ${state.currentPlayer} 连续击球，还剩 ${15 - state.pocketedCount} 颗`;
  }

  state.status = "ready";
  state.shot.charging = false;
  state.settledFrames = 0;
}

function switchPlayer(state: BilliardsState): void {
  state.currentPlayer = state.currentPlayer === 1 ? 2 : 1;
}

function vectorFromAngle(angle: number): Vec2 {
  return new Vec2(Math.cos(angle), Math.sin(angle));
}

function normalizeAngle(angle: number): number {
  const circle = Math.PI * 2;
  return ((angle % circle) + circle) % circle;
}
