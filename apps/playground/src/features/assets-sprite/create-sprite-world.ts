import {
  AssetStore,
  CanvasRenderer,
  RenderSystem,
  SpriteRenderer,
  Transform2D,
  World
} from "@game-engine-canvas/engine";

function createSpriteCanvas() {
  const sprite = document.createElement("canvas");
  sprite.width = 64;
  sprite.height = 64;
  const context = sprite.getContext("2d");

  if (!context) {
    return sprite;
  }

  context.fillStyle = "#0f766e";
  context.fillRect(8, 10, 48, 44);
  context.fillStyle = "#f8fafc";
  context.fillRect(20, 22, 8, 8);
  context.fillRect(36, 22, 8, 8);
  context.fillStyle = "#134e4a";
  context.fillRect(22, 42, 20, 4);

  return sprite;
}

export function createSpriteWorld(context: CanvasRenderingContext2D) {
  const assets = new AssetStore().registerImage("robot", createSpriteCanvas());
  const world = new World();
  const renderer = new CanvasRenderer({
    context,
    width: 640,
    height: 360,
    background: "#edf4f2",
    assets
  });

  for (const [index, x] of [190, 320, 450].entries()) {
    const entity = world.createEntity();
    world
      .addComponent(
        entity,
        Transform2D,
        new Transform2D({
          position: { x, y: 180 },
          rotation: (index - 1) * 0.2,
          scale: { x: 1 + index * 0.15, y: 1 + index * 0.15 }
        })
      )
      .addComponent(
        entity,
        SpriteRenderer,
        new SpriteRenderer({ imageKey: "robot", width: 80, height: 80 })
      );
  }

  world.addSystem(new RenderSystem(renderer));
  return { world, assets };
}
