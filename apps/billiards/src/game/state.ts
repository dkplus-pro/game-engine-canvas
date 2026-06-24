import { Vec2 } from "@game-engine-canvas/engine";
import { CUE_BALL_ID, EIGHT_BALL_NUMBER, OBJECT_BALL_COUNT } from "./constants";
import { createCueBallPosition, createRackPositions, createTableGeometry, getCueBallSpot } from "./table";
import type { Ball, BallKind, BilliardsState, HudSnapshot, PlayerId, TableGeometry, TurnStats } from "./types";

export function createBilliardsState(): BilliardsState {
  const table = createTableGeometry();
  const balls = createInitialBalls(table);
  const activePlayer: PlayerId = 1;

  return {
    table,
    balls,
    phase: "aiming",
    activePlayer,
    message: "拖拽或调用 strikeCueBall 蓄力开球",
    shotCount: 0,
    turn: createTurnStats(activePlayer)
  };
}

export function createInitialBalls(table: TableGeometry): Ball[] {
  const rack = createRackPositions(table);
  const balls: Ball[] = [
    {
      id: CUE_BALL_ID,
      number: 0,
      kind: "cue",
      position: createCueBallPosition(table),
      velocity: Vec2.zero(),
      pocketed: false
    }
  ];

  for (let number = 1; number <= OBJECT_BALL_COUNT; number += 1) {
    balls.push({
      id: `ball-${number}`,
      number,
      kind: getBallKind(number),
      position: rack[number - 1]!.clone(),
      velocity: Vec2.zero(),
      pocketed: false
    });
  }

  return balls;
}

export function getCueBall(state: BilliardsState): Ball {
  const cue = state.balls.find((ball) => ball.id === CUE_BALL_ID);
  if (!cue) {
    throw new Error("Billiards state is missing the cue ball");
  }
  return cue;
}

export function getObjectBalls(state: BilliardsState): Ball[] {
  return state.balls.filter((ball) => ball.id !== CUE_BALL_ID);
}

export function getRemainingObjectBalls(state: BilliardsState): Ball[] {
  return getObjectBalls(state).filter((ball) => !ball.pocketed);
}

export function resetCueBall(state: BilliardsState): void {
  const cue = getCueBall(state);
  cue.position.copy(getCueBallSpot(state.table));
  cue.velocity.set(0, 0);
  cue.pocketed = false;
}

export function createTurnStats(player: PlayerId): TurnStats {
  return { player, pocketedNumbers: [], scratch: false };
}

export function getOpponent(player: PlayerId): PlayerId {
  return player === 1 ? 2 : 1;
}

export function getHudSnapshot(state: BilliardsState): HudSnapshot {
  return {
    activePlayer: state.activePlayer,
    phase: state.phase,
    remainingBalls: getRemainingObjectBalls(state).length,
    winner: state.winner,
    message: state.message
  };
}

function getBallKind(number: number): BallKind {
  if (number === EIGHT_BALL_NUMBER) return "eight";
  return number < EIGHT_BALL_NUMBER ? "solid" : "stripe";
}
