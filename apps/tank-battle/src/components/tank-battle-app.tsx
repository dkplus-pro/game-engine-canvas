"use client";

import { InputState, createEngine } from "@game-engine-canvas/engine";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  LEVEL_COUNT,
  createInitialHudState,
  getBaseAlert,
  getCommandHint,
  getStatusLabel,
  reduceHudState,
  type HudState
} from "@/ui/hud-model";

const assetPath = "/assets/tank-battle-sprites.png";
const engineInfo = createEngine();
const movementButtons = [
  { code: "ArrowUp", label: "▲", aria: "向上移动" },
  { code: "ArrowLeft", label: "◀", aria: "向左移动" },
  { code: "ArrowRight", label: "▶", aria: "向右移动" },
  { code: "ArrowDown", label: "▼", aria: "向下移动" }
] as const;

export function TankBattleApp() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const inputRef = useRef(new InputState());
  const hudRef = useRef<HudState>(createInitialHudState());
  const [hud, setHud] = useState<HudState>(() => createInitialHudState());
  const [assetsReady, setAssetsReady] = useState(false);

  useEffect(() => {
    hudRef.current = hud;
  }, [hud]);

  const dispatch = useCallback((action: Parameters<typeof reduceHudState>[1]) => {
    setHud((current) => reduceHudState(current, action));
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isGameControl(event.code)) {
        event.preventDefault();
        inputRef.current.keyDown(event.code);
        dispatch({ type: "key-down", code: event.code });
      }

      if (event.code === "Enter" && hudRef.current.status === "ready") {
        event.preventDefault();
        dispatch({ type: "start" });
      }

      if (event.code === "KeyP" || event.code === "Escape") {
        event.preventDefault();
        dispatch({ type: hudRef.current.status === "paused" ? "resume" : "pause" });
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (isGameControl(event.code)) {
        inputRef.current.keyUp(event.code);
        dispatch({ type: "key-up", code: event.code });
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [dispatch]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) {
      return;
    }

    const image = new Image();
    let animationId = 0;
    let frame = 0;

    const resize = () => {
      const pixelRatio = window.devicePixelRatio || 1;
      canvas.width = Math.floor(window.innerWidth * pixelRatio);
      canvas.height = Math.floor(window.innerHeight * pixelRatio);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const render = () => {
      frame += hudRef.current.status === "paused" ? 0 : 1;
      drawBattleScreen(
        context,
        window.innerWidth,
        window.innerHeight,
        image.complete ? image : undefined,
        hudRef.current,
        frame
      );
      inputRef.current.endFrame();
      animationId = window.requestAnimationFrame(render);
    };

    const handleImageLoad = () => {
      setAssetsReady(true);
    };

    image.addEventListener("load", handleImageLoad);
    image.src = assetPath;
    if (image.complete) {
      setAssetsReady(true);
    }

    window.addEventListener("resize", resize);
    resize();
    animationId = window.requestAnimationFrame(render);

    return () => {
      image.removeEventListener("load", handleImageLoad);
      window.removeEventListener("resize", resize);
      window.cancelAnimationFrame(animationId);
    };
  }, []);

  const alert = getBaseAlert(hud);
  const commandHint = useMemo(() => getCommandHint(hud.activeKeys), [hud.activeKeys]);
  const primaryLabel = hud.status === "ready" ? (assetsReady ? "准备进入" : "加载素材") : "重新开始";
  const hudPrimaryLabel = hud.status === "ready" ? "快速开始" : "重新开始";
  const showMenu = hud.status !== "running" || hud.showHelp;

  return (
    <main className="tank-app" aria-label="坦克大战全屏游戏" data-status={hud.status}>
      <canvas ref={canvasRef} className="tank-canvas" aria-label="坦克大战 Canvas" />

      <section className="tank-hud" aria-label="战场 HUD">
        <div className="tank-hud__cluster" aria-label="任务数值">
          <HudChip label="生命" value={`×${hud.lives}`} />
          <HudChip label="敌军" value={hud.enemyQueue.toString()} />
          <HudChip label="基地" value={`${hud.baseIntegrity}%`} tone={alert} />
          <HudChip label="分数" value={hud.score.toLocaleString("zh-CN")} />
          <HudChip label="关卡" value={hud.level.toString()} />
        </div>
        <div className="tank-actions" aria-label="游戏控制">
          <button
            className="tank-button tank-button--primary"
            onClick={() => dispatch({ type: hud.status === "ready" ? "start" : "restart" })}
            type="button"
          >
            {hudPrimaryLabel}
          </button>
          <button
            className="tank-button"
            onClick={() => dispatch({ type: hud.status === "paused" ? "resume" : "pause" })}
            type="button"
          >
            {hud.status === "paused" ? "继续" : "暂停"}
          </button>
          <button className="tank-button" onClick={() => dispatch({ type: "toggle-help" })} type="button">
            {hud.showHelp ? "隐藏说明" : "显示说明"}
          </button>
          <button className="tank-button" onClick={() => dispatch({ type: "toggle-sound" })} type="button">
            音效 {hud.soundEnabled ? "开" : "关"}
          </button>
        </div>
      </section>

      {showMenu ? (
        <section className="tank-menu" aria-label="游戏启动菜单">
          <p className="tank-menu__kicker">{engineInfo.name} · Fullscreen Canvas</p>
          <h1>坦克大战 90</h1>
          <p>
            选择关卡后守住鹰徽基地：方向键/WASD 移动，Space 开火，P 或 Esc 暂停。砖墙、钢铁、河流和草地会在地图规则接入后使用同一 HUD 展示。
          </p>
          <div className="tank-levels" aria-label="选择关卡">
            {Array.from({ length: LEVEL_COUNT }, (_, index) => index + 1).map((level) => (
              <button
                aria-pressed={hud.level === level}
                className="tank-level-button"
                key={level}
                onClick={() => dispatch({ type: "select-level", level })}
                type="button"
              >
                Level {level}
              </button>
            ))}
          </div>
          <div className="tank-menu__footer">
            <button
              className="tank-button tank-button--primary"
              onClick={() => dispatch({ type: hud.status === "ready" ? "start" : "restart" })}
              type="button"
            >
              {primaryLabel}
            </button>
            <span className="tank-chip" aria-live="polite">
              <span>Status</span>
              <strong>{getStatusLabel(hud.status)}</strong>
            </span>
          </div>
        </section>
      ) : null}

      <section className="tank-status" aria-live="polite">
        {getStatusLabel(hud.status)} · 指令：{commandHint} · Level {hud.level} · {assetsReady ? "Assets Ready" : "Booting"}
      </section>

      <section className="tank-touch tank-touch--move" aria-label="移动触控">
        <span className="blank" />
        <TouchButton button={movementButtons[0]} dispatch={dispatch} input={inputRef.current} />
        <span className="blank" />
        <TouchButton button={movementButtons[1]} dispatch={dispatch} input={inputRef.current} />
        <span className="blank" />
        <TouchButton button={movementButtons[2]} dispatch={dispatch} input={inputRef.current} />
        <span className="blank" />
        <TouchButton button={movementButtons[3]} dispatch={dispatch} input={inputRef.current} />
        <span className="blank" />
      </section>
      <section className="tank-touch tank-touch--fire" aria-label="开火触控">
        <TouchButton button={{ code: "Space", label: "FIRE", aria: "发射子弹" }} dispatch={dispatch} input={inputRef.current} />
      </section>
    </main>
  );
}

