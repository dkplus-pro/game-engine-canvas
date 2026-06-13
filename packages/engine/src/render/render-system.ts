import type { System } from "../ecs";
import { CanvasRenderer } from "./canvas-renderer";
import { ShapeRenderer, Transform2D } from "./components";

export class RenderSystem implements System {
  readonly name = "RenderSystem";

  constructor(private readonly renderer: CanvasRenderer) {}

  update({ world }: Parameters<System["update"]>[0]): void {
    this.renderer.clear();

    for (const result of world.query(Transform2D, ShapeRenderer)) {
      this.renderer.drawShape(
        result.get(Transform2D),
        result.get(ShapeRenderer)
      );
    }
  }
}
