import { Engine, World, type System } from "@game-engine-canvas/engine";

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

export function createGameLoopSimulation() {
  const world = new World();
  const engine = new Engine({ world, maxDeltaTime: 0.2 });
  const fast = world.createEntity();
  const slow = world.createEntity();
  const movement: System = {
    name: "MovementSystem",
    update: ({ world: currentWorld, deltaTime }) => {
      for (const result of currentWorld.query(Position, Velocity)) {
        const position = result.get<Position>(Position);
        const velocity = result.get<Velocity>(Velocity);
        position.x += velocity.x * deltaTime;
        position.y += velocity.y * deltaTime;
      }
    }
  };

  world
    .addComponent<Position>(fast, Position, { x: 48, y: 90 })
    .addComponent<Velocity>(fast, Velocity, { x: 120, y: 0 });
  world
    .addComponent<Position>(slow, Position, { x: 48, y: 210 })
    .addComponent<Velocity>(slow, Velocity, { x: 72, y: 0 });
  world.addSystem(movement);

  for (const delta of [0.016, 0.033, 0.05, 0.1, 0.2]) {
    engine.step(delta);
  }

  return {
    world,
    entities: [
      {
        id: fast,
        label: "Fast",
        position: world.requireComponent<Position>(fast, Position)
      },
      {
        id: slow,
        label: "Slow",
        position: world.requireComponent<Position>(slow, Position)
      }
    ]
  };
}
