"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createTankAudio, type TankAudio } from "@/game/audio";
import { loadTankBattleAssets, type TankBattleAssets } from "@/game/assets";
import { isGameplayKey } from "@/game/input";
import { levelConfigs } from "@/game/levels";
import { drawTankBattle } from "@/game/render";
import { createTankBattleRuntime, createTankBattleState, getHudSnapshot } from "@/game/simulation";
import type { HudSnapshot, TankBattleState } from "@/game/types";

interface Runtime {
  readonly input: ReturnType<typeof createTankBattleRuntime>["input"];
  readonly state: TankBattleState;
  readonly world: ReturnType<typeof createTankBattleRuntime>["world"];
}

const initialHud: HudSnapshot = {
  level: 1,
  score: 0,
  lives: 3,
  enemiesLeft: 0,
  status: "paused",
  message: "选择关卡，按 Enter 开始"
};

export function TankBattleApp() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const runtimeRef = useRef<Runtime | null>(null);
  const previewRef = useRef(createTankBattleState(1));
  const assetsRef = useRef<TankBattleAssets | undefined>(undefined);
  const audioRef = useRef<TankAudio | undefined>(undefined);
  const previousCountsRef = useRef({ bullets: 0, explosions: 0, powerUps: 0 });
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [hud, setHud] = useState(initialHud);
  const [hasStarted, setHasStarted] = useState(false);

  const startLevel = useCallback(
    (levelId = selectedLevel) => {
      const runtime = createTankBattleRuntime(levelId);
      runtimeRef.current = runtime;
      previousCountsRef.current = { bullets: 0, explosions: 0, powerUps: 0 };
      setSelectedLevel(levelId);
      setHasStarted(true);
      setHud(getHudSnapshot(runtime.state));
      audioRef.current?.start();
    },
    [selectedLevel]
  );

  const togglePause = useCallback(() => {
    const runtime = runtimeRef.current;
    if (!runtime || runtime.state.status === "won" || runtime.state.status === "lost") return;
    runtime.state.status = runtime.state.status === "paused" ? "playing" : "paused";
    runtime.state.message = runtime.state.status === "paused" ? "暂停中" : "继续战斗";
    setHud(getHudSnapshot(runtime.state));
  }, []);

  useEffect(() => {
    const assets = loadTankBattleAssets();
    assetsRef.current = assets;
    audioRef.current = createTankAudio(assets.missionAudio);
  }, []);

  useEffect(() => {
    if (!hasStarted) {
      previewRef.current = createTankBattleState(selectedLevel);
      previewRef.current.status = "paused";
      previewRef.current.message = "选择关卡，按 Enter 开始";
      setHud({ ...getHudSnapshot(previewRef.current), status: "paused" });
    }
  }, [hasStarted, selectedLevel]);

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
      if (canvas.width !== Math.floor(width * pixelRatio) || canvas.height !== Math.floor(height * pixelRatio)) {
        canvas.width = Math.floor(width * pixelRatio);
        canvas.height = Math.floor(height * pixelRatio);
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

      drawTankBattle(context, state, assetsRef.current, width, height);
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
      if (isGameplayKey(event.code) || event.code.startsWith("Digit")) {
        event.preventDefault();
      }
      const digit = Number(event.code.replace("Digit", ""));
      if (digit >= 1 && digit <= levelConfigs.length && !runtimeRef.current) {
        setSelectedLevel(digit);
      }
      if (event.code === "Enter" && !runtimeRef.current) startLevel(selectedLevel);
      if (event.code === "KeyR") startLevel(selectedLevel);
      runtimeRef.current?.input.keyDown(event.code);
    };
    const keyUp = (event: KeyboardEvent) => runtimeRef.current?.input.keyUp(event.code);

    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);
    return () => {
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
    };
  }, [selectedLevel, startLevel]);

  const holdKey = (code: string, down: boolean) => {
    const input = runtimeRef.current?.input;
    if (!input) return;
    if (down) input.keyDown(code);
    else input.keyUp(code);
  };

  return (
    <main className="tank-app" aria-label="坦克大战全屏游戏">
      <canvas ref={canvasRef} className="tank-canvas" aria-label="坦克大战 Canvas" />
      <Hud hud={hud} onPause={togglePause} onRestart={() => startLevel(selectedLevel)} />
      {!hasStarted && (
        <StartMenu selectedLevel={selectedLevel} onSelect={setSelectedLevel} onStart={() => startLevel(selectedLevel)} />
      )}
      <TouchControls onHold={holdKey} />
      <p className="tank-status" aria-live="polite">
        {hud.message} · 方向键/WASD 移动，Space/J 射击，P 暂停，R 重开
      </p>
    </main>
  );

  function playEventSounds(state: TankBattleState) {
    const previous = previousCountsRef.current;
    if (state.bullets.length > previous.bullets) audioRef.current?.shoot();
    if (state.explosions.length > previous.explosions) audioRef.current?.explosion();
    if (state.powerUps.length < previous.powerUps) audioRef.current?.powerUp();
    previousCountsRef.current = {
      bullets: state.bullets.length,
      explosions: state.explosions.length,
      powerUps: state.powerUps.length
    };
  }
}

