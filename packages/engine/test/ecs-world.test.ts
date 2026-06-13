import { describe, expect, it } from "vitest";
import { World, type System } from "../src";

interface Position {
  x: number;
  y: number;
}

interface Velocity {
  x: number;
  y: number;
}

const Position = "position";
const Velocity = "velocity";

describe("World", () => {
  it("creates and destroys entities", () => {
    const world = new World();
    const entity = world.createEntity();

    expect(world.hasEntity(entity)).toBe(true);
    expect(world.getEntityCount()).toBe(1);
    expect(world.destroyEntity(entity)).toBe(true);
    expect(world.hasEntity(entity)).toBe(false);
  });

  it("stores components by entity and component type", () => {
    const world = new World();
    const entity = world.createEntity();

    world.addComponent<Position>(entity, Position, { x: 2, y: 4 });

    expect(world.hasComponent(entity, Position)).toBe(true);
    expect(world.getComponent<Position>(entity, Position)).toEqual({
      x: 2,
      y: 4
    });
  });

  it("queries entities that contain every requested component", () => {
    const world = new World();
    const moving = world.createEntity();
    const staticEntity = world.createEntity();

    world.addComponent<Position>(moving, Position, { x: 0, y: 0 });
    world.addComponent<Velocity>(moving, Velocity, { x: 10, y: 0 });
    world.addComponent<Position>(staticEntity, Position, { x: 20, y: 20 });

    const matches = world.query(Position, Velocity);

    expect(matches).toHaveLength(1);
    expect(matches[0]?.entity).toBe(moving);
    expect(matches[0]?.get<Position>(Position)).toEqual({ x: 0, y: 0 });
  });

  it("runs systems in priority order", () => {
    const world = new World();
    const calls: string[] = [];

    world.addSystem(
      {
        update: () => calls.push("second")
      },
      2
    );
    world.addSystem(
      {
        update: () => calls.push("first")
      },
      1
    );

    world.update(0.016);

    expect(calls).toEqual(["first", "second"]);
    expect(world.frame).toBe(1);
    expect(world.elapsedTime).toBe(0.016);
  });

  it("lets systems update matching components", () => {
    const world = new World();
    const entity = world.createEntity();
    const movementSystem: System = {
      update: ({ world: currentWorld, deltaTime }) => {
        for (const result of currentWorld.query(Position, Velocity)) {
          const position = result.get<Position>(Position);
          const velocity = result.get<Velocity>(Velocity);
          position.x += velocity.x * deltaTime;
          position.y += velocity.y * deltaTime;
        }
      }
    };

    world.addComponent<Position>(entity, Position, { x: 1, y: 1 });
    world.addComponent<Velocity>(entity, Velocity, { x: 5, y: -2 });
    world.addSystem(movementSystem);
    world.update(2);

    expect(world.getComponent<Position>(entity, Position)).toEqual({
      x: 11,
      y: -3
    });
  });
});
