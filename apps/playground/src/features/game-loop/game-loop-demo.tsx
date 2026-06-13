import { createGameLoopSimulation } from "./create-game-loop-simulation";

export function GameLoopDemo() {
  const { world, entities } = createGameLoopSimulation();

  return (
    <div className="demo-grid">
      <section className="panel" aria-label="Game loop facts">
        <p className="lesson-kicker">Demo 02</p>
        <h1>Game Loop</h1>
        <p className="copy">Engine.step 连续推进世界状态，系统根据 deltaTime 更新组件。</p>
        <div className="fact">
          <span>Frame</span>
          <strong>{world.frame}</strong>
        </div>
        <div className="fact">
          <span>Elapsed</span>
          <strong>{world.elapsedTime.toFixed(3)}s</strong>
        </div>
        <div className="fact">
          <span>Systems</span>
          <strong>{world.getSystems().length}</strong>
        </div>
      </section>
      <section className="stage" aria-label="Game loop stage">
        {entities.map((entity) => (
          <div
            className={entity.label === "Slow" ? "entity warn" : "entity moving"}
            key={entity.id}
            style={{ left: entity.position.x, top: entity.position.y }}
          >
            {entity.label}
          </div>
        ))}
      </section>
    </div>
  );
}
