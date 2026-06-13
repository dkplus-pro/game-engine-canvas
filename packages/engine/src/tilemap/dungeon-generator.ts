import { Rect } from "../math";
import { TileMap } from "./tile-map";
import { createSeededRandom, randomInt } from "./random";

export interface DungeonGeneratorOptions {
  readonly width: number;
  readonly height: number;
  readonly seed?: number;
  readonly roomAttempts?: number;
  readonly minRoomSize?: number;
  readonly maxRoomSize?: number;
}

export interface DungeonResult {
  readonly map: TileMap;
  readonly rooms: Rect[];
}

export function generateDungeon(options: DungeonGeneratorOptions): DungeonResult {
  const random = createSeededRandom(options.seed ?? 1);
  const map = new TileMap(options.width, options.height, 1);
  const rooms: Rect[] = [];
  const attempts = options.roomAttempts ?? 20;
  const minSize = options.minRoomSize ?? 4;
  const maxSize = options.maxRoomSize ?? 8;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const width = randomInt(random, minSize, maxSize);
    const height = randomInt(random, minSize, maxSize);
    const room = new Rect(
      randomInt(random, 1, options.width - width - 2),
      randomInt(random, 1, options.height - height - 2),
      width,
      height
    );

    if (rooms.some((existing) => existing.intersects(room))) {
      continue;
    }

    rooms.push(room);
    carveRoom(map, room);
  }

  for (let index = 1; index < rooms.length; index += 1) {
    const from = rooms[index - 1]?.center;
    const to = rooms[index]?.center;

    if (from && to) {
      carveCorridor(map, Math.floor(from.x), Math.floor(from.y), Math.floor(to.x), Math.floor(to.y));
    }
  }

  return { map, rooms };
}

function carveRoom(map: TileMap, room: Rect): void {
  for (let y = room.y; y < room.y + room.height; y += 1) {
    for (let x = room.x; x < room.x + room.width; x += 1) {
      map.set(x, y, 0);
    }
  }
}

function carveCorridor(map: TileMap, fromX: number, fromY: number, toX: number, toY: number): void {
  const stepX = fromX < toX ? 1 : -1;
  const stepY = fromY < toY ? 1 : -1;

  for (let x = fromX; x !== toX; x += stepX) {
    map.set(x, fromY, 0);
  }

  for (let y = fromY; y !== toY; y += stepY) {
    map.set(toX, y, 0);
  }

  map.set(toX, toY, 0);
}
