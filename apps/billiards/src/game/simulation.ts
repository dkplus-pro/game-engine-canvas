import type { BilliardsCommand, BilliardsState, HudSnapshot } from "./types";
import { createBilliardsRuntime } from "./runtime";
import { createBilliardsState, getHudSnapshot, shootCueBall, updateBilliards } from "./rules";

/**
 * 课程中的“模拟层”入口：保持为薄门面，真正规则集中在 rules.ts。
 * 这样 Next 组件、Vitest 和 Playwright 都使用同一套状态机。
 */
export function createBilliardsSimulation() {
  return createBilliardsRuntime();
}

export function createInitialSimulationState(): BilliardsState {
  return createBilliardsState();
}

export function updateSimulation(state: BilliardsState, command: BilliardsCommand, deltaTime: number): void {
  updateBilliards(state, command, deltaTime);
}

export function shootSimulationCue(state: BilliardsState, angle: number, power: number): boolean {
  return shootCueBall(state, angle, power);
}

export function readSimulationHud(state: BilliardsState): HudSnapshot {
  return getHudSnapshot(state);
}
