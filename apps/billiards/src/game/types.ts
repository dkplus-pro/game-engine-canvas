import type { Rect, Vec2 } from "@game-engine-canvas/engine";

export type PlayerId = 1 | 2;
export type BallKind = "cue" | "solid" | "stripe" | "eight";
export type BilliardsPhase = "aiming" | "rolling" | "ended";
export type FoulKind = "scratch" | "early-eight";

export interface Ball {
  readonly id: string;
  readonly number: number;
  readonly kind: BallKind;
  position: Vec2;
  velocity: Vec2;
  pocketed: boolean;
}

export interface Pocket {
  readonly id: string;
  readonly position: Vec2;
  readonly radius: number;
}

export interface TableGeometry {
  readonly bounds: Rect;
  readonly playfield: Rect;
  readonly pockets: Pocket[];
}

export interface ShotCommand {
  readonly direction: Vec2;
  readonly power: number;
}

export interface TurnStats {
  player: PlayerId;
  pocketedNumbers: number[];
  scratch: boolean;
  foul?: FoulKind;
}

export interface HudSnapshot {
  readonly activePlayer: PlayerId;
  readonly phase: BilliardsPhase;
  readonly remainingBalls: number;
  readonly winner?: PlayerId;
  readonly message: string;
}

export interface BilliardsState {
  readonly table: TableGeometry;
  readonly balls: Ball[];
  phase: BilliardsPhase;
  activePlayer: PlayerId;
  winner?: PlayerId;
  message: string;
  shotCount: number;
  turn: TurnStats;
}
