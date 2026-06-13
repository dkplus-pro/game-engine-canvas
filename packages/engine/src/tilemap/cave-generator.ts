import { TileMap } from "./tile-map";
import { createSeededRandom } from "./random";

export interface CaveGeneratorOptions {
  readonly width: number;
  readonly height: number;
  readonly seed?: number;
  readonly fillChance?: number;
  readonly smoothingSteps?: number;
}

export function generateCave(options: CaveGeneratorOptions): TileMap {
  const random = createSeededRandom(options.seed ?? 1);
  let map = new TileMap(options.width, options.height, 1);
  const fillChance = options.fillChance ?? 0.45;
  const steps = options.smoothingSteps ?? 4;

  for (let y = 1; y < options.height - 1; y += 1) {
    for (let x = 1; x < options.width - 1; x += 1) {
      map.set(x, y, random() < fillChance ? 1 : 0);
    }
  }

  for (let step = 0; step < steps; step += 1) {
    map = smooth(map);
  }

  return map;
}

function smooth(map: TileMap): TileMap {
  const next = map.clone();

  for (let y = 1; y < map.height - 1; y += 1) {
    for (let x = 1; x < map.width - 1; x += 1) {
      const walls = countWalls(map, x, y);
      next.set(x, y, walls >= 5 ? 1 : 0);
    }
  }

  return next;
}

function countWalls(map: TileMap, x: number, y: number): number {
  let walls = 0;

  for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
    for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
      if (offsetX === 0 && offsetY === 0) {
        continue;
      }

      walls += map.get(x + offsetX, y + offsetY) === 1 ? 1 : 0;
    }
  }

  return walls;
}
