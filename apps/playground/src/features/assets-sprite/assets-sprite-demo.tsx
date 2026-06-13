"use client";

import { useEffect, useRef, useState } from "react";
import { createSpriteWorld } from "./create-sprite-world";

export function AssetsSpriteDemo() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [status, setStatus] = useState("waiting");

  useEffect(() => {
    const context = canvasRef.current?.getContext("2d");

    if (!context) {
      setStatus("unavailable");
      return;
    }

    const { world, assets } = createSpriteWorld(context);
    world.update(0);
    setStatus(`${world.getEntityCount()} sprites / asset ${assets.hasImage("robot") ? "ready" : "missing"}`);
  }, []);

  return (
    <div className="demo-grid">
      <section className="panel" aria-label="Assets and sprite facts">
        <p className="lesson-kicker">Demo 06</p>
        <h1>Assets & Sprite</h1>
        <p className="copy">AssetStore 保存图片资源，SpriteRenderer 通过 imageKey 引用资源。</p>
        <div className="fact">
          <span>Store</span>
          <strong>AssetStore</strong>
        </div>
        <div className="fact">
          <span>Status</span>
          <strong>{status}</strong>
        </div>
      </section>
      <section className="canvas-panel" aria-label="Sprite renderer output">
        <canvas ref={canvasRef} width={640} height={360} />
      </section>
    </div>
  );
}
