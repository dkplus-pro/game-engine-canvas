import type { Vec2 } from "@game-engine-canvas/engine";
import { findCueBall, placeCueBall } from "./physics";
import { createBilliardsState as createRulesState, getHudSnapshot as getRulesHudSnapshot } from "./rules";
import type { BallState, BilliardsState, HudSnapshot, PlayerId } from "./types";

/**
 * 当前桌球实现以 rules.ts 作为状态创建入口。
 * 本文件只提供只读选择器/兼容函数，避免 UI、测试和课程文档各自维护一套状态模型。
 */
export function createBilliardsState(): BilliardsState {
  return createRulesState();
}

export function getCueBall(state: BilliardsState): BallState {
  return findCueBall(state);
}

export function getObjectBalls(state: BilliardsState): BallState[] {
  return state.balls.filter((ball) => ball.kind !== "cue");
}

export function getRemainingObjectBalls(state: BilliardsState): BallState[] {
  return getObjectBalls(state).filter((ball) => !ball.pocketed);
}

export function resetCueBall(state: BilliardsState): void {
  placeCueBall(state);
}

export function getOpponent(player: PlayerId): PlayerId {
  return player === 1 ? 2 : 1;
}

export function getHudSnapshot(state: BilliardsState): HudSnapshot {
  return getRulesHudSnapshot(state);
}

export function getBallByNumber(state: BilliardsState, number: number): BallState | undefined {
  return state.balls.find((ball) => ball.number === number);
}

export function setCueBallPosition(state: BilliardsState, position: Vec2): void {
  const cue = getCueBall(state);
  cue.position.copy(position);
  cue.velocity.set(0, 0);
  cue.pocketed = false;
}
