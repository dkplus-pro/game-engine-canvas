import { Rect, Vec2, type Vec2Like } from "@game-engine-canvas/engine";
import { BALL_DIAMETER, BALL_RADIUS, FOOT_SPOT, HEAD_SPOT, POCKET_RADIUS, TABLE_RECT, pockets } from "./constants";

export interface Pocket {
  readonly id: string;
  readonly position: Vec2;
  readonly radius: number;
}

export interface TableGeometry {
  readonly bounds: Rect;
  readonly playfield: Rect;
  readonly pockets: Pocket[];
}

/** 桌面几何来自当前 Canvas 坐标常量，供课程和测试复用。 */
export function createTableGeometry(): TableGeometry {
  return {
    bounds: new Rect(0, 0, TABLE_RECT.width + TABLE_RECT.x * 2, TABLE_RECT.height + TABLE_RECT.y * 2),
    playfield: TABLE_RECT,
    pockets: pockets.map((position, index) => ({ id: `pocket-${index + 1}`, position: position.clone(), radius: POCKET_RADIUS }))
  };
}

export function createCueBallPosition(): Vec2 {
  return HEAD_SPOT.clone();
}

export function createRackPositions(): Vec2[] {
  const positions: Vec2[] = [];
  for (let row = 0; row < 5; row += 1) {
    const x = FOOT_SPOT.x + row * BALL_DIAMETER * 0.88;
    const rowStartY = FOOT_SPOT.y - (row * BALL_DIAMETER) / 2;
    for (let slot = 0; slot <= row; slot += 1) {
      positions.push(new Vec2(x, rowStartY + slot * BALL_DIAMETER));
    }
  }
  return positions;
}

export function isBallInPocket(position: Vec2Like): Pocket | undefined {
  return createTableGeometry().pockets.find((pocket) => pocket.position.distanceTo(position) <= pocket.radius);
}

export function getCueBallSpot(): Vec2 {
  return new Vec2(Math.max(HEAD_SPOT.x, TABLE_RECT.left + BALL_RADIUS), HEAD_SPOT.y);
}
