import { World, createEngine, type System } from "@game-engine-canvas/engine";

interface Name {
  value: string;
}

interface Position {
  x: number;
  y: number;
}

interface Velocity {
  x: number;
  y: number;
}

const Name = "name";
const Position = "position";
const Velocity = "velocity";

export function createEcsBasicWorld() {
  const engine = createEngine();
  const world = new World();
  const player = world.createEntity();
  const drone = world.createEntity();
  const marker = world.createEntity();
  const movementSystem: System = {
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
    .addComponent<Name>(player, Name, { value: "Player" })
    .addComponent<Position>(player, Position, { x: 80, y: 80 })
    .addComponent<Velocity>(player, Velocity, { x: 60, y: 20 });

  world
    .addComponent<Name>(drone, Name, { value: "Drone" })
    .addComponent<Position>(drone, Position, { x: 240, y: 180 })
    .addComponent<Velocity>(drone, Velocity, { x: -25, y: 40 });

  world
    .addComponent<Name>(marker, Name, { value: "Marker" })
    .addComponent<Position>(marker, Position, { x: 390, y: 120 });

  world.addSystem(movementSystem);
  world.update(1);

  return {
    engine,
    world,
    entities: world.query(Name, Position).map((result) => {
      const name = result.get<Name>(Name);
      const position = result.get<Position>(Position);
      const velocity = result.tryGet<Velocity>(Velocity);

      return {
        id: result.entity,
        name: name.value,
        x: position.x,
        y: position.y,
        moving: Boolean(velocity)
      };
    })
  };
}
