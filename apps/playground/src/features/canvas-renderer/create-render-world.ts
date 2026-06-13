import {
  CanvasRenderer,
  RenderSystem,
  ShapeRenderer,
  Transform2D,
  World
} from "@game-engine-canvas/engine";

export function createRenderWorld(context: CanvasRenderingContext2D) {
  const world = new World();
  const renderer = new CanvasRenderer({
    context,
    width: 640,
    height: 360,
    background: "#edf4f2"
  });

  const player = world.createEntity();
  const orb = world.createEntity();
  const block = world.createEntity();

  world
    .addComponent(
      player,
      Transform2D,
      new Transform2D({ position: { x: 180, y: 170 }, rotation: 0.2 })
    )
    .addComponent(
      player,
      ShapeRenderer,
      new ShapeRenderer({ kind: "rect", width: 92, height: 64, fillStyle: "#0f766e" })
    );

  world
    .addComponent(orb, Transform2D, new Transform2D({ position: { x: 360, y: 130 } }))
    .addComponent(
      orb,
      ShapeRenderer,
      new ShapeRenderer({ kind: "circle", radius: 38, fillStyle: "#b45309" })
    );

  world
    .addComponent(block, Transform2D, new Transform2D({ position: { x: 450, y: 240 } }))
    .addComponent(
      block,
      ShapeRenderer,
      new ShapeRenderer({ kind: "rect", width: 120, height: 44, fillStyle: "#334155" })
    );

  world.addSystem(new RenderSystem(renderer));
  return world;
}
