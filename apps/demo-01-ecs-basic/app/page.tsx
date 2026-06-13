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

function createDemoWorld() {
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

  return world;
}

export default function Home() {
  const engine = createEngine();
  const world = createDemoWorld();
  const entities = world.query(Name, Position).map((result) => {
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
  });

  return (
    <main>
      <div className="workspace">
        <section className="panel" aria-labelledby="demo-title">
          <p className="eyebrow">Demo 01</p>
          <h1 id="demo-title">ECS Basic</h1>
          <p>
            这个页面创建了一个真实的 ECS World，并运行一次 MovementSystem。
            右侧位置来自组件查询结果。
          </p>
          <div className="engine-facts">
            <div className="fact">
              <span>Package</span>
              <strong>{engine.name}</strong>
            </div>
            <div className="fact">
              <span>Version</span>
              <strong>{engine.version}</strong>
            </div>
            <div className="fact">
              <span>Entities</span>
              <strong>{world.getEntityCount()}</strong>
            </div>
            <div className="fact">
              <span>Systems</span>
              <strong>{world.getSystems().length}</strong>
            </div>
            <div className="fact">
              <span>Frame</span>
              <strong>{world.frame}</strong>
            </div>
          </div>
        </section>
        <section className="stage" aria-label="Engine preview canvas">
          {entities.map((entity) => (
            <div
              className={entity.moving ? "entity moving" : "entity"}
              key={entity.id}
              style={{
                left: entity.x,
                top: entity.y
              }}
            >
              <span>{entity.name}</span>
              <small>#{entity.id}</small>
            </div>
          ))}
          <div className="entity-list">
            {entities.map((entity) => (
              <div className="entity-row" key={entity.id}>
                <span>{entity.name}</span>
                <strong>
                  x:{entity.x.toFixed(0)} y:{entity.y.toFixed(0)}
                </strong>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
