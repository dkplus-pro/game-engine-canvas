import { Rect, Vec2, clamp, lerp } from "@game-engine-canvas/engine";

export function createMathSnapshot() {
  const start = new Vec2(48, 96);
  const target = new Vec2(420, 260);
  const current = start.clone().lerp(target, 0.35);
  const direction = target.clone().subtract(current).normalize();
  const next = current.clone().add(direction.clone().scale(80));
  const bounds = new Rect(32, 48, 520, 300);
  const actor = new Rect(next.x, next.y, 72, 52);
  const sensor = new Rect(320, 190, 120, 90);

  return {
    start,
    target,
    current,
    next: new Vec2(
      clamp(next.x, bounds.left, bounds.right - actor.width),
      clamp(next.y, bounds.top, bounds.bottom - actor.height)
    ),
    bounds,
    actor,
    sensor,
    intersects: actor.intersects(sensor),
    distance: current.distanceTo(target),
    blend: lerp(0, 100, 0.35)
  };
}
