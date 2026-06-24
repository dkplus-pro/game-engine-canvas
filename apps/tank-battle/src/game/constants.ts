export const FIELD_COLUMNS = 26;
export const FIELD_ROWS = 26;
export const TILE_SIZE = 16;
export const LOGICAL_WIDTH = FIELD_COLUMNS * TILE_SIZE;
export const LOGICAL_HEIGHT = FIELD_ROWS * TILE_SIZE;
export const TANK_SIZE = 14;
export const BULLET_SPEED = 186;
export const PLAYER_SPEED = 64;
export const ENEMY_SPEED = 38;
export const PLAYER_FIRE_COOLDOWN = 0.34;
export const ENEMY_FIRE_COOLDOWN = 1.35;

export const Tile = {
  Empty: 0,
  Brick: 1,
  Steel: 2,
  Water: 3,
  Grass: 4,
  Base: 5
} as const;

export const directions = ["up", "right", "down", "left"] as const;

export const directionVectors = {
  up: { x: 0, y: -1 },
  right: { x: 1, y: 0 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 }
} as const;
