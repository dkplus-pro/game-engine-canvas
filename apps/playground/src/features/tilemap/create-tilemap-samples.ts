import { generateCave, generateDungeon } from "@game-engine-canvas/engine";

export function createTileMapSamples() {
  const dungeon = generateDungeon({
    width: 34,
    height: 22,
    seed: 12,
    roomAttempts: 28,
    minRoomSize: 4,
    maxRoomSize: 8
  });
  const cave = generateCave({
    width: 34,
    height: 22,
    seed: 23,
    fillChance: 0.46,
    smoothingSteps: 5
  });

  return {
    dungeon,
    cave
  };
}
