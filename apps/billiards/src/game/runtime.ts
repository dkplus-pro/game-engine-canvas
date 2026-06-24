import { InputState, World, type System } from "@game-engine-canvas/engine";
import { readBilliardsCommand } from "./input";
import { createBilliardsState, updateBilliards } from "./rules";

export function createBilliardsRuntime() {
  const input = new InputState();
  const state = createBilliardsState();
  const world = new World();
  const rulesSystem: System = {
    name: "BilliardsRules",
    update: ({ deltaTime }) => updateBilliards(state, readBilliardsCommand(input), deltaTime)
  };

  world.addSystem(rulesSystem);
  return { input, state, world };
}
