import { describe, expect, it } from "vitest";
import { TileMap, generateCave, generateDungeon } from "../src";

describe("TileMap", () => {
  it("stores tile values in rows", () => {
    const map = new TileMap(3, 2, 1);

    map.set(1, 0, 0);

    expect(map.get(1, 0)).toBe(0);
    expect(map.count(1)).toBe(5);
    expect(map.toRows()).toEqual([
      [1, 0, 1],
      [1, 1, 1]
    ]);
  });
});

describe("map generators", () => {
  it("generates deterministic dungeon rooms and floors", () => {
    const first = generateDungeon({ width: 30, height: 20, seed: 7 });
    const second = generateDungeon({ width: 30, height: 20, seed: 7 });

    expect(first.rooms.length).toBeGreaterThan(0);
    expect(first.map.count(0)).toBeGreaterThan(0);
    expect(first.map.toRows()).toEqual(second.map.toRows());
  });

  it("generates deterministic caves", () => {
    const cave = generateCave({ width: 24, height: 16, seed: 9 });

    expect(cave.count(0)).toBeGreaterThan(0);
    expect(cave.count(1)).toBeGreaterThan(0);
  });
});
