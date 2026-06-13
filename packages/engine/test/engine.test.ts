import { describe, expect, it } from "vitest";
import { Engine, World } from "../src";

describe("Engine", () => {
  it("steps the world with a clamped delta time", () => {
    const world = new World();
    const engine = new Engine({ world, maxDeltaTime: 0.05 });
    const result = engine.step(0.2);

    expect(result).toEqual({
      deltaTime: 0.05,
      elapsedTime: 0.05,
      frame: 1
    });
  });

  it("starts and stops a frame loop", () => {
    const world = new World();
    const callbacks: FrameRequestCallback[] = [];
    const cancelled: number[] = [];
    const engine = new Engine({
      world,
      requestFrame: (callback) => {
        callbacks.push(callback);
        return callbacks.length;
      },
      cancelFrame: (handle) => cancelled.push(handle)
    });

    engine.start();
    expect(engine.isRunning()).toBe(true);
    expect(callbacks).toHaveLength(1);

    callbacks[0]?.(100);
    callbacks[1]?.(116);
    expect(world.frame).toBe(2);

    engine.stop();
    expect(engine.isRunning()).toBe(false);
    expect(cancelled).toEqual([3]);
  });
});
