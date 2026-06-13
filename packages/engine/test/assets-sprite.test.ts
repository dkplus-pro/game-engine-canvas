import { describe, expect, it, vi } from "vitest";
import {
  AssetStore,
  CanvasRenderer,
  RenderSystem,
  SpriteRenderer,
  Transform2D,
  World
} from "../src";

function createContext() {
  return {
    clearRect: vi.fn(),
    drawImage: vi.fn(),
    fillRect: vi.fn(),
    restore: vi.fn(),
    rotate: vi.fn(),
    save: vi.fn(),
    scale: vi.fn(),
    translate: vi.fn(),
    fillStyle: ""
  } as unknown as CanvasRenderingContext2D;
}

describe("AssetStore and SpriteRenderer", () => {
  it("registers image assets and draws sprite components", () => {
    const world = new World();
    const context = createContext();
    const image = { width: 16, height: 16 } as CanvasImageSource;
    const assets = new AssetStore().registerImage("hero", image);
    const renderer = new CanvasRenderer({ context, width: 100, height: 100, assets });
    const entity = world.createEntity();

    world
      .addComponent(entity, Transform2D, new Transform2D({ position: { x: 50, y: 60 } }))
      .addComponent(
        entity,
        SpriteRenderer,
        new SpriteRenderer({ imageKey: "hero", width: 32, height: 32 })
      )
      .addSystem(new RenderSystem(renderer));

    world.update(0);

    expect(assets.hasImage("hero")).toBe(true);
    expect(context.translate).toHaveBeenCalledWith(50, 60);
    expect(context.drawImage).toHaveBeenCalledWith(image, -16, -16, 32, 32);
  });
});
