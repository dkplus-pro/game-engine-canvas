import { Vec2, clamp } from "@game-engine-canvas/engine";
import { EIGHT_BALL_NUMBER, MAX_SHOT_POWER, MIN_SHOT_POWER, SHOT_SPEED } from "./constants";
import { areBallsSleeping, updateBilliardsPhysics } from "./physics";
import { createTurnStats, getCueBall, getOpponent, getRemainingObjectBalls, resetCueBall } from "./state";
import type { BilliardsState, ShotCommand } from "./types";

export function strikeCueBall(state: BilliardsState, command: ShotCommand): boolean {
  if (state.phase !== "aiming" || state.winner) return false;

  const direction = Vec2.from(command.direction);
  if (direction.length() === 0) return false;

  const power = clamp(command.power, MIN_SHOT_POWER, MAX_SHOT_POWER);
  const cue = getCueBall(state);
  state.turn = createTurnStats(state.activePlayer);
  cue.velocity.copy(direction.normalize().scale(power * SHOT_SPEED));
  state.phase = "rolling";
  state.shotCount += 1;
  state.message = `玩家 ${state.activePlayer} 出杆`;
  return true;
}

export function updateBilliardsRules(state: BilliardsState, deltaTime: number): void {
  if (state.phase !== "rolling") return;

  updateBilliardsPhysics(state, deltaTime);
  if (!areBallsSleeping(state)) return;

  settleTurn(state);
}

export function settleTurn(state: BilliardsState): void {
  const turn = state.turn;
  const pocketedObjects = turn.pocketedNumbers.filter((number) => number > 0);
  const pocketedEight = pocketedObjects.includes(EIGHT_BALL_NUMBER);
  const remainingNonEight = getRemainingObjectBalls(state).some((ball) => ball.number !== EIGHT_BALL_NUMBER);

  if (turn.scratch) {
    turn.foul = "scratch";
    resetCueBall(state);
  }

  if (pocketedEight && remainingNonEight) {
    turn.foul = "early-eight";
    state.winner = getOpponent(turn.player);
    state.phase = "ended";
    state.message = `8 号球过早落袋，玩家 ${state.winner} 获胜`;
    return;
  }

  if (getRemainingObjectBalls(state).length === 0) {
    state.winner = turn.player;
    state.phase = "ended";
    state.message = `玩家 ${state.winner} 清台获胜`;
    return;
  }

  const keepsTurn = pocketedObjects.length > 0 && !turn.scratch;
  if (!keepsTurn) {
    state.activePlayer = getOpponent(state.activePlayer);
  }

  state.phase = "aiming";
  state.message = keepsTurn
    ? `玩家 ${state.activePlayer} 继续击球`
    : turn.scratch
      ? `玩家 ${turn.player} 洗袋犯规，玩家 ${state.activePlayer} 获得球权`
      : `未进球，轮到玩家 ${state.activePlayer}`;
  state.turn = createTurnStats(state.activePlayer);
}
