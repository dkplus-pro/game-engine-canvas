import { clamp } from "@game-engine-canvas/engine";

export type MissionStatus = "ready" | "running" | "paused" | "cleared" | "game-over";

export interface MissionStats {
  readonly level: number;
  readonly lives: number;
  readonly enemyQueue: number;
  readonly score: number;
  readonly baseIntegrity: number;
  readonly status: MissionStatus;
}

export interface HudState extends MissionStats {
  readonly soundEnabled: boolean;
  readonly showHelp: boolean;
  readonly activeKeys: readonly string[];
}

export type HudAction =
  | { readonly type: "start" }
  | { readonly type: "pause" }
  | { readonly type: "resume" }
  | { readonly type: "restart" }
  | { readonly type: "toggle-help" }
  | { readonly type: "toggle-sound" }
  | { readonly type: "select-level"; readonly level: number }
  | { readonly type: "key-down"; readonly code: string }
  | { readonly type: "key-up"; readonly code: string };

export const LEVEL_COUNT = 6;
export const INITIAL_LIVES = 3;
export const INITIAL_ENEMY_QUEUE = 20;
export const INITIAL_BASE_INTEGRITY = 100;

export function createInitialHudState(level = 1): HudState {
  return {
    level: normalizeLevel(level),
    lives: INITIAL_LIVES,
    enemyQueue: INITIAL_ENEMY_QUEUE,
    score: 0,
    baseIntegrity: INITIAL_BASE_INTEGRITY,
    status: "ready",
    soundEnabled: true,
    showHelp: true,
    activeKeys: []
  };
}

export function reduceHudState(state: HudState, action: HudAction): HudState {
  switch (action.type) {
    case "start":
      return {
        ...state,
        status: "running",
        showHelp: false
      };
    case "pause":
      return state.status === "running" ? { ...state, status: "paused", showHelp: true } : state;
    case "resume":
      return state.status === "paused" ? { ...state, status: "running", showHelp: false } : state;
    case "restart":
      return {
        ...createInitialHudState(state.level),
        soundEnabled: state.soundEnabled,
        status: "running",
        showHelp: false
      };
    case "toggle-help":
      return {
        ...state,
        showHelp: !state.showHelp
      };
    case "toggle-sound":
      return {
        ...state,
        soundEnabled: !state.soundEnabled
      };
    case "select-level":
      return createInitialHudState(action.level);
    case "key-down":
      return {
        ...state,
        activeKeys: addActiveKey(state.activeKeys, action.code)
      };
    case "key-up":
      return {
        ...state,
        activeKeys: state.activeKeys.filter((code) => code !== action.code)
      };
    default:
      return state;
  }
}

export function normalizeLevel(level: number): number {
  return clamp(Math.trunc(level), 1, LEVEL_COUNT);
}

export function getStatusLabel(status: MissionStatus): string {
  const labels: Record<MissionStatus, string> = {
    ready: "待命",
    running: "战斗中",
    paused: "已暂停",
    cleared: "已通关",
    "game-over": "任务失败"
  };

  return labels[status];
}

export function getBaseAlert(stats: MissionStats): "safe" | "warning" | "critical" {
  if (stats.baseIntegrity <= 30 || stats.lives <= 1) {
    return "critical";
  }

  if (stats.baseIntegrity <= 60 || stats.enemyQueue <= 5) {
    return "warning";
  }

  return "safe";
}

export function getCommandHint(activeKeys: readonly string[]): string {
  if (activeKeys.includes("Space")) {
    return "开火";
  }

  const direction = [
    ["ArrowUp", "向上"],
    ["ArrowDown", "向下"],
    ["ArrowLeft", "向左"],
    ["ArrowRight", "向右"]
  ].find(([code]) => activeKeys.includes(code));

  return direction?.[1] ?? "守卫基地";
}

function addActiveKey(activeKeys: readonly string[], code: string): readonly string[] {
  if (activeKeys.includes(code)) {
    return activeKeys;
  }

  return [...activeKeys, code];
}
