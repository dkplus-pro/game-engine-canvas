import type { Vec2 } from "@game-engine-canvas/engine";

export type PlayerId = 1 | 2;
export type BallGroup = "solids" | "stripes";
export type BallKind = "cue" | "solid" | "stripe" | "eight";
export type GameStatus = "aiming" | "rolling" | "paused" | "won";

export interface Ball {
  readonly id: string;
  readonly number: number;
  readonly kind: BallKind;
  position: Vec2;
  velocity: Vec2;
  pocketed: boolean;
}

export interface PlayerState {
  readonly id: PlayerId;
  group?: BallGroup;
}

export interface ShotRecord {
  pocketedNumbers: number[];
  cuePocketed: boolean;
  cushionHits: number;
  collisions: number;
  elapsedAfterStop: number;
}

export interface BilliardsStats {
  shots: number;
  collisions: number;
  pockets: number;
  fouls: number;
}

export interface BilliardsState {
  balls: Ball[];
  players: Record<PlayerId, PlayerState>;
  currentPlayer: PlayerId;
  status: GameStatus;
  previousStatus: Exclude<GameStatus, "paused">;
  winner?: PlayerId;
  message: string;
  aimAngle: number;
  shotPower: number;
  shot?: ShotRecord;
  stats: BilliardsStats;
}

export interface BilliardsCommand {
  readonly aimAt?: Vec2;
  readonly shoot?: {
    readonly angle: number;
    readonly power: number;
  };
  readonly pausePressed: boolean;
}

export interface HudSnapshot {
  readonly currentPlayer: PlayerId;
  readonly status: GameStatus;
  readonly stateLabel: string;
  readonly playerOneGroup: string;
  readonly playerTwoGroup: string;
  readonly solidsLeft: number;
  readonly stripesLeft: number;
  readonly shots: number;
  readonly message: string;
  readonly power: number;
}

export interface TableMetrics {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly scale: number;
}
