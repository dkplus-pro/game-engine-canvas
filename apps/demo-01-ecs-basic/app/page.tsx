import { createEngine } from "@game-engine-canvas/engine";

export default function Home() {
  const engine = createEngine();

  return (
    <main>
      <div className="workspace">
        <section className="panel" aria-labelledby="demo-title">
          <p className="eyebrow">Demo 01</p>
          <h1 id="demo-title">ECS Basic</h1>
          <p>
            这个页面先验证 Next.js app 可以通过 workspace 依赖加载本地
            engine 包。下一步会把这里替换成真正的 ECS 实体视图。
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
          </div>
        </section>
        <section className="stage" aria-label="Engine preview canvas">
          <div className="entity" />
          <div className="entity secondary" />
          <div className="entity tertiary" />
        </section>
      </div>
    </main>
  );
}
