import { describe, expect, it } from "vitest";
import { FIELD_COLUMNS, FIELD_ROWS, Tile } from "../src/game/constants";
import { getLevelConfig } from "../src/game/levels";
import { generateTankLevel, isTankBlockedTile } from "../src/game/map-generator";

function rowsFor(levelId: number) {
  return generateTankLevel(getLevelConfig(levelId)).map.toRows();
}

describe("tank level generator", () => {
  it("generates deterministic selectable levels", () => {
    expect(rowsFor(2)).toEqual(rowsFor(2));
    expect(rowsFor(1)).not.toEqual(rowsFor(4));
  });

  it("keeps spawn lanes and protected base constraints", () => {
    const level = generateTankLevel(getLevelConfig(3));

    expect(level.map.width).toBe(FIELD_COLUMNS);
    expect(level.map.height).toBe(FIELD_ROWS);
    for (const spawn of [level.playerSpawn, ...level.enemySpawns]) {
      expect(isTankBlockedTile(level.map.get(spawn.x, spawn.y))).toBe(false);
    }
    for (const base of level.baseTiles) {
      expect(level.map.get(base.x, base.y)).toBe(Tile.Base);
    }
    expect(level.map.count(Tile.Brick) + level.map.count(Tile.Steel)).toBeGreaterThan(24);
  });
});
