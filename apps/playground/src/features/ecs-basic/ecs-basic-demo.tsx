import { createEcsBasicWorld } from "./create-ecs-basic-world";

export function EcsBasicDemo() {
  const { engine, world, entities } = createEcsBasicWorld();

  return (
    <div className="demo-grid">
      <section className="panel" aria-label="ECS facts">
        <p className="lesson-kicker">Demo 01</p>
        <h1>ECS Basic</h1>
        <p className="copy">真实创建 ECS World，并运行一次 MovementSystem。</p>
        <div className="fact">
          <span>Package</span>
          <strong>{engine.name}</strong>
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
      </section>
      <section className="stage" aria-label="ECS entity stage">
        {entities.map((entity) => (
          <div
            className={entity.moving ? "entity moving" : "entity"}
            key={entity.id}
            style={{ left: entity.x, top: entity.y }}
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
  );
}
