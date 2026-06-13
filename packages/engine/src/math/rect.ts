import type { Vec2Like } from "./vec2";

export class Rect {
  constructor(
    public x = 0,
    public y = 0,
    public width = 0,
    public height = 0
  ) {}

  get left(): number {
    return this.x;
  }

  get right(): number {
    return this.x + this.width;
  }

  get top(): number {
    return this.y;
  }

  get bottom(): number {
    return this.y + this.height;
  }

  get center(): Vec2Like {
    return {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2
    };
  }

  clone(): Rect {
    return new Rect(this.x, this.y, this.width, this.height);
  }

  containsPoint(point: Vec2Like): boolean {
    return (
      point.x >= this.left &&
      point.x <= this.right &&
      point.y >= this.top &&
      point.y <= this.bottom
    );
  }

  intersects(other: RectLike): boolean {
    return (
      this.left < other.x + other.width &&
      this.right > other.x &&
      this.top < other.y + other.height &&
      this.bottom > other.y
    );
  }
}

export interface RectLike {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}
