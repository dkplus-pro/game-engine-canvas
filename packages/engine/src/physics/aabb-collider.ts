import { Rect, type Vec2Like } from "../math";
import type { EntityId } from "../ecs";
import type { Transform2D } from "../render";

export class AabbCollider {
  constructor(public readonly options: AabbColliderOptions) {}
}

export interface AabbColliderOptions {
  readonly width: number;
  readonly height: number;
  readonly offset?: Vec2Like;
  readonly layer?: string;
}

export interface CollisionPair {
  readonly a: EntityId;
  readonly b: EntityId;
}

export function getAabb(transform: Transform2D, collider: AabbCollider): Rect {
  const offset = collider.options.offset ?? { x: 0, y: 0 };

  return new Rect(
    transform.position.x + offset.x - collider.options.width / 2,
    transform.position.y + offset.y - collider.options.height / 2,
    collider.options.width,
    collider.options.height
  );
}
