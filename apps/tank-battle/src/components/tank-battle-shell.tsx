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

const engineInfo = createEngine();
const controlButtons = [
  { code: "ArrowUp", label: "▲", aria: "向上移动" },
  { code: "ArrowLeft", label: "◀", aria: "向左移动" },
  { code: "Space", label: "●", aria: "发射子弹" },
  { code: "ArrowRight", label: "▶", aria: "向右移动" },
  { code: "ArrowDown", label: "▼", aria: "向下移动" }
] as const;

export function TankBattleShell() {
  const [hud, setHud] = useState<HudState>(() => createInitialHudState());
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const inputRef = useRef(new InputState());
  const hudRef = useRef(hud);

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

      if (event.code === "KeyP" || event.code === "Escape") {
        event.preventDefault();
        dispatch({ type: hudRef.current.status === "paused" ? "resume" : "pause" });
      }

      if (event.code === "Enter" && hudRef.current.status === "ready") {
        event.preventDefault();
        dispatch({ type: "start" });
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
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    let frame = 0;
    let animationId = 0;
    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(bounds.width * ratio));
      canvas.height = Math.max(1, Math.floor(bounds.height * ratio));
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const render = () => {
      frame += hudRef.current.status === "paused" ? 0 : 1;
      drawBattlePreview(context, canvas, hudRef.current, frame);
      inputRef.current.endFrame();
      animationId = window.requestAnimationFrame(render);
    };

    resize();
    window.addEventListener("resize", resize);
    animationId = window.requestAnimationFrame(render);
    return () => {
      window.removeEventListener("resize", resize);
      window.cancelAnimationFrame(animationId);
    };
  }, []);

  const alert = getBaseAlert(hud);
  const commandHint = useMemo(() => getCommandHint(hud.activeKeys), [hud.activeKeys]);

  return (
    <main className="tank-shell" data-status={hud.status}>
      <canvas
        ref={canvasRef}
        className="battle-canvas"
        aria-label="90 坦克大战像素战场画布"
        role="img"
      />

      <section className="top-hud" aria-label="战场状态">
        <div className="brand-panel">
          <span className="eyebrow">Game Engine Canvas</span>
          <h1>90 坦克大战</h1>
          <p>{engineInfo.name} · 全屏 Canvas · Level {hud.level}</p>
        </div>
        <dl className="stat-grid">
          <HudStat label="生命" value={`×${hud.lives}`} />
          <HudStat label="敌军" value={hud.enemyQueue.toString()} />
          <HudStat label="基地" value={`${hud.baseIntegrity}%`} tone={alert} />
          <HudStat label="分数" value={hud.score.toLocaleString("zh-CN")} />
        </dl>
      </section>

      <aside className="mission-panel" aria-label="任务控制">
        <div>
          <span className="panel-label">当前状态</span>
          <strong>{getStatusLabel(hud.status)}</strong>
          <p>指令：{commandHint}</p>
        </div>
        <div className="level-select" aria-label="选择关卡">
          {Array.from({ length: LEVEL_COUNT }, (_, index) => index + 1).map((level) => (
            <button
              aria-pressed={hud.level === level}
              className="level-button"
              key={level}
              onClick={() => dispatch({ type: "select-level", level })}
              type="button"
            >
              {level}
            </button>
          ))}
        </div>
        <div className="panel-actions">
          <button onClick={() => dispatch({ type: hud.status === "ready" ? "start" : "restart" })} type="button">
            {hud.status === "ready" ? "开始任务" : "重新开始"}
          </button>
          <button
            onClick={() => dispatch({ type: hud.status === "paused" ? "resume" : "pause" })}
            type="button"
          >
            {hud.status === "paused" ? "继续" : "暂停"}
          </button>
          <button onClick={() => dispatch({ type: "toggle-sound" })} type="button">
            音效 {hud.soundEnabled ? "开" : "关"}
          </button>
        </div>
      </aside>

      <section className="touch-pad" aria-label="触控操作区">
        {controlButtons.map((button) => (
          <button
            aria-label={button.aria}
            className={`touch-button touch-${button.code.toLowerCase()}`}
            key={button.code}
            onPointerDown={() => dispatch({ type: "key-down", code: button.code })}
            onPointerLeave={() => dispatch({ type: "key-up", code: button.code })}
            onPointerUp={() => dispatch({ type: "key-up", code: button.code })}
            type="button"
          >
            {button.label}
          </button>
        ))}
      </section>

      {hud.showHelp ? (
        <section className="help-card" aria-label="操作说明">
          <button className="help-close" onClick={() => dispatch({ type: "toggle-help" })} type="button">
            关闭
          </button>
          <span className="eyebrow">Controls</span>
          <h2>守住鹰徽基地</h2>
          <p>方向键/WASD 控制坦克，Space 开火，P 或 Esc 暂停。移动端可使用屏幕底部按钮。</p>
          <ul>
            <li>砖墙可被击毁，钢铁会阻挡子弹。</li>
            <li>河流阻止坦克通行，草地提供视觉掩护。</li>
            <li>基地生命归零或玩家生命耗尽则任务失败。</li>
          </ul>
        </section>
      ) : null}
    </main>
  );
}

function HudStat({
  label,
  tone = "safe",
  value
}: {
  readonly label: string;
  readonly tone?: "safe" | "warning" | "critical";
  readonly value: string;
}) {
  return (
    <div className="hud-stat" data-tone={tone}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function isGameControl(code: string): boolean {
  return ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "KeyW", "KeyA", "KeyS", "KeyD", "Space"].includes(code);
}

function drawBattlePreview(
  context: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  hud: HudState,
  frame: number
) {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const tile = Math.max(18, Math.floor(Math.min(width, height) / 24));
  const cols = Math.ceil(width / tile);
  const rows = Math.ceil(height / tile);

  context.clearRect(0, 0, width, height);
  context.fillStyle = "#020617";
  context.fillRect(0, 0, width, height);

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const seed = (x * 17 + y * 31 + hud.level * 13) % 11;
      context.fillStyle = seed === 0 ? "#1e3a2f" : seed === 1 ? "#1f2937" : "#0f172a";
      context.fillRect(x * tile, y * tile, tile - 1, tile - 1);

      if (seed === 2 || seed === 4) {
        context.fillStyle = seed === 2 ? "#92400e" : "#64748b";
        context.fillRect(x * tile + 3, y * tile + 3, tile - 6, tile - 6);
      }

      if (seed === 7) {
        context.fillStyle = "rgba(37, 99, 235, 0.55)";
        context.fillRect(x * tile, y * tile + tile * 0.25, tile, tile * 0.5);
      }
    }
  }

  const baseX = Math.floor(cols / 2) * tile;
  const baseY = Math.max(tile * 3, (rows - 3) * tile);
  drawBase(context, baseX, baseY, tile);

  const playerX = baseX + Math.sin(frame / 24) * tile * 2;
  const playerY = baseY - tile * 3;
  drawTank(context, playerX, playerY, tile, "#22c55e", "#bbf7d0");

  for (let i = 0; i < 5; i += 1) {
    const x = ((i * 4 + hud.level) % cols) * tile + Math.cos(frame / (36 + i * 3)) * 10;
    const y = (1 + (i % 2)) * tile + ((frame / (18 + i * 4)) % (tile * 2));
    drawTank(context, x, y, tile, "#dc2626", "#fecaca");
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
