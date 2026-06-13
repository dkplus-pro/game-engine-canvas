import { createMathSnapshot } from "./create-math-snapshot";

export function MathDemo() {
  const snapshot = createMathSnapshot();

  return (
    <div className="demo-grid">
      <section className="panel" aria-label="Math facts">
        <p className="lesson-kicker">Demo 03</p>
        <h1>Math Primitives</h1>
        <p className="copy">Vec2 处理位置和方向，Rect 处理范围、边界和相交。</p>
        <div className="fact">
          <span>Distance</span>
          <strong>{snapshot.distance.toFixed(2)}</strong>
        </div>
        <div className="fact">
          <span>Blend</span>
          <strong>{snapshot.blend.toFixed(0)}%</strong>
        </div>
        <div className="fact">
          <span>Intersects</span>
          <strong>{snapshot.intersects ? "true" : "false"}</strong>
        </div>
        <div className="fact">
          <span>Clamped X</span>
          <strong>{snapshot.next.x.toFixed(1)}</strong>
        </div>
      </section>
      <section className="stage" aria-label="Math primitive stage">
        <div
          className="math-bounds"
          style={{
            left: snapshot.bounds.x,
            top: snapshot.bounds.y,
            width: snapshot.bounds.width,
            height: snapshot.bounds.height
          }}
        />
        <div
          className="math-sensor"
          style={{
            left: snapshot.sensor.x,
            top: snapshot.sensor.y,
            width: snapshot.sensor.width,
            height: snapshot.sensor.height
          }}
        >
          Sensor
        </div>
        <div className="math-point start" style={{ left: snapshot.start.x, top: snapshot.start.y }} />
        <div className="math-point target" style={{ left: snapshot.target.x, top: snapshot.target.y }} />
        <div className="math-path" />
        <div
          className="entity moving"
          style={{ left: snapshot.next.x, top: snapshot.next.y }}
        >
          Vec2
          <small>Rect</small>
        </div>
      </section>
    </div>
  );
}