function HudChip({
  label,
  tone = "safe",
  value
}: {
  readonly label: string;
  readonly tone?: "safe" | "warning" | "critical";
  readonly value: string;
}) {
  return (
    <span className="tank-chip" data-tone={tone}>
      <span>{label}</span>
      <strong>{value}</strong>
    </span>
  );
}

function TouchButton({
  button,
  dispatch,
  input
}: {
  readonly button: { readonly code: string; readonly label: string; readonly aria: string };
  readonly dispatch: (action: Parameters<typeof reduceHudState>[1]) => void;
  readonly input: InputState;
}) {
  const press = () => {
    input.keyDown(button.code);
    dispatch({ type: "key-down", code: button.code });
  };
  const release = () => {
    input.keyUp(button.code);
    dispatch({ type: "key-up", code: button.code });
  };

  return (
    <button
      aria-label={button.aria}
      onPointerCancel={release}
      onPointerDown={press}
      onPointerLeave={release}
      onPointerUp={release}
      type="button"
    >
      {button.label}
    </button>
  );
}

function isGameControl(code: string): boolean {
  return ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "KeyW", "KeyA", "KeyS", "KeyD", "Space"].includes(code);
}

function drawBattleScreen(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  image: HTMLImageElement | undefined,
  hud: HudState,
  frame: number
) {
  context.clearRect(0, 0, width, height);
  context.fillStyle = "#0f172a";
  context.fillRect(0, 0, width, height);

  const tile = Math.max(24, Math.floor(Math.min(width, height) / 22));
  const cols = Math.ceil(width / tile);
  const rows = Math.ceil(height / tile);

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const seed = (x * 17 + y * 31 + hud.level * 13) % 12;
      context.fillStyle = seed === 0 ? "#123524" : seed === 1 ? "#1f2937" : "#111827";
      context.fillRect(x * tile, y * tile, tile - 1, tile - 1);

      if (seed === 2 || seed === 4) {
        context.fillStyle = seed === 2 ? "#92400e" : "#64748b";
        context.fillRect(x * tile + 4, y * tile + 4, tile - 8, tile - 8);
      }

      if (seed === 7) {
        context.fillStyle = "rgba(37, 99, 235, 0.55)";
        context.fillRect(x * tile, y * tile + tile * 0.25, tile, tile * 0.5);
      }
    }
  }

  context.fillStyle = "rgba(37,99,235,0.24)";
  context.fillRect(0, height * 0.45, width, 8);

  const baseX = Math.floor(cols / 2) * tile;
  const baseY = Math.max(tile * 4, (rows - 3) * tile);
  drawBase(context, baseX, baseY, tile);

  const playerX = baseX + Math.sin(frame / 24) * tile * 2;
  const playerY = baseY - tile * 3;
  drawTank(context, playerX, playerY, tile, "#22c55e", "#bbf7d0");

  for (let i = 0; i < 5; i += 1) {
    const x = ((i * 4 + hud.level) % cols) * tile + Math.cos(frame / (36 + i * 3)) * 10;
    const y = (1 + (i % 2)) * tile + ((frame / (18 + i * 4)) % (tile * 2));
    drawTank(context, x, y, tile, "#dc2626", "#fecaca");
  }

  if (image) {
    const size = Math.min(96, width * 0.18, height * 0.18);
    context.drawImage(image, 0, 0, 512, 512, Math.max(16, width - size - 24), Math.max(110, height - size - 24), size, size);
  }

  if (hud.status === "paused") {
    context.fillStyle = "rgba(15, 23, 42, 0.62)";
    context.fillRect(0, 0, width, height);
    context.fillStyle = "#f8fafc";
    context.font = "700 28px ui-monospace, SFMono-Regular, Menlo, monospace";
    context.textAlign = "center";
    context.fillText("PAUSED", width / 2, height / 2);
  }
}

function drawTank(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  tile: number,
  color: string,
  accent: string
) {
  const size = tile * 0.9;
  context.fillStyle = "#111827";
  context.fillRect(x - size * 0.5, y - size * 0.35, size, size * 0.7);
  context.fillStyle = color;
  context.fillRect(x - size * 0.35, y - size * 0.5, size * 0.7, size);
  context.fillStyle = accent;
  context.fillRect(x - size * 0.08, y - size * 0.72, size * 0.16, size * 0.5);
}

function drawBase(context: CanvasRenderingContext2D, x: number, y: number, tile: number) {
  context.fillStyle = "#f59e0b";
  context.fillRect(x - tile * 0.7, y - tile * 0.6, tile * 1.4, tile * 1.2);
  context.fillStyle = "#0f172a";
  context.fillRect(x - tile * 0.35, y - tile * 0.25, tile * 0.7, tile * 0.5);
  context.fillStyle = "#f8fafc";
  context.fillRect(x - tile * 0.1, y - tile * 0.4, tile * 0.2, tile * 0.8);
}
