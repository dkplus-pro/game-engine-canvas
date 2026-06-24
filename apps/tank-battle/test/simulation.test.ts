import { describe, expect, it } from "vitest";
import { BULLET_SPEED, TILE_SIZE, Tile } from "../src/game/constants";
import { createTankBattleState, getHudSnapshot, updateTankBattle } from "../src/game/simulation";
import type { Bullet, TankCommand } from "../src/game/types";

const idleCommand: TankCommand = { fire: false, pausePressed: false };

function bulletAt(tileX: number, tileY: number, power = 1): Bullet {
  return {
    id: `bullet-${tileX}-${tileY}-${power}`,
    ownerId: "player-1",
    team: "player",
    x: tileX * TILE_SIZE + TILE_SIZE / 2,
    y: tileY * TILE_SIZE + TILE_SIZE / 2,
    vx: 0,
    vy: -BULLET_SPEED,
    ttl: 1,
    power
  };
}

describe("tank battle simulation", () => {
  it("pauses before advancing bullets or enemy timers", () => {
    const state = createTankBattleState(1);
    state.enemyReserve = 0;
    state.bullets = [bulletAt(5, 5)];
    const beforeX = state.bullets[0]!.x;

    updateTankBattle(state, { fire: false, pausePressed: true }, 1);

    expect(state.status).toBe("paused");
    expect(state.bullets[0]?.x).toBe(beforeX);
  });

  it("lets bullets destroy brick but not regular steel", () => {
    const state = createTankBattleState(1);
    state.enemyReserve = 0;
    state.level.map.set(4, 4, Tile.Brick).set(6, 6, Tile.Steel);
    state.bullets = [bulletAt(4, 4), bulletAt(6, 6)];

    updateTankBattle(state, idleCommand, 0.016);

    expect(state.level.map.get(4, 4)).toBe(Tile.Empty);
    expect(state.level.map.get(6, 6)).toBe(Tile.Steel);
    expect(state.bullets).toHaveLength(0);
  });

  it("allows rapid power bullets to break steel", () => {
    const state = createTankBattleState(1);
    state.enemyReserve = 0;
    state.level.map.set(7, 7, Tile.Steel);
    state.bullets = [bulletAt(7, 7, 2)];

    updateTankBattle(state, idleCommand, 0.016);

    expect(state.level.map.get(7, 7)).toBe(Tile.Empty);
  });

  it("ends the game when the base or final player life is hit", () => {
    const baseState = createTankBattleState(1);
    baseState.enemyReserve = 0;
    baseState.bullets = [bulletAt(12, 24)];
    updateTankBattle(baseState, idleCommand, 0.016);
    expect(baseState.status).toBe("lost");
    expect(getHudSnapshot(baseState).message).toBe("基地被击毁");

    const playerState = createTankBattleState(1);
    playerState.enemyReserve = 0;
    playerState.lives = 1;
    playerState.player.shieldTime = 0;
    playerState.player.spawnGrace = 0;
    playerState.bullets = [
      {
        ...bulletAt(0, 0),
        team: "enemy",
        ownerId: "enemy-1",
        x: playerState.player.x + 4,
        y: playerState.player.y + 4,
        vx: 0,
        vy: 0
      }
    ];

    updateTankBattle(playerState, idleCommand, 0.016);

    expect(playerState.status).toBe("lost");
    expect(playerState.lives).toBe(0);
  });
});
