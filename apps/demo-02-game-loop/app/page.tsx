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

function createSimulation() {
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
    .addComponent(fast, Position, { x: 48, y: 90 })
    .addComponent(fast, Velocity, { x: 120, y: 0 });
  world
    .addComponent(slow, Position, { x: 48, y: 210 })
    .addComponent(slow, Velocity, { x: 72, y: 0 });
  world.addSystem(movement);

  for (const delta of [0.016, 0.033, 0.05, 0.1, 0.2]) {
    engine.step(delta);
  }

  return {
    world,
    entities: [
      { id: fast, label: "Fast", position: world.requireComponent<Position>(fast, Position) },
      { id: slow, label: "Slow", position: world.requireComponent<Position>(slow, Position) }
    ]
  };
}

export default function Home() {
  const { world, entities } = createSimulation();

  return (
    <main>
      <div className="shell">
        <section className="panel">
          <p className="eyebrow">Demo 02</p>
          <h1>Game Loop</h1>
          <p>Engine.step 连续推进世界状态，系统根据 deltaTime 更新组件。</p>
          <div className="stat">
            <span>Frame</span>
            <strong>{world.frame}</strong>
          </div>
          <div className="stat">
            <span>Elapsed</span>
            <strong>{world.elapsedTime.toFixed(3)}s</strong>
          </div>
          <div className="stat">
            <span>Systems</span>
            <strong>{world.getSystems().length}</strong>
          </div>
        </section>
        <section className="track" aria-label="Game loop track">
          {entities.map((entity) => (
            <div
              className={entity.label === "Slow" ? "runner slow" : "runner"}
              key={entity.id}
              style={{ left: entity.position.x, top: entity.position.y }}
            >
              {entity.label}
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
