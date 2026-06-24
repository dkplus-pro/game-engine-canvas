import type { InputState } from "@game-engine-canvas/engine";
import type { BilliardsCommand } from "./types";

const aimStep = 0.036;
const powerStep = 12;

export function readBilliardsCommand(input: InputState): BilliardsCommand {
  const aimDelta = (input.isKeyDown("ArrowLeft") || input.isKeyDown("KeyA") ? -aimStep : 0) +
    (input.isKeyDown("ArrowRight") || input.isKeyDown("KeyD") ? aimStep : 0);
  const powerDelta = (input.isKeyDown("ArrowUp") || input.isKeyDown("KeyW") ? powerStep : 0) +
    (input.isKeyDown("ArrowDown") || input.isKeyDown("KeyS") ? -powerStep : 0);

  return {
    aimDelta,
    powerDelta,
    shootPressed: input.wasKeyPressed("Space") || input.wasKeyPressed("Enter"),
    pausePressed: input.wasKeyPressed("KeyP") || input.wasKeyPressed("Escape"),
    resetPressed: input.wasKeyPressed("KeyR")
  };
}

export function isGameplayKey(code: string): boolean {
  return [
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "ArrowDown",
    "KeyA",
    "KeyD",
    "KeyW",
    "KeyS",
    "Space",
    "Enter",
    "KeyP",
    "Escape",
    "KeyR"
  ].includes(code);
}
