import { describe, expect, it } from "vitest";
import {
  AabbCollider,
  CollisionSystem,
  InputState,
  TileMap,
  Transform2D,
  World,
  createSeededRandom,
  randomInt
} from "../src";

const tile = {
  ground: 0,
  brick: 1,
  steel: 2,
  river: 3,
  grass: 4,
  base: 5
} as const;

function tankCanEnter(value: number): boolean {
  return value === tile.ground || value === tile.grass;
}

function bulletCanDestroy(value: number): boolean {
  return value === tile.brick || value === tile.base;
}

describe("tank battle engine contracts", () => {
  it("supports deterministic level tile maps with destructible walls", () => {
    const map = new TileMap(13, 13, tile.ground);
    const random = createSeededRandom(1990);

    for (let x = 0; x < map.width; x += 1) {
      map.set(x, 0, tile.steel).set(x, map.height - 1, tile.steel);
    }

    for (let attempt = 0; attempt < 12; attempt += 1) {
      map.set(
        randomInt(random, 1, map.width - 2),
        randomInt(random, 1, map.height - 2),
        tile.brick
      );
    }

    map.set(6, 11, tile.base).set(6, 10, tile.brick);

    const snapshot = map.toRows();
    const replay = new TileMap(13, 13, tile.ground);
    const replayRandom = createSeededRandom(1990);

    for (let x = 0; x < replay.width; x += 1) {
      replay.set(x, 0, tile.steel).set(x, replay.height - 1, tile.steel);
    }

    for (let attempt = 0; attempt < 12; attempt += 1) {
      replay.set(
        randomInt(replayRandom, 1, replay.width - 2),
        randomInt(replayRandom, 1, replay.height - 2),
        tile.brick
      );
    }

    replay.set(6, 11, tile.base).set(6, 10, tile.brick);

    expect(replay.toRows()).toEqual(snapshot);
    expect(tankCanEnter(map.get(1, 1))).toBe(true);
    expect(tankCanEnter(tile.river)).toBe(false);
    expect(tankCanEnter(tile.steel)).toBe(false);
    expect(bulletCanDestroy(map.get(6, 10))).toBe(true);
    expect(bulletCanDestroy(tile.steel)).toBe(false);

    const destroyed = map.clone().set(6, 10, tile.ground);
    expect(destroyed.get(6, 10)).toBe(tile.ground);
    expect(map.get(6, 10)).toBe(tile.brick);
  });

  it("detects bullet hits against tanks and the protected base", () => {
    const world = new World();
    const collisions = new CollisionSystem();
    const playerBullet = world.createEntity();
    const enemyTank = world.createEntity();
    const base = world.createEntity();
    const distantBullet = world.createEntity();

    world
      .addComponent(playerBullet, Transform2D, new Transform2D({ position: { x: 64, y: 64 } }))
      .addComponent(
        playerBullet,
        AabbCollider,
        new AabbCollider({ width: 6, height: 10, layer: "player-bullet" })
      );
    world
      .addComponent(enemyTank, Transform2D, new Transform2D({ position: { x: 66, y: 66 } }))
      .addComponent(
        enemyTank,
        AabbCollider,
        new AabbCollider({ width: 28, height: 28, layer: "enemy" })
      );
    world
      .addComponent(base, Transform2D, new Transform2D({ position: { x: 160, y: 192 } }))
      .addComponent(
        base,
        AabbCollider,
        new AabbCollider({ width: 32, height: 32, layer: "base" })
      );
    world
      .addComponent(distantBullet, Transform2D, new Transform2D({ position: { x: 260, y: 260 } }))
      .addComponent(
        distantBullet,
        AabbCollider,
        new AabbCollider({ width: 6, height: 10, layer: "enemy-bullet" })
      );

    world.addSystem(collisions);
    world.update(1 / 60);

    expect(collisions.hasCollision(playerBullet, enemyTank)).toBe(true);
    expect(collisions.hasCollision(distantBullet, base)).toBe(false);
    expect(world.getComponent(base, AabbCollider)?.options.layer).toBe("base");
  });

  it("keeps pause, restart, movement, and fire input as frame-safe transitions", () => {
    const input = new InputState();

    input.keyDown("KeyW");
    input.keyDown("Space");
    input.keyDown("KeyP");

    expect(input.isKeyDown("KeyW")).toBe(true);
    expect(input.wasKeyPressed("Space")).toBe(true);
    expect(input.wasKeyPressed("KeyP")).toBe(true);

    input.endFrame();

    expect(input.isKeyDown("KeyW")).toBe(true);
    expect(input.wasKeyPressed("Space")).toBe(false);
    expect(input.wasKeyPressed("KeyP")).toBe(false);

    input.keyUp("KeyW");
    input.keyDown("KeyR");

    expect(input.wasKeyReleased("KeyW")).toBe(true);
    expect(input.wasKeyPressed("KeyR")).toBe(true);
  });
});
