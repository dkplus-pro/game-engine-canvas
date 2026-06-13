import type { System } from "../ecs";
import { Transform2D } from "../render";
import { AabbCollider, type CollisionPair, getAabb } from "./aabb-collider";

export class CollisionSystem implements System {
  readonly name = "CollisionSystem";
  private readonly collisions: CollisionPair[] = [];

  update({ world }: Parameters<System["update"]>[0]): void {
    this.collisions.length = 0;
    const colliders = world.query(Transform2D, AabbCollider);

    for (let i = 0; i < colliders.length; i += 1) {
      for (let j = i + 1; j < colliders.length; j += 1) {
        const a = colliders[i];
        const b = colliders[j];

        if (!a || !b) {
          continue;
        }

        const aBox = getAabb(a.get(Transform2D), a.get(AabbCollider));
        const bBox = getAabb(b.get(Transform2D), b.get(AabbCollider));

        if (aBox.intersects(bBox)) {
          this.collisions.push({ a: a.entity, b: b.entity });
        }
      }
    }
  }

  getCollisions(): CollisionPair[] {
    return [...this.collisions];
  }

  hasCollision(a: number, b: number): boolean {
    return this.collisions.some(
      (pair) => (pair.a === a && pair.b === b) || (pair.a === b && pair.b === a)
    );
  }
}
