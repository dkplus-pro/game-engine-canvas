"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createBilliardsAudio, type BilliardsAudio } from "@/game/audio";
import { DEFAULT_SHOT_POWER, MAX_SHOT_POWER, MIN_SHOT_POWER } from "@/game/constants";
import { isGameplayKey } from "@/game/input";
import { drawBilliards, getTableMetrics, screenToLogical, type TableMetrics } from "@/game/render";
import { aimFromPoint, createBilliardsState, getHudSnapshot, shootCueBall, togglePause } from "@/game/rules";
import { createBilliardsRuntime } from "@/game/runtime";
import type { BilliardsState, HudSnapshot } from "@/game/types";

interface Runtime {
  readonly input: ReturnType<typeof createBilliardsRuntime>["input"];
  readonly state: BilliardsState;
  readonly world: ReturnType<typeof createBilliardsRuntime>["world"];
}

const initialState = createBilliardsState();
const initialHud: HudSnapshot = getHudSnapshot(initialState);

export function BilliardsApp() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const runtimeRef = useRef<Runtime | null>(null);
  const previewRef = useRef(initialState);
  const metricsRef = useRef<TableMetrics>(getTableMetrics(1200, 680));
  const audioRef = useRef<BilliardsAudio | undefined>(undefined);
  const previousEventsRef = useRef({ shots: 0, pocketed: 0, status: initialState.status });
  const draggingRef = useRef(false);
  const [hud, setHud] = useState(initialHud);
  const [hasStarted, setHasStarted] = useState(false);

  const syncHud = useCallback((state: BilliardsState) => setHud(getHudSnapshot(state)), []);

  const startGame = useCallback(() => {
    const runtime = createBilliardsRuntime();
    runtimeRef.current = runtime;
    previousEventsRef.current = { shots: 0, pocketed: 0, status: runtime.state.status };
    setHasStarted(true);
    syncHud(runtime.state);
    audioRef.current?.start();
  }, [syncHud]);

  const restartGame = useCallback(() => {
    startGame();
  }, [startGame]);

  const pauseGame = useCallback(() => {
    const runtime = runtimeRef.current;
    if (!runtime) return;
    togglePause(runtime.state);
    syncHud(runtime.state);
  }, [syncHud]);

  const shootPreset = useCallback(
    (power: number) => {
      const runtime = runtimeRef.current;
      if (!runtime) return;
      if (shootCueBall(runtime.state, runtime.state.shot.angle, power)) {
        audioRef.current?.cue();
        syncHud(runtime.state);
      }
    },
    [syncHud]
  );

  const adjustAim = useCallback(
    (delta: number) => {
      const runtime = runtimeRef.current;
      if (!runtime || runtime.state.status === "rolling") return;
      runtime.state.shot.angle += delta;
      runtime.state.message = delta < 0 ? "向左微调瞄准线" : "向右微调瞄准线";
      syncHud(runtime.state);
    },
    [syncHud]
  );

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
      const nextWidth = Math.floor(width * pixelRatio);
      const nextHeight = Math.floor(height * pixelRatio);
      if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
        canvas.width = nextWidth;
        canvas.height = nextHeight;
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

      if (runtime) {
        const deltaTime = Math.min((time - last) / 1000, 0.05);
        runtime.world.update(deltaTime);
        playEventSounds(state);
        runtime.input.endFrame();
      }

      metricsRef.current = drawBilliards(context, state, width, height);
      if (time - lastHud > 120) {
        syncHud(state);
        lastHud = time;
      }
      last = time;
      frame = requestAnimationFrame(loop);
    };

    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [syncHud]);

  useEffect(() => {
    const keyDown = (event: KeyboardEvent) => {
      if (isGameplayKey(event.code)) event.preventDefault();
      if (!runtimeRef.current && event.code === "Enter") {
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

  const logicalPointFromEvent = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return screenToLogical(metricsRef.current, {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    });
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const runtime = runtimeRef.current;
    if (!runtime) return;
    event.preventDefault();
    event.currentTarget.focus();
    event.currentTarget.setPointerCapture(event.pointerId);
    draggingRef.current = true;
    aimFromPoint(runtime.state, logicalPointFromEvent(event));
    syncHud(runtime.state);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const runtime = runtimeRef.current;
    if (!runtime || !draggingRef.current) return;
    event.preventDefault();
    aimFromPoint(runtime.state, logicalPointFromEvent(event));
    syncHud(runtime.state);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const runtime = runtimeRef.current;
    if (!runtime || !draggingRef.current) return;
    event.preventDefault();
    draggingRef.current = false;
    if (shootCueBall(runtime.state)) audioRef.current?.cue();
    syncHud(runtime.state);
  };

  return (
    <main className="billiards-app" aria-label="霓虹桌球全屏游戏">
      <canvas
        ref={canvasRef}
        aria-label="桌球 Canvas"
        className="billiards-canvas"
        role="application"
        tabIndex={0}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerCancel={() => {
          draggingRef.current = false;
        }}
        onPointerUp={handlePointerUp}
      />
      <Hud hud={hud} onPause={pauseGame} onRestart={restartGame} />
      {!hasStarted && <StartPanel onStart={startGame} />}
      {hasStarted && <PowerPanel hud={hud} onAim={adjustAim} onShoot={shootPreset} />}
      <p className="billiards-status" aria-live="polite">
        {hud.message} · 鼠标/触控拖拽母球蓄力，A/D 或 ←/→ 瞄准，W/S 调整力度，Space 击球，P 暂停，R 重开
      </p>
      <aside className="billiards-help" aria-label="操作提示">
        规则简化为练习赛：进球可连杆，空杆或母球落袋换手；清完 15 颗目标球获胜。Canvas 会按 DPR 缩放，HUD 保持可访问按钮。
      </aside>
    </main>
  );

  function playEventSounds(state: BilliardsState) {
    const previous = previousEventsRef.current;
    if (state.shotCount > previous.shots) audioRef.current?.cue();
    if (state.pocketedCount > previous.pocketed) audioRef.current?.pocket();
    if (state.status === "won" && previous.status !== "won") audioRef.current?.win();
    previousEventsRef.current = {
      shots: state.shotCount,
      pocketed: state.pocketedCount,
      status: state.status
    };
  }
}

function Hud({ hud, onPause, onRestart }: { readonly hud: HudSnapshot; readonly onPause: () => void; readonly onRestart: () => void }) {
  return (
    <header className="billiards-hud" aria-label="游戏状态">
      <div className="billiards-hud__cluster">
        <HudChip label="Player" value={`P${hud.player}`} />
        <HudChip label="Shots" value={String(hud.shots)} />
        <HudChip label="Pocketed" value={`${hud.pocketed}/15`} />
        <HudChip label="Left" value={String(hud.remaining)} />
        <HudChip label="State" value={hud.status.toUpperCase()} />
      </div>
      <div className="billiards-actions" aria-label="游戏操作">
        <button className="billiards-button" type="button" onClick={onPause}>
          暂停/继续
        </button>
        <button className="billiards-button" type="button" onClick={onRestart}>
          重开
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

function StartPanel({ onStart }: { readonly onStart: () => void }) {
  return (
    <section className="billiards-panel" aria-label="游戏启动菜单">
      <p className="billiards-panel__kicker">Game Engine Canvas Course</p>
      <h1>霓虹桌球</h1>
      <p>
        一个全屏 Canvas 桌球练习局：使用引擎 World/InputState 驱动帧更新，用 Vec2/Rect/clamp 支撑桌面坐标、碰撞和力度边界。
      </p>
      <div className="billiards-panel__footer">
        <button className="billiards-button billiards-button--primary" type="button" onClick={onStart}>
          开始开球
        </button>
        <span className="billiards-chip">
          <span>Mode</span>
          <strong>Canvas + Web Audio</strong>
        </span>
      </div>
    </section>
  );
}

function PowerPanel({
  hud,
  onAim,
  onShoot
}: {
  readonly hud: HudSnapshot;
  readonly onAim: (delta: number) => void;
  readonly onShoot: (power: number) => void;
}) {
  return (
    <section className="billiards-power" aria-label="击球控制">
      <div className="billiards-power__bar" aria-label={`当前力度 ${hud.power}%`}>
        <span className="billiards-power__fill" style={{ width: `${hud.power}%` }} />
      </div>
      <div className="billiards-actions" style={{ marginTop: 10 }}>
        <button className="billiards-button" type="button" aria-label="向左瞄准" onClick={() => onAim(-0.12)}>
          ←
        </button>
        <button className="billiards-button" type="button" aria-label="向右瞄准" onClick={() => onAim(0.12)}>
          →
        </button>
        <button className="billiards-button" type="button" onClick={() => onShoot(MIN_SHOT_POWER)}>
          轻击
        </button>
        <button className="billiards-button" type="button" onClick={() => onShoot(DEFAULT_SHOT_POWER)}>
          中击
        </button>
        <button className="billiards-button billiards-button--primary" type="button" onClick={() => onShoot(MAX_SHOT_POWER)}>
          强击
        </button>
      </div>
    </section>
  );
}
