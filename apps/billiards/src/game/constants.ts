import { Rect, Vec2 } from "@game-engine-canvas/engine";

export const LOGICAL_WIDTH = 1200;
export const LOGICAL_HEIGHT = 680;
export const BALL_RADIUS = 14;
export const BALL_DIAMETER = BALL_RADIUS * 2;
export const POCKET_RADIUS = 30;
export const MAX_SHOT_POWER = 920;
export const MIN_SHOT_POWER = 180;
export const DEFAULT_SHOT_POWER = 420;
export const TABLE_RECT = new Rect(76, 70, 1048, 540);
export const HEAD_SPOT = new Vec2(TABLE_RECT.x + TABLE_RECT.width * 0.25, TABLE_RECT.y + TABLE_RECT.height / 2);
export const FOOT_SPOT = new Vec2(TABLE_RECT.x + TABLE_RECT.width * 0.72, TABLE_RECT.y + TABLE_RECT.height / 2);
export const STOP_SPEED = 8;
export const LINEAR_FRICTION = 0.985;
export const ROLLING_FRICTION = 34;
export const CUSHION_RESTITUTION = 0.86;
export const BALL_RESTITUTION = 0.96;

export const pockets = [
  new Vec2(TABLE_RECT.left, TABLE_RECT.top),
  new Vec2(TABLE_RECT.left + TABLE_RECT.width / 2, TABLE_RECT.top - 4),
  new Vec2(TABLE_RECT.right, TABLE_RECT.top),
  new Vec2(TABLE_RECT.left, TABLE_RECT.bottom),
  new Vec2(TABLE_RECT.left + TABLE_RECT.width / 2, TABLE_RECT.bottom + 4),
  new Vec2(TABLE_RECT.right, TABLE_RECT.bottom)
] as const;

export const ballPalette = [
  "#f8fafc",
  "#facc15",
  "#2563eb",
  "#ef4444",
  "#7c3aed",
  "#f97316",
  "#22c55e",
  "#7f1d1d",
  "#111827",
  "#facc15",
  "#2563eb",
  "#ef4444",
  "#7c3aed",
  "#f97316",
  "#22c55e",
  "#7f1d1d"
] as const;
