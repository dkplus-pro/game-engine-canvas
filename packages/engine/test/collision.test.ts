import { describe, expect, it } from "vitest";
import { AabbCollider, CollisionSystem, Transform2D, World, getAabb } from "../src";

describe("CollisionSystem", () => {
  it("detects AABB intersections", () => {
    const world = new World();
    const collisionSystem = new CollisionSystem();
    const a = world.createEntity();
    const b = world.createEntity();
    const c = world.createEntity();

    world
      .addComponent(a, Transform2D, new Transform2D({ position: { x: 20, y: 20 } }))
      .addComponent(a, AabbCollider, new AabbCollider({ width: 20, height: 20 }));
    world
      .addComponent(b, Transform2D, new Transform2D({ position: { x: 30, y: 20 } }))
      .addComponent(b, AabbCollider, new AabbCollider({ width: 20, height: 20 }));
    world
      .addComponent(c, Transform2D, new Transform2D({ position: { x: 90, y: 90 } }))
      .addComponent(c, AabbCollider, new AabbCollider({ width: 20, height: 20 }));

    world.addSystem(collisionSystem);
    world.update(0);

    expect(collisionSystem.hasCollision(a, b)).toBe(true);
    expect(collisionSystem.hasCollision(a, c)).toBe(false);
  });

  it("builds world-space rectangles from transforms", () => {
    const rect = getAabb(
      new Transform2D({ position: { x: 50, y: 60 } }),
      new AabbCollider({ width: 20, height: 10, offset: { x: 5, y: 0 } })
    );

    expect(rect).toMatchObject({ x: 45, y: 55, width: 20, height: 10 });
  });
});
