import type { Vec2 } from "@game-engine-canvas/engine";

export type BallKind = "cue" | "solid" | "stripe" | "eight";
export type GameStatus = "ready" | "aiming" | "rolling" | "paused" | "won";
export type PlayerId = 1 | 2;

export interface BallState {
  readonly id: string;
  readonly number: number;
  readonly kind: BallKind;
  readonly color: string;
  readonly position: Vec2;
  readonly velocity: Vec2;
  pocketed: boolean;
}

export interface ShotState {
  angle: number;
  power: number;
  charging: boolean;
  pocketedThisShot: number;
  scratched: boolean;
}

export interface BilliardsState {
  balls: BallState[];
  status: GameStatus;
  previousStatus: GameStatus;
  currentPlayer: PlayerId;
  shotCount: number;
  pocketedCount: number;
  message: string;
  elapsedTime: number;
  settledFrames: number;
  shot: ShotState;
}

export interface BilliardsCommand {
  readonly aimDelta: number;
  readonly powerDelta: number;
  readonly shootPressed: boolean;
  readonly pausePressed: boolean;
  readonly resetPressed: boolean;
}

export interface HudSnapshot {
  readonly player: PlayerId;
  readonly shots: number;
  readonly pocketed: number;
  readonly remaining: number;
  readonly status: GameStatus;
  readonly power: number;
  readonly message: string;
}
