export class Vec2 {
  constructor(
    public x = 0,
    public y = 0
  ) {}

  static zero(): Vec2 {
    return new Vec2(0, 0);
  }

  static from(value: Vec2Like): Vec2 {
    return new Vec2(value.x, value.y);
  }

  clone(): Vec2 {
    return new Vec2(this.x, this.y);
  }

  set(x: number, y: number): this {
    this.x = x;
    this.y = y;
    return this;
  }

  copy(value: Vec2Like): this {
    this.x = value.x;
    this.y = value.y;
    return this;
  }

  add(value: Vec2Like): this {
    this.x += value.x;
    this.y += value.y;
    return this;
  }

  subtract(value: Vec2Like): this {
    this.x -= value.x;
    this.y -= value.y;
    return this;
  }

  scale(scalar: number): this {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }

  lengthSquared(): number {
    return this.x * this.x + this.y * this.y;
  }

  length(): number {
    return Math.sqrt(this.lengthSquared());
  }

  normalize(): this {
    const length = this.length();

    if (length > 0) {
      this.x /= length;
      this.y /= length;
    }

    return this;
  }

  distanceTo(value: Vec2Like): number {
    return Math.sqrt(this.distanceToSquared(value));
  }

  distanceToSquared(value: Vec2Like): number {
    const dx = this.x - value.x;
    const dy = this.y - value.y;
    return dx * dx + dy * dy;
  }

  dot(value: Vec2Like): number {
    return this.x * value.x + this.y * value.y;
  }

  lerp(target: Vec2Like, amount: number): this {
    this.x = lerp(this.x, target.x, amount);
    this.y = lerp(this.y, target.y, amount);
    return this;
  }
}

export interface Vec2Like {
  readonly x: number;
  readonly y: number;
}

export function addVec2(a: Vec2Like, b: Vec2Like): Vec2 {
  return new Vec2(a.x + b.x, a.y + b.y);
}

export function subtractVec2(a: Vec2Like, b: Vec2Like): Vec2 {
  return new Vec2(a.x - b.x, a.y - b.y);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function lerp(start: number, end: number, amount: number): number {
  return start + (end - start) * amount;
}
