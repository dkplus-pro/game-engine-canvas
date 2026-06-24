import { Vec2, type InputState } from "@game-engine-canvas/engine";
import { getCueBall } from "./table";
import type { BilliardsCommand, BilliardsState } from "./types";

export function readBilliardsCommand(input: InputState, state: BilliardsState, releasedPower: number): BilliardsCommand {
  const cue = getCueBall(state);
  const aimAt = input.pointer.position.clone();
  const angle = Math.atan2(aimAt.y - cue.position.y, aimAt.x - cue.position.x);
  const keyboardShoot = input.wasKeyPressed("Space") || input.wasKeyPressed("Enter") || input.wasKeyPressed("KeyJ");
  const pointerShoot = input.pointer.released && releasedPower > 0;

  return {
    aimAt,
    shoot:
      state.status === "aiming" && !cue.pocketed && (keyboardShoot || pointerShoot)
        ? {
            angle,
            power: pointerShoot ? releasedPower : 0.58
          }
        : undefined,
    pausePressed: input.wasKeyPressed("KeyP") || input.wasKeyPressed("Escape")
  };
}

export function isGameplayKey(code: string): boolean {
  return ["Space", "Enter", "KeyJ", "KeyP", "Escape", "KeyR"].includes(code);
}

export function initialAimPoint(state: BilliardsState): Vec2 {
  const cue = getCueBall(state);
  return new Vec2(cue.position.x + 160, cue.position.y);
}
