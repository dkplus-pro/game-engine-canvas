"use client";

import { useEffect, useRef, useState } from "react";

const assetPath = "/assets/tank-battle-sprites.png";

export function TankBattleApp() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) {
      return;
    }

    const image = new Image();
    image.src = assetPath;

    const resize = () => {
      const pixelRatio = window.devicePixelRatio || 1;
      canvas.width = Math.floor(window.innerWidth * pixelRatio);
      canvas.height = Math.floor(window.innerHeight * pixelRatio);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      drawBootScreen(context, window.innerWidth, window.innerHeight, image.complete ? image : undefined);
    };

    image.addEventListener("load", resize);
    window.addEventListener("resize", resize);
    resize();
    setReady(true);

    return () => {
      image.removeEventListener("load", resize);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <main className="tank-app" aria-label="坦克大战全屏游戏">
      <canvas ref={canvasRef} className="tank-canvas" aria-label="坦克大战 Canvas" />
      <section className="tank-menu" aria-label="游戏启动菜单">
        <p className="tank-menu__kicker">Game Engine Canvas</p>
        <h1>坦克大战 90</h1>
        <p>
          已接入 Bailian 生成的像素素材，下一阶段会在同一全屏 Canvas 内加入关卡、地图生成、坦克规则和自动化测试。
        </p>
        <div className="tank-menu__footer">
          <button className="tank-button tank-button--primary" type="button">
            {ready ? "准备进入" : "加载素材"}
          </button>
          <span className="tank-chip" aria-live="polite">
            <span>Status</span>
            <strong>{ready ? "Assets Ready" : "Booting"}</strong>
          </span>
        </div>
      </section>
    </main>
  );
}

function drawBootScreen(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  image?: HTMLImageElement
) {
  context.clearRect(0, 0, width, height);
  context.fillStyle = "#0f172a";
  context.fillRect(0, 0, width, height);
  context.fillStyle = "rgba(37,99,235,0.2)";
  context.fillRect(0, height * 0.45, width, 8);
  context.fillStyle = "#22c55e";
  context.font = "700 18px ui-monospace, monospace";
  context.textAlign = "center";
  context.fillText("TANK BATTLE BOOT", width / 2, height / 2 - 24);

  if (image) {
    const size = Math.min(180, width * 0.35, height * 0.35);
    context.drawImage(image, 0, 0, 512, 512, width / 2 - size / 2, height / 2, size, size);
  }
}
