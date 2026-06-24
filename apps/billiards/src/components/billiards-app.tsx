"use client";

import { clamp } from "@game-engine-canvas/engine";
import { type PointerEvent, type CSSProperties, useCallback, useEffect, useRef, useState } from "react";
import { createBilliardsAudio, type BilliardsAudio } from "@/game/audio";
import { isGameplayKey, initialAimPoint } from "@/game/input";
import { drawBilliards, getBilliardsTableMetrics, screenToTablePoint } from "@/game/render";
import { createBilliardsRuntime, getHudSnapshot, shootCueBall, updateBilliards, type BilliardsRuntime } from "@/game/simulation";
import { createBilliardsState } from "@/game/table";
import type { BilliardsState, HudSnapshot, TableMetrics } from "@/game/types";

const initialPreview = createPreviewState();
const initialHud = getHudSnapshot(initialPreview);

export function BilliardsApp() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const runtimeRef = useRef<BilliardsRuntime | null>(null);
  const previewRef = useRef<BilliardsState>(initialPreview);
  const metricsRef = useRef<TableMetrics>(getBilliardsTableMetrics(1280, 720));
  const audioRef = useRef<BilliardsAudio | undefined>(undefined);
  const chargeStartedAtRef = useRef<number | undefined>(undefined);
  const chargePowerRef = useRef(0);
  const previousStatsRef = useRef({ shots: 0, collisions: 0, pockets: 0, fouls: 0 });
  const [hud, setHud] = useState<HudSnapshot>(initialHud);
  const [hasStarted, setHasStarted] = useState(false);
  const [chargePower, setChargePower] = useState(0);

  const startGame = useCallback(() => {
    const runtime = createBilliardsRuntime();
    const aim = initialAimPoint(runtime.state);
    runtime.input.pointerMove(aim.x, aim.y);
    runtimeRef.current = runtime;
    previousStatsRef.current = { shots: 0, collisions: 0, pockets: 0, fouls: 0 };
    chargePowerRef.current = 0;
    chargeStartedAtRef.current = undefined;
    setChargePower(0);
    setHasStarted(true);
    setHud(getHudSnapshot(runtime.state));
    audioRef.current?.start();
  }, []);

  const restartGame = useCallback(() => startGame(), [startGame]);

  const togglePause = useCallback(() => {
    const runtime = runtimeRef.current;
    if (!runtime) return;
    updateBilliards(runtime.state, { pausePressed: true }, 0);
    setHud(getHudSnapshot(runtime.state));
  }, []);

  const quickShot = useCallback(() => {
    const runtime = runtimeRef.current;
    if (!runtime || runtime.state.status !== "aiming") return;
    audioRef.current?.start();
    shootCueBall(runtime.state, runtime.state.aimAngle, 0.62);
    setHud(getHudSnapshot(runtime.state));
  }, []);

  const enterFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      void document.documentElement.requestFullscreen?.();
    }
  }, []);

  useEffect(() => {
    audioRef.current = createBilliardsAudio();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    let frame = 0;
    let last = performance.now();
    let lastHud = 0;

    const resize = () => {
      const pixelRatio = window.devicePixelRatio || 1;
      const width = Math.max(320, window.innerWidth);
      const height = Math.max(320, window.innerHeight);
      const targetWidth = Math.floor(width * pixelRatio);
      const targetHeight = Math.floor(height * pixelRatio);
      if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      }
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      return { width, height };
    };

    const loop = (time: number) => {
      const { width, height } = resize();
      const runtime = runtimeRef.current;
      const state = runtime?.state ?? previewRef.current;
      const deltaTime = Math.min((time - last) / 1000, 0.05);

      if (runtime) {
        updateChargePower(runtime.state, time);
        runtime.world.update(deltaTime);
        playEventSounds(runtime.state);
        runtime.input.endFrame();
      }

      metricsRef.current = drawBilliards(context, state, width, height);
      if (time - lastHud > 120) {
        setHud(getHudSnapshot(state));
        lastHud = time;
      }
      last = time;
      frame = requestAnimationFrame(loop);
    };

    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const keyDown = (event: KeyboardEvent) => {
      if (isGameplayKey(event.code)) event.preventDefault();
      if (!runtimeRef.current && (event.code === "Enter" || event.code === "Space")) {
        startGame();
        return;
      }
      if (event.code === "KeyR") {
        restartGame();
        return;
      }
      runtimeRef.current?.input.keyDown(event.code);
    };
    const keyUp = (event: KeyboardEvent) => runtimeRef.current?.input.keyUp(event.code);

    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);
    return () => {
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
    };
  }, [restartGame, startGame]);

  const handlePointer = (event: PointerEvent<HTMLCanvasElement>, phase: "down" | "move" | "up") => {
    const runtime = runtimeRef.current;
    const canvas = canvasRef.current;
    if (!runtime || !canvas) return;
    const point = screenToTablePoint(event.clientX, event.clientY, canvas, metricsRef.current);

    if (phase === "down") {
      event.currentTarget.setPointerCapture(event.pointerId);
      audioRef.current?.start();
      runtime.input.pointerDown(point.x, point.y);
      chargeStartedAtRef.current = performance.now();
      return;
    }
    if (phase === "up") {
      runtime.releasedPower = Math.max(chargePowerRef.current, 0.18);
      runtime.input.pointerUp(point.x, point.y);
      chargeStartedAtRef.current = undefined;
      chargePowerRef.current = 0;
      setChargePower(0);
      return;
    }
    runtime.input.pointerMove(point.x, point.y);
  };

  const powerStyle = { "--shot-power": chargePower.toFixed(3) } as CSSProperties;

  return (
    <main className="billiards-app" aria-label="霓虹桌球全屏游戏">
      <canvas
        ref={canvasRef}
        className="billiards-canvas"
        aria-label="霓虹桌球 Canvas"
        onPointerDown={(event) => handlePointer(event, "down")}
        onPointerMove={(event) => handlePointer(event, "move")}
        onPointerUp={(event) => handlePointer(event, "up")}
        onPointerCancel={(event) => handlePointer(event, "up")}
      />
      <Hud hud={hud} onFullscreen={enterFullscreen} onPause={togglePause} onRestart={restartGame} onShot={quickShot} />
      {!hasStarted && <StartMenu onStart={startGame} />}
      <div className="billiards-power" style={powerStyle} aria-hidden="true">
        <span>拖拽蓄力</span>
        <span className="billiards-power__track">
          <span className="billiards-power__fill" />
        </span>
      </div>
      <p className="billiards-help">操作：拖拽母球方向线蓄力，松手击球；Space/J 快速击球，P 暂停，R 重开。Canvas 使用 DPR 映射避免高分屏偏移。</p>
      <p className="billiards-status" aria-live="polite">
        {hud.message}
      </p>
    </main>
  );

  function updateChargePower(state: BilliardsState, time: number) {
    if (state.status !== "aiming" || chargeStartedAtRef.current === undefined) {
      if (chargePowerRef.current !== 0) {
        chargePowerRef.current = 0;
        state.shotPower = 0;
        setChargePower(0);
      }
      return;
    }
    const elapsed = time - chargeStartedAtRef.current;
    const nextPower = clamp(elapsed / 1250, 0.08, 1);
    chargePowerRef.current = nextPower;
    state.shotPower = nextPower;
    setChargePower(nextPower);
  }

  function playEventSounds(state: BilliardsState) {
    const previous = previousStatsRef.current;
    if (state.stats.shots > previous.shots) audioRef.current?.shot();
    if (state.stats.pockets > previous.pockets) audioRef.current?.pocket();
    if (state.stats.fouls > previous.fouls) audioRef.current?.foul();
    else if (state.stats.collisions > previous.collisions) audioRef.current?.collision();
    previousStatsRef.current = { ...state.stats };
  }
}

