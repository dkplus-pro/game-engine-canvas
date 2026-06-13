import { createCollisionSample } from "./create-collision-sample";

export function CollisionDemo() {
  const { entities, collisions } = createCollisionSample();
  const collidingIds = new Set(collisions.flatMap((pair) => [pair.a, pair.b]));

  return (
    <div className="demo-grid">
      <section className="panel" aria-label="Collision facts">
        <p className="lesson-kicker">Demo 08</p>
        <h1>Collision</h1>
        <p className="copy">CollisionSystem 每帧查询 Transform2D + AabbCollider。</p>
        <div className="fact">
          <span>Entities</span>
          <strong>{entities.length}</strong>
        </div>
        <div className="fact">
          <span>Pairs</span>
          <strong>{collisions.length}</strong>
        </div>
      </section>
      <section className="stage" aria-label="Collision stage">
        {entities.map((item) => (
          <div
            className={collidingIds.has(item.entity) ? "collision-box hit" : "collision-box"}
            key={item.entity}
            style={{
              left: item.box.x,
              top: item.box.y,
              width: item.box.width,
              height: item.box.height
            }}
          >
            {item.name}
          </div>
        ))}
      </section>
    </div>
  );
}
