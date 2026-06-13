import { Vec2, type Vec2Like } from "../math";

export class Transform2D {
  readonly position: Vec2;
  readonly scale: Vec2;

  constructor(options: Transform2DOptions = {}) {
    this.position = Vec2.from(options.position ?? { x: 0, y: 0 });
    this.rotation = options.rotation ?? 0;
    this.scale = Vec2.from(options.scale ?? { x: 1, y: 1 });
  }

  rotation: number;
}

export interface Transform2DOptions {
  readonly position?: Vec2Like;
  readonly rotation?: number;
  readonly scale?: Vec2Like;
}

export class ShapeRenderer {
  constructor(public readonly options: ShapeRendererOptions) {}
}

export type ShapeKind = "rect" | "circle";

export interface ShapeRendererOptions {
  readonly kind: ShapeKind;
  readonly width?: number;
  readonly height?: number;
  readonly radius?: number;
  readonly fillStyle: string;
  readonly strokeStyle?: string;
  readonly lineWidth?: number;
}
