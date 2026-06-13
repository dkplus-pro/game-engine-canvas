import { describe, expect, it } from "vitest";
import { Rect, Vec2, clamp, lerp } from "../src";

describe("Vec2", () => {
  it("supports mutable vector operations", () => {
    const vector = new Vec2(3, 4);

    vector.normalize().scale(10).add({ x: 1, y: 2 });

    expect(vector.x).toBeCloseTo(7);
    expect(vector.y).toBeCloseTo(10);
  });

  it("calculates distance and dot product", () => {
    const vector = new Vec2(2, 3);

    expect(vector.distanceTo({ x: 5, y: 7 })).toBe(5);
    expect(vector.dot({ x: 4, y: 2 })).toBe(14);
  });
});

describe("Rect", () => {
  it("detects point containment and intersection", () => {
    const rect = new Rect(10, 20, 30, 40);

    expect(rect.containsPoint({ x: 12, y: 22 })).toBe(true);
    expect(rect.containsPoint({ x: 50, y: 22 })).toBe(false);
    expect(rect.intersects(new Rect(35, 55, 20, 20))).toBe(true);
    expect(rect.intersects(new Rect(80, 80, 10, 10))).toBe(false);
  });
});

describe("math helpers", () => {
  it("clamps and interpolates numbers", () => {
    expect(clamp(12, 0, 10)).toBe(10);
    expect(clamp(-2, 0, 10)).toBe(0);
    expect(lerp(10, 20, 0.25)).toBe(12.5);
  });
});
