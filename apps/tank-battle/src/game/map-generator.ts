import { Rect, TileMap, createSeededRandom } from "@game-engine-canvas/engine";
import { FIELD_COLUMNS, FIELD_ROWS, TILE_SIZE, Tile } from "./constants";
import type { Point, TankLevel, TankLevelConfig, TileKind } from "./types";

const baseTiles: Point[] = [
  { x: 12, y: 24 },
  { x: 13, y: 24 },
  { x: 12, y: 25 },
  { x: 13, y: 25 }
];
const enemySpawns: Point[] = [
  { x: 1, y: 1 },
  { x: 12, y: 1 },
  { x: 23, y: 1 }
];
const playerSpawn = { x: 8, y: 24 };

export function generateTankLevel(config: TankLevelConfig): TankLevel {
  const random = createSeededRandom(config.seed);
  const map = new TileMap(FIELD_COLUMNS, FIELD_ROWS, Tile.Empty);
  const reserved = createReservedZones();

  // Use 2x2 obstacle clusters to keep a readable classic 90-style grid.
  for (let y = 2; y < FIELD_ROWS - 2; y += 2) {
    for (let x = 2; x < FIELD_COLUMNS / 2; x += 2) {
      if (isReservedCluster(reserved, x, y)) {
        continue;
      }

      const tile = pickTerrainTile(random(), config);
      if (tile === Tile.Empty) {
        continue;
      }

      writeCluster(map, x, y, tile);
      const mirrorX = FIELD_COLUMNS - x - 2;
      if (!isReservedCluster(reserved, mirrorX, y) && random() > 0.34) {
        writeCluster(map, mirrorX, y, tile);
      }
    }
  }

  carveSpawnLanes(map);
  protectBase(map, config.id >= 3 ? Tile.Steel : Tile.Brick);
  for (const tile of baseTiles) {
    map.set(tile.x, tile.y, Tile.Base);
  }

  return { config, map, playerSpawn, enemySpawns, baseTiles };
}

export function tileToRect(point: Point): Rect {
  return new Rect(point.x * TILE_SIZE, point.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
}

export function getTileKind(map: TileMap, x: number, y: number): TileKind {
  return map.get(x, y) as TileKind;
}

export function isTankBlockedTile(tile: number): boolean {
  return tile === Tile.Brick || tile === Tile.Steel || tile === Tile.Water || tile === Tile.Base;
}

export function isBulletBlockedTile(tile: number): boolean {
  return tile === Tile.Brick || tile === Tile.Steel || tile === Tile.Base;
}

function pickTerrainTile(roll: number, config: TankLevelConfig): TileKind {
  if (roll < config.steelRate) return Tile.Steel;
  if (roll < config.steelRate + config.waterRate) return Tile.Water;
  if (roll < config.steelRate + config.waterRate + config.grassRate) return Tile.Grass;
  if (roll < config.steelRate + config.waterRate + config.grassRate + config.brickRate) {
    return Tile.Brick;
  }
  return Tile.Empty;
}

function writeCluster(map: TileMap, startX: number, startY: number, tile: TileKind): void {
  for (let y = startY; y < startY + 2; y += 1) {
    for (let x = startX; x < startX + 2; x += 1) {
      map.set(x, y, tile);
    }
  }
}

function createReservedZones(): Rect[] {
  const zones = [
    new Rect(0, 0, 4, 4),
    new Rect(10, 0, 6, 4),
    new Rect(22, 0, 4, 4),
    new Rect(6, 22, 5, 4),
    new Rect(10, 22, 6, 4),
    new Rect(16, 22, 5, 4)
  ];

  for (let lane = 0; lane < FIELD_ROWS; lane += 1) {
    zones.push(new Rect(12, lane, 2, 1));
  }

  return zones;
}

function isReservedCluster(zones: Rect[], x: number, y: number): boolean {
  const cluster = new Rect(x, y, 2, 2);
  return zones.some((zone) => zone.intersects(cluster));
}

function carveSpawnLanes(map: TileMap): void {
  const lanes = [1, 12, 13, 24];
  for (const x of lanes) {
    for (let y = 0; y < FIELD_ROWS; y += 1) {
      if (y < 4 || y > 21 || (x >= 12 && x <= 13)) {
        map.set(x, y, Tile.Empty);
      }
    }
  }
}

function protectBase(map: TileMap, shell: TileKind): void {
  for (let x = 11; x <= 14; x += 1) {
    map.set(x, 23, shell);
  }
  for (let y = 24; y <= 25; y += 1) {
    map.set(11, y, shell);
    map.set(14, y, shell);
  }
}
