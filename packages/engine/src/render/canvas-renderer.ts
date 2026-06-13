import type { AssetStore } from "../assets";
import type { ShapeRenderer, SpriteRenderer, Transform2D } from "./components";

export interface CanvasRendererOptions {
  readonly context: CanvasRenderingContext2D;
  readonly width: number;
  readonly height: number;
  readonly background?: string;
  readonly assets?: AssetStore;
}

export class CanvasRenderer {
  constructor(private readonly options: CanvasRendererOptions) {}

  clear(): void {
    const { context, width, height, background } = this.options;
    context.clearRect(0, 0, width, height);

    if (background) {
      context.fillStyle = background;
      context.fillRect(0, 0, width, height);
    }
  }

  drawShape(transform: Transform2D, shape: ShapeRenderer): void {
    const { context } = this.options;
    const { options } = shape;

    context.save();
    context.translate(transform.position.x, transform.position.y);
    context.rotate(transform.rotation);
    context.scale(transform.scale.x, transform.scale.y);
    context.fillStyle = options.fillStyle;

    if (options.strokeStyle) {
      context.strokeStyle = options.strokeStyle;
      context.lineWidth = options.lineWidth ?? 1;
    }

    if (options.kind === "circle") {
      context.beginPath();
      context.arc(0, 0, options.radius ?? 16, 0, Math.PI * 2);
      context.fill();

      if (options.strokeStyle) {
        context.stroke();
      }
    } else {
      const width = options.width ?? 32;
      const height = options.height ?? 32;
      context.fillRect(-width / 2, -height / 2, width, height);

      if (options.strokeStyle) {
        context.strokeRect(-width / 2, -height / 2, width, height);
      }
    }

    context.restore();
  }

  drawSprite(transform: Transform2D, sprite: SpriteRenderer): void {
    const { context, assets } = this.options;
    const image = assets?.getImage(sprite.options.imageKey);

    if (!image) {
      return;
    }

    context.save();
    context.translate(transform.position.x, transform.position.y);
    context.rotate(transform.rotation);
    context.scale(transform.scale.x, transform.scale.y);

    const { width, height, sourceX, sourceY, sourceWidth, sourceHeight } =
      sprite.options;

    if (
      sourceX !== undefined &&
      sourceY !== undefined &&
      sourceWidth !== undefined &&
      sourceHeight !== undefined
    ) {
      context.drawImage(
        image,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        -width / 2,
        -height / 2,
        width,
        height
      );
    } else {
      context.drawImage(image, -width / 2, -height / 2, width, height);
    }

    context.restore();
  }
}
