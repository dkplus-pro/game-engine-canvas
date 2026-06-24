import type { TileMap } from "@game-engine-canvas/engine";
import type { directions, Tile } from "./constants";

export type Direction = (typeof directions)[number];
export type TileKind = (typeof Tile)[keyof typeof Tile];
export type TankTeam = "player" | "enemy";
export type GameStatus = "playing" | "paused" | "won" | "lost";
export type PowerUpKind = "shield" | "rapid" | "repair" | "freeze";

export interface TankLevelConfig {
  readonly id: number;
  readonly name: string;
  readonly seed: number;
  readonly enemyBudget: number;
  readonly maxActiveEnemies: number;
  readonly steelRate: number;
  readonly waterRate: number;
  readonly grassRate: number;
  readonly brickRate: number;
  readonly powerUpRate: number;
}

export interface TankLevel {
  readonly config: TankLevelConfig;
  readonly map: TileMap;
  readonly playerSpawn: Point;
  readonly enemySpawns: Point[];
  readonly baseTiles: Point[];
}

export interface Point {
  readonly x: number;
  readonly y: number;
}

export interface Tank {
  readonly id: string;
  readonly team: TankTeam;
  x: number;
  y: number;
  direction: Direction;
  speed: number;
  fireCooldown: number;
  aiTimer: number;
  shieldTime: number;
  rapidTime: number;
  spawnGrace: number;
}

export interface Bullet {
  readonly id: string;
  readonly ownerId: string;
  readonly team: TankTeam;
  x: number;
  y: number;
  vx: number;
  vy: number;
  ttl: number;
  power: number;
}

export interface PowerUp {
  readonly id: string;
  readonly kind: PowerUpKind;
  readonly x: number;
  readonly y: number;
  ttl: number;
}

export interface Explosion {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  age: number;
  duration: number;
}

export interface TankCommand {
  readonly direction?: Direction;
  readonly fire: boolean;
  readonly pausePressed: boolean;
}

export interface TankBattleState {
  readonly level: TankLevel;
  readonly rng: () => number;
  status: GameStatus;
  player: Tank;
  enemies: Tank[];
  bullets: Bullet[];
  powerUps: PowerUp[];
  explosions: Explosion[];
  score: number;
  lives: number;
  enemyReserve: number;
  spawnTimer: number;
  freezeTimer: number;
  message: string;
  elapsedTime: number;
  nextId: number;
}

export interface HudSnapshot {
  readonly level: number;
  readonly score: number;
  readonly lives: number;
  readonly enemiesLeft: number;
  readonly status: GameStatus;
  readonly message: string;
}