function Hud({ hud, onPause, onRestart }: { readonly hud: HudSnapshot; readonly onPause: () => void; readonly onRestart: () => void }) {
  return (
    <header className="tank-hud" aria-label="游戏状态">
      <div className="tank-hud__cluster">
        <HudChip label="Level" value={hud.level.toString()} />
        <HudChip label="Score" value={hud.score.toString().padStart(5, "0")} />
        <HudChip label="Lives" value={hud.lives.toString()} />
        <HudChip label="Enemies" value={hud.enemiesLeft.toString()} />
        <HudChip label="State" value={hud.status.toUpperCase()} />
      </div>
      <div className="tank-actions" aria-label="游戏操作">
        <button className="tank-button" type="button" onClick={onPause}>
          暂停/继续
        </button>
        <button className="tank-button" type="button" onClick={onRestart}>
          重开
        </button>
      </div>
    </header>
  );
}

function HudChip({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <span className="tank-chip">
      <span>{label}</span>
      <strong>{value}</strong>
    </span>
  );
}

function StartMenu({
  selectedLevel,
  onSelect,
  onStart
}: {
  readonly selectedLevel: number;
  readonly onSelect: (level: number) => void;
  readonly onStart: () => void;
}) {
  return (
    <section className="tank-menu" aria-label="游戏启动菜单">
      <p className="tank-menu__kicker">Game Engine Canvas Course</p>
      <h1>坦克大战 90</h1>
      <p>
        选择程序化关卡，保护底部基地。墙可击毁、钢铁可被强化弹击毁、河流阻挡战车、草地遮挡视线；道具提供护盾、快速射击、修复和冻结。
      </p>
      <div className="tank-levels" aria-label="关卡选择">
        {levelConfigs.map((level) => (
          <button
            aria-pressed={selectedLevel === level.id}
            className="tank-level-button"
            key={level.id}
            type="button"
            onClick={() => onSelect(level.id)}
          >
            {level.id}. {level.name}
          </button>
        ))}
      </div>
      <div className="tank-menu__footer">
        <button className="tank-button tank-button--primary" type="button" onClick={onStart}>
          开始战斗
        </button>
        <span className="tank-chip">
          <span>Assets</span>
          <strong>Bailian PNG/WAV</strong>
        </span>
      </div>
    </section>
  );
}

function TouchControls({ onHold }: { readonly onHold: (code: string, down: boolean) => void }) {
  return (
    <>
      <div className="tank-touch tank-touch--move" aria-label="触控方向盘">
        <span className="blank" />
        <TouchButton label="上" code="ArrowUp" onHold={onHold} />
        <span className="blank" />
        <TouchButton label="左" code="ArrowLeft" onHold={onHold} />
        <TouchButton label="下" code="ArrowDown" onHold={onHold} />
        <TouchButton label="右" code="ArrowRight" onHold={onHold} />
      </div>
      <div className="tank-touch tank-touch--fire" aria-label="触控开火">
        <TouchButton label="开火" code="Space" onHold={onHold} />
      </div>
    </>
  );
}

function TouchButton({ label, code, onHold }: { readonly label: string; readonly code: string; readonly onHold: (code: string, down: boolean) => void }) {
  return (
    <button
      type="button"
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        onHold(code, true);
      }}
      onPointerCancel={() => onHold(code, false)}
      onPointerLeave={() => onHold(code, false)}
      onPointerUp={() => onHold(code, false)}
    >
      {label}
    </button>
  );
}
