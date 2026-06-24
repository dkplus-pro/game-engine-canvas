import type { InputState } from "@game-engine-canvas/engine";
import type { Direction, TankCommand } from "./types";

const keyToDirection: Record<string, Direction> = {
  ArrowUp: "up",
  KeyW: "up",
  ArrowRight: "right",
  KeyD: "right",
  ArrowDown: "down",
  KeyS: "down",
  ArrowLeft: "left",
  KeyA: "left"
};

export function readTankCommand(input: InputState): TankCommand {
  const direction = Object.entries(keyToDirection).find(([code]) => input.isKeyDown(code))?.[1];

  return {
    direction,
    fire: input.isKeyDown("Space") || input.isKeyDown("KeyJ"),
    pausePressed: input.wasKeyPressed("KeyP") || input.wasKeyPressed("Escape")
  };
}

export function isGameplayKey(code: string): boolean {
  return code in keyToDirection || ["Space", "KeyJ", "KeyP", "Escape", "Enter", "KeyR"].includes(code);
}
