import { Vec2 } from "@game-engine-canvas/engine";
import { BALL_RADIUS, CUE_START, RACK_APEX } from "./constants";
import type { Ball, BallGroup, BallKind, BilliardsState, PlayerId } from "./types";

const rackRows = [1, 2, 3, 4, 5] as const;
const rackNumbers = [1, 9, 2, 10, 8, 3, 11, 4, 12, 5, 13, 6, 14, 7, 15] as const;

export function createBilliardsState(): BilliardsState {
  return {
    balls: [createBall(0, CUE_START.x, CUE_START.y), ...createRackBalls()],
    players: {
      1: { id: 1 },
      2: { id: 2 }
    },
    currentPlayer: 1,
    status: "aiming",
    previousStatus: "aiming",
    message: "玩家 1 开球：拖拽蓄力，松手击球",
    aimAngle: 0,
    shotPower: 0,
    stats: {
      shots: 0,
      collisions: 0,
      pockets: 0,
      fouls: 0
    }
  };
}

export function createRackBalls(): Ball[] {
  const balls: Ball[] = [];
  let index = 0;
  const rowSpacing = BALL_RADIUS * Math.sqrt(3) + 1.2;
  const columnSpacing = BALL_RADIUS * 2 + 1.2;

  for (let rowIndex = 0; rowIndex < rackRows.length; rowIndex += 1) {
    const rowCount = rackRows[rowIndex]!;
    const x = RACK_APEX.x + rowIndex * rowSpacing;
    const firstY = RACK_APEX.y - ((rowCount - 1) * columnSpacing) / 2;
    for (let item = 0; item < rowCount; item += 1) {
      const number = rackNumbers[index++]!;
      balls.push(createBall(number, x, firstY + item * columnSpacing));
    }
  }

  return balls;
}

export function createBall(number: number, x: number, y: number): Ball {
  return {
    id: number === 0 ? "cue" : `ball-${number}`,
    number,
    kind: getBallKind(number),
    position: new Vec2(x, y),
    velocity: Vec2.zero(),
    pocketed: false
  };
}

export function getBallKind(number: number): BallKind {
  if (number === 0) return "cue";
  if (number === 8) return "eight";
  return number < 8 ? "solid" : "stripe";
}

export function groupForKind(kind: BallKind): BallGroup | undefined {
  if (kind === "solid") return "solids";
  if (kind === "stripe") return "stripes";
  return undefined;
}

export function otherPlayer(player: PlayerId): PlayerId {
  return player === 1 ? 2 : 1;
}

export function otherGroup(group: BallGroup): BallGroup {
  return group === "solids" ? "stripes" : "solids";
}

export function getCueBall(state: BilliardsState): Ball {
  const cue = state.balls.find((ball) => ball.number === 0);
  if (!cue) throw new Error("Billiards state is missing the cue ball");
  return cue;
}

export function getEightBall(state: BilliardsState): Ball {
  const eight = state.balls.find((ball) => ball.number === 8);
  if (!eight) throw new Error("Billiards state is missing the eight ball");
  return eight;
}

export function getRemainingByGroup(state: BilliardsState, group: BallGroup): number {
  return state.balls.filter((ball) => !ball.pocketed && groupForKind(ball.kind) === group).length;
}

export function canLegallyPocketEight(state: BilliardsState, player: PlayerId): boolean {
  const group = state.players[player].group;
  return Boolean(group) && getRemainingByGroup(state, group!) === 0;
}
