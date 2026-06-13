import { describe, expect, it } from "vitest";
import { SceneManager, createScene } from "../src";

describe("SceneManager", () => {
  it("runs scene lifecycle hooks and updates the active world", () => {
    const calls: string[] = [];
    const scene = createScene({
      name: "level",
      onEnter: () => calls.push("enter"),
      onExit: () => calls.push("exit"),
      update: () => calls.push("scene-update")
    });
    const manager = new SceneManager();

    manager.changeTo(scene);
    manager.update(0.016);
    manager.changeTo(createScene({ name: "menu" }));

    expect(calls).toEqual(["enter", "scene-update", "exit"]);
    expect(scene.world.frame).toBe(1);
  });

  it("ignores changing to the same scene", () => {
    let enters = 0;
    const scene = createScene({ name: "menu", onEnter: () => (enters += 1) });
    const manager = new SceneManager();

    manager.changeTo(scene);
    manager.changeTo(scene);

    expect(enters).toBe(1);
  });
});
