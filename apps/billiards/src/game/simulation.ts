import { InputState, Vec2, World, clamp, type System } from "@game-engine-canvas/engine";
import { BALL_RADIUS, HEAD_SPOT, MAX_SHOT_SPEED, MIN_SHOT_SPEED, PLAY_MAX_Y, PLAY_MIN_Y, SHOT_SETTLE_DELAY } from "./constants";
import { readBilliardsCommand } from "./input";
import { advanceBilliardsPhysics, areBallsStopped, stopSlowBalls } from "./physics";
import {
  canLegallyPocketEight,
  createBilliardsState,
  getCueBall,
  getRemainingByGroup,
  groupForKind,
  otherGroup,
  otherPlayer
} from "./table";
import type { BallGroup, BilliardsCommand, BilliardsState, HudSnapshot, PlayerId } from "./types";

export interface BilliardsRuntime {
  readonly input: InputState;
  readonly state: BilliardsState;
  readonly world: World;
  releasedPower: number;
}

export function createBilliardsRuntime(): BilliardsRuntime {
  const runtime: BilliardsRuntime = {
    input: new InputState(),
    state: createBilliardsState(),
    world: new World(),
    releasedPower: 0
  };
  const rulesSystem: System = {
    name: "BilliardsRules",
    update: ({ deltaTime }) => {
      updateBilliards(runtime.state, readBilliardsCommand(runtime.input, runtime.state, runtime.releasedPower), deltaTime);
      runtime.releasedPower = 0;
    }
  };

  runtime.world.addSystem(rulesSystem);
  return runtime;
}

export function updateBilliards(state: BilliardsState, command: BilliardsCommand, deltaTime: number): void {
  if (command.pausePressed && state.status !== "won") {
    togglePause(state);
  }
  if (state.status === "paused" || state.status === "won") return;

  if (command.aimAt && state.status === "aiming" && !getCueBall(state).pocketed) {
    state.aimAngle = Math.atan2(command.aimAt.y - getCueBall(state).position.y, command.aimAt.x - getCueBall(state).position.x);
  }

  if (state.status === "aiming" && command.shoot) {
    shootCueBall(state, command.shoot.angle, command.shoot.power);
  }

  if (state.status === "rolling") {
    advanceBilliardsPhysics(state, deltaTime);
    if (areBallsStopped(state)) {
      state.shot!.elapsedAfterStop += deltaTime;
      if (state.shot!.elapsedAfterStop >= SHOT_SETTLE_DELAY) {
        settleShot(state);
      }
    } else if (state.shot) {
      state.shot.elapsedAfterStop = 0;
    }
  }
}

export function shootCueBall(state: BilliardsState, angle: number, power: number): void {
  const cue = getCueBall(state);
  if (state.status !== "aiming" || cue.pocketed) return;
  const safePower = clamp(power, 0.05, 1);
  const speed = MIN_SHOT_SPEED + (MAX_SHOT_SPEED - MIN_SHOT_SPEED) * safePower;

  cue.velocity.set(Math.cos(angle) * speed, Math.sin(angle) * speed);
  state.aimAngle = angle;
  state.shotPower = safePower;
  state.status = "rolling";
  state.previousStatus = "rolling";
  state.shot = {
    pocketedNumbers: [],
    cuePocketed: false,
    cushionHits: 0,
    collisions: 0,
    elapsedAfterStop: 0
  };
  state.stats.shots += 1;
  state.message = `玩家 ${state.currentPlayer} 出杆中：等待所有球停止`;
}

