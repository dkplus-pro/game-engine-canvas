import { describe, expect, it, vi } from "vitest";
import { InputState, bindBrowserInput } from "../src";

describe("InputState", () => {
  it("tracks key transitions", () => {
    const input = new InputState();

    input.keyDown("ArrowRight");
    expect(input.isKeyDown("ArrowRight")).toBe(true);
    expect(input.wasKeyPressed("ArrowRight")).toBe(true);

    input.endFrame();
    expect(input.isKeyDown("ArrowRight")).toBe(true);
    expect(input.wasKeyPressed("ArrowRight")).toBe(false);

    input.keyUp("ArrowRight");
    expect(input.isKeyDown("ArrowRight")).toBe(false);
    expect(input.wasKeyReleased("ArrowRight")).toBe(true);
  });

  it("tracks pointer transitions", () => {
    const input = new InputState();

    input.pointerDown(12, 24);
    expect(input.pointer.down).toBe(true);
    expect(input.pointer.pressed).toBe(true);
    expect(input.pointer.position).toMatchObject({ x: 12, y: 24 });

    input.endFrame();
    input.pointerUp(30, 40);
    expect(input.pointer.down).toBe(false);
    expect(input.pointer.released).toBe(true);
  });
});

describe("bindBrowserInput", () => {
  it("registers and cleans up listeners", () => {
    const input = new InputState();
    const listeners = new Map<string, EventListener>();
    const target = {
      addEventListener: vi.fn((type: string, listener: EventListener) => {
        listeners.set(type, listener);
      }),
      removeEventListener: vi.fn()
    };

    const cleanup = bindBrowserInput(input, target);
    listeners.get("keydown")?.({ code: "Space" } as KeyboardEvent);

    expect(input.wasKeyPressed("Space")).toBe(true);
    cleanup();
    expect(target.removeEventListener).toHaveBeenCalledTimes(5);
  });
});