function Hud({
  hud,
  onFullscreen,
  onPause,
  onRestart,
  onShot
}: {
  readonly hud: HudSnapshot;
  readonly onFullscreen: () => void;
  readonly onPause: () => void;
  readonly onRestart: () => void;
  readonly onShot: () => void;
}) {
  return (
    <header className="billiards-hud" aria-label="游戏状态">
      <div className="billiards-hud__cluster">
        <HudChip label="Turn" value={`P${hud.currentPlayer}`} />
        <HudChip label="State" value={hud.stateLabel} />
        <HudChip label="P1" value={hud.playerOneGroup} />
        <HudChip label="P2" value={hud.playerTwoGroup} />
        <HudChip label="Solids" value={String(hud.solidsLeft)} />
        <HudChip label="Stripes" value={String(hud.stripesLeft)} />
        <HudChip label="Shots" value={String(hud.shots)} />
      </div>
      <div className="billiards-actions" aria-label="游戏操作">
        <button className="billiards-shot-button" type="button" onClick={onShot}>
          击球
        </button>
        <button className="billiards-button" type="button" onClick={onPause}>
          暂停/继续
        </button>
        <button className="billiards-button" type="button" onClick={onRestart}>
          重开
        </button>
        <button className="billiards-button" type="button" onClick={onFullscreen}>
          全屏
        </button>
      </div>
    </header>
  );
}

function HudChip({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <span className="billiards-chip">
      <span>{label}</span>
      <strong>{value}</strong>
    </span>
  );
}

function StartMenu({ onStart }: { readonly onStart: () => void }) {
  return (
    <section className="billiards-menu" aria-label="游戏启动菜单">
      <p className="billiards-menu__kicker">Game Engine Canvas Course</p>
      <h1>霓虹桌球</h1>
      <p>
        使用仓库内 `World`、`InputState`、`Vec2` 与 `clamp` 从零实现的全屏 Canvas 桌球。纯 Canvas 绘制球台和球体，WebAudio 合成击球、碰撞、落袋和犯规音效。
      </p>
      <p>规则采用教学版 8 球：先打进的低号/花色决定分组，犯规换手，清空己方目标球后合法打进 8 号球获胜。</p>
      <div className="billiards-menu__footer">
        <button className="billiards-button billiards-button--primary" type="button" onClick={onStart}>
          开始对局
        </button>
        <span className="billiards-chip">
          <span>Verify</span>
          <strong>Vitest + Playwright</strong>
        </span>
      </div>
    </section>
  );
}

function createPreviewState(): BilliardsState {
  const state = createBilliardsState();
  state.status = "paused";
  state.previousStatus = "aiming";
  state.message = "点击开始对局，或按 Enter 开始";
  return state;
}
