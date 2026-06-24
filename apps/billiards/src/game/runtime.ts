import { InputState, World, type System } from "@game-engine-canvas/engine";
import { createBilliardsState } from "./state";
import { updateBilliardsRules } from "./rules";

export function createBilliardsRuntime() {
  const input = new InputState();
  const state = createBilliardsState();
  const world = new World();
  const rulesSystem: System = {
    name: "BilliardsRules",
    update: ({ deltaTime }) => updateBilliardsRules(state, Math.min(deltaTime, 0.05))
  };

  world.addSystem(rulesSystem);
  return { input, state, world };
}
