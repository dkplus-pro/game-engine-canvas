import { Rect, Vec2 } from "@game-engine-canvas/engine";
import { BALL_DIAMETER, BALL_RADIUS, POCKET_RADIUS, RAIL_SIZE, TABLE_HEIGHT, TABLE_WIDTH } from "./constants";
import type { Pocket, TableGeometry } from "./types";

export function createTableGeometry(): TableGeometry {
  const bounds = new Rect(0, 0, TABLE_WIDTH, TABLE_HEIGHT);
  const playfield = new Rect(RAIL_SIZE, RAIL_SIZE, TABLE_WIDTH - RAIL_SIZE * 2, TABLE_HEIGHT - RAIL_SIZE * 2);
  const centerX = playfield.x + playfield.width / 2;
  const right = playfield.right;
  const bottom = playfield.bottom;

  return {
    bounds,
    playfield,
    pockets: [
      pocket("top-left", playfield.left, playfield.top),
      pocket("top-middle", centerX, playfield.top - 2),
      pocket("top-right", right, playfield.top),
      pocket("bottom-left", playfield.left, bottom),
      pocket("bottom-middle", centerX, bottom + 2),
      pocket("bottom-right", right, bottom)
    ]
  };
}

export function createCueBallPosition(table: TableGeometry): Vec2 {
  return new Vec2(table.playfield.left + table.playfield.width * 0.25, table.playfield.center.y);
}

export function createRackPositions(table: TableGeometry): Vec2[] {
  const apex = new Vec2(table.playfield.left + table.playfield.width * 0.68, table.playfield.center.y);
  const positions: Vec2[] = [];

  for (let row = 0; row < 5; row += 1) {
    for (let slot = 0; slot <= row; slot += 1) {
      positions.push(
        new Vec2(
          apex.x + row * BALL_DIAMETER * 0.88,
          apex.y + (slot - row / 2) * BALL_DIAMETER * 1.04
        )
      );
    }
  }

  return positions;
}

export function isBallInPocket(position: Vec2, table: TableGeometry): Pocket | undefined {
  return table.pockets.find((pocket) => position.distanceTo(pocket.position) <= pocket.radius);
}

export function getCueBallSpot(table: TableGeometry): Vec2 {
  const base = createCueBallPosition(table);
  // Place ball fully inside the playfield after a scratch, even if table constants change.
  return new Vec2(Math.max(base.x, table.playfield.left + BALL_RADIUS), base.y);
}

function pocket(id: string, x: number, y: number): Pocket {
  return { id, position: new Vec2(x, y), radius: POCKET_RADIUS };
}
