import {
  AabbCollider,
  CollisionSystem,
  Transform2D,
  World,
  getAabb
} from "@game-engine-canvas/engine";

export function createCollisionSample() {
  const world = new World();
  const system = new CollisionSystem();
  const specs = [
    { name: "Player", x: 180, y: 150, width: 96, height: 72 },
    { name: "Crate", x: 245, y: 175, width: 82, height: 72 },
    { name: "Wall", x: 430, y: 210, width: 110, height: 56 }
  ];
  const entities = specs.map((spec) => {
    const entity = world.createEntity();
    const transform = new Transform2D({ position: { x: spec.x, y: spec.y } });
    const collider = new AabbCollider({ width: spec.width, height: spec.height });

    world
      .addComponent(entity, Transform2D, transform)
      .addComponent(entity, AabbCollider, collider);

    return {
      entity,
      name: spec.name,
      box: getAabb(transform, collider)
    };
  });

  world.addSystem(system);
  world.update(0);

  return {
    entities,
    collisions: system.getCollisions()
  };
}
