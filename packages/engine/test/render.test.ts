import { describe, expect, it, vi } from "vitest";
import {
  CanvasRenderer,
  RenderSystem,
  ShapeRenderer,
  Transform2D,
  World
} from "../src";

function createContext() {
  return {
    arc: vi.fn(),
    beginPath: vi.fn(),
    clearRect: vi.fn(),
    fill: vi.fn(),
    fillRect: vi.fn(),
    restore: vi.fn(),
    rotate: vi.fn(),
    save: vi.fn(),
    scale: vi.fn(),
    stroke: vi.fn(),
    strokeRect: vi.fn(),
    translate: vi.fn(),
    fillStyle: "",
    strokeStyle: "",
    lineWidth: 0
  } as unknown as CanvasRenderingContext2D;
}

describe("CanvasRenderer", () => {
  it("clears and draws shape components", () => {
    const world = new World();
    const context = createContext();
    const renderer = new CanvasRenderer({
      context,
      width: 320,
      height: 180,
      background: "#fff"
    });
    const entity = world.createEntity();

    world
      .addComponent(
        entity,
        Transform2D,
        new Transform2D({ position: { x: 40, y: 60 } })
      )
      .addComponent(
        entity,
        ShapeRenderer,
        new ShapeRenderer({ kind: "rect", width: 20, height: 30, fillStyle: "#000" })
      )
      .addSystem(new RenderSystem(renderer));

    world.update(0);

    expect(context.clearRect).toHaveBeenCalledWith(0, 0, 320, 180);
    expect(context.fillRect).toHaveBeenCalledWith(0, 0, 320, 180);
    expect(context.translate).toHaveBeenCalledWith(40, 60);
    expect(context.fillRect).toHaveBeenCalledWith(-10, -15, 20, 30);
  });
});