export function settleShot(state: BilliardsState): void {
  const shot = state.shot;
  if (!shot) return;
  stopSlowBalls(state);

  const current = state.currentPlayer;
  const opponent = otherPlayer(current);
  const pocketedBalls = shot.pocketedNumbers
    .map((number) => state.balls.find((ball) => ball.number === number))
    .filter((ball): ball is NonNullable<typeof ball> => Boolean(ball));
  const pocketedGroups = pocketedBalls.map((ball) => groupForKind(ball.kind)).filter((group): group is BallGroup => Boolean(group));

  if (shot.cuePocketed) {
    state.stats.fouls += 1;
    spotCueBall(state);
    switchTurn(state, `母球落袋犯规，玩家 ${state.currentPlayer} 获得手中球`);
    return;
  }

  if (shot.pocketedNumbers.includes(8)) {
    const legal = canLegallyPocketEight(state, current);
    state.status = "won";
    state.previousStatus = "won";
    state.winner = legal ? current : opponent;
    state.message = legal ? `玩家 ${current} 合法打进 8 号球，赢得对局` : `8 号球过早落袋，玩家 ${opponent} 获胜`;
    state.shot = undefined;
    return;
  }

  const assignedGroup = maybeAssignGroups(state, current, pocketedGroups);
  const currentGroup = state.players[current].group;
  const legalPocket = Boolean(currentGroup && pocketedGroups.includes(currentGroup));
  const noRailOrObject = shot.collisions === 0 && shot.cushionHits === 0 && shot.pocketedNumbers.length === 0;

  if (noRailOrObject) {
    state.stats.fouls += 1;
    switchTurn(state, `空杆犯规，玩家 ${state.currentPlayer} 继续`);
    return;
  }

  if (legalPocket || assignedGroup) {
    state.status = "aiming";
    state.previousStatus = "aiming";
    state.shot = undefined;
    state.message = assignedGroup
      ? `玩家 ${current} 认领${labelGroup(assignedGroup)}，继续出杆`
      : `玩家 ${current} 打进目标球，继续出杆`;
    return;
  }

  switchTurn(state, `未打进己方目标球，轮到玩家 ${state.currentPlayer}`);
}

export function getHudSnapshot(state: BilliardsState): HudSnapshot {
  return {
    currentPlayer: state.currentPlayer,
    status: state.status,
    stateLabel: state.status === "aiming" ? "AIM" : state.status === "rolling" ? "ROLLING" : state.status === "paused" ? "PAUSED" : "GAME OVER",
    playerOneGroup: labelGroup(state.players[1].group),
    playerTwoGroup: labelGroup(state.players[2].group),
    solidsLeft: getRemainingByGroup(state, "solids"),
    stripesLeft: getRemainingByGroup(state, "stripes"),
    shots: state.stats.shots,
    message: state.message,
    power: state.shotPower
  };
}

function maybeAssignGroups(state: BilliardsState, player: PlayerId, pocketedGroups: BallGroup[]): BallGroup | undefined {
  if (state.players[1].group || state.players[2].group) return undefined;
  const group = pocketedGroups[0];
  if (!group) return undefined;
  state.players[player].group = group;
  state.players[otherPlayer(player)].group = otherGroup(group);
  return group;
}

function switchTurn(state: BilliardsState, message: string): void {
  state.currentPlayer = otherPlayer(state.currentPlayer);
  state.status = "aiming";
  state.previousStatus = "aiming";
  state.shot = undefined;
  state.message = message;
}

function togglePause(state: BilliardsState): void {
  if (state.status === "paused") {
    state.status = state.previousStatus;
    state.message = state.status === "rolling" ? "继续等待球停止" : `玩家 ${state.currentPlayer} 继续瞄准`;
    return;
  }
  state.previousStatus = state.status;
  state.status = "paused";
  state.message = "暂停中：按 P 或按钮继续";
}

function spotCueBall(state: BilliardsState): void {
  const cue = getCueBall(state);
  cue.pocketed = false;
  cue.velocity.set(0, 0);
  cue.position.copy(findSafeCueSpot(state));
}

function findSafeCueSpot(state: BilliardsState): Vec2 {
  for (let offset = 0; offset < 140; offset += BALL_RADIUS * 2.2) {
    for (const sign of [0, 1, -1]) {
      const candidate = new Vec2(HEAD_SPOT.x, clamp(HEAD_SPOT.y + sign * offset, PLAY_MIN_Y + BALL_RADIUS, PLAY_MAX_Y - BALL_RADIUS));
      const blocked = state.balls.some(
        (ball) => ball.number !== 0 && !ball.pocketed && candidate.distanceTo(ball.position) < BALL_RADIUS * 2.25
      );
      if (!blocked) return candidate;
    }
  }
  return HEAD_SPOT.clone();
}

function labelGroup(group?: BallGroup): string {
  if (group === "solids") return "低号";
  if (group === "stripes") return "花色";
  return "未定";
}
