import { Vec2 } from "@game-engine-canvas/engine";

export const TABLE_WIDTH = 1000;
export const TABLE_HEIGHT = 560;
export const RAIL_SIZE = 42;
export const PLAY_MIN_X = RAIL_SIZE;
export const PLAY_MAX_X = TABLE_WIDTH - RAIL_SIZE;
export const PLAY_MIN_Y = RAIL_SIZE;
export const PLAY_MAX_Y = TABLE_HEIGHT - RAIL_SIZE;
export const BALL_RADIUS = 12;
export const POCKET_RADIUS = 28;
export const FRICTION_PER_SECOND = 0.985;
export const STOP_SPEED = 4;
export const MAX_SHOT_SPEED = 920;
export const MIN_SHOT_SPEED = 140;
export const CUSHION_RESTITUTION = 0.86;
export const BALL_RESTITUTION = 0.97;
export const SHOT_SETTLE_DELAY = 0.16;

export const CUE_START = new Vec2(PLAY_MIN_X + 230, TABLE_HEIGHT / 2);
export const RACK_APEX = new Vec2(PLAY_MAX_X - 250, TABLE_HEIGHT / 2);
export const HEAD_SPOT = new Vec2(PLAY_MIN_X + 235, TABLE_HEIGHT / 2);

export const pockets = [
  new Vec2(PLAY_MIN_X, PLAY_MIN_Y),
  new Vec2(TABLE_WIDTH / 2, PLAY_MIN_Y - 4),
  new Vec2(PLAY_MAX_X, PLAY_MIN_Y),
  new Vec2(PLAY_MIN_X, PLAY_MAX_Y),
  new Vec2(TABLE_WIDTH / 2, PLAY_MAX_Y + 4),
  new Vec2(PLAY_MAX_X, PLAY_MAX_Y)
] as const;

export const ballPalette: Record<number, { readonly fill: string; readonly stripe?: string }> = {
  1: { fill: "#facc15" },
  2: { fill: "#2563eb" },
  3: { fill: "#ef4444" },
  4: { fill: "#7c3aed" },
  5: { fill: "#f97316" },
  6: { fill: "#16a34a" },
  7: { fill: "#7f1d1d" },
  8: { fill: "#111827" },
  9: { fill: "#f8fafc", stripe: "#facc15" },
  10: { fill: "#f8fafc", stripe: "#2563eb" },
  11: { fill: "#f8fafc", stripe: "#ef4444" },
  12: { fill: "#f8fafc", stripe: "#7c3aed" },
  13: { fill: "#f8fafc", stripe: "#f97316" },
  14: { fill: "#f8fafc", stripe: "#16a34a" },
  15: { fill: "#f8fafc", stripe: "#7f1d1d" }
};
