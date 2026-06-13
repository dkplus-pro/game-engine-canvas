"use client";

import { useEffect, useRef, useState } from "react";
import { createRenderWorld } from "./create-render-world";

export function CanvasRendererDemo() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [status, setStatus] = useState("waiting");

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) {
      setStatus("unavailable");
      return;
    }

    const world = createRenderWorld(context);
    world.update(0);
    setStatus(`rendered ${world.getEntityCount()} entities`);
  }, []);

  return (
    <div className="demo-grid">
      <section className="panel" aria-label="Canvas renderer facts">
        <p className="lesson-kicker">Demo 04</p>
        <h1>Canvas Renderer</h1>
        <p className="copy">RenderSystem 查询 Transform2D + ShapeRenderer 并绘制到 canvas。</p>
        <div className="fact">
          <span>Renderer</span>
          <strong>Canvas2D</strong>
        </div>
        <div className="fact">
          <span>Status</span>
          <strong>{status}</strong>
        </div>
      </section>
      <section className="canvas-panel" aria-label="Canvas renderer output">
        <canvas ref={canvasRef} width={640} height={360} />
      </section>
    </div>
  );
}
