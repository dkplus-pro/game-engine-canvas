import { InputState, Rect, World, clamp, createSeededRandom, randomInt, type System } from "@game-engine-canvas/engine";
import {
  BULLET_SPEED,
  ENEMY_FIRE_COOLDOWN,
  ENEMY_SPEED,
  FIELD_COLUMNS,
  FIELD_ROWS,
  LOGICAL_HEIGHT,
  LOGICAL_WIDTH,
  PLAYER_FIRE_COOLDOWN,
  PLAYER_SPEED,
  TANK_SIZE,
  TILE_SIZE,
  Tile,
  directionVectors,
  directions
} from "./constants";
import { getLevelConfig } from "./levels";
import { generateTankLevel, getTileKind, isBulletBlockedTile, isTankBlockedTile } from "./map-generator";
import { readTankCommand } from "./input";
import type { Bullet, Direction, Explosion, HudSnapshot, PowerUp, PowerUpKind, Tank, TankBattleState, TankCommand } from "./types";

export function createTankBattleState(levelId: number): TankBattleState {
  const level = generateTankLevel(getLevelConfig(levelId));
  const rng = createSeededRandom(level.config.seed + 77);

  return {
    level,
    rng,
    status: "playing",
    player: createTank("player-1", "player", level.playerSpawn.x, level.playerSpawn.y, "up", PLAYER_SPEED),
    enemies: [],
    bullets: [],
    powerUps: [],
    explosions: [],
    score: 0,
    lives: 3,
    enemyReserve: level.config.enemyBudget,
    spawnTimer: 0,
    freezeTimer: 0,
    message: "守住基地，击毁所有敌人",
    elapsedTime: 0,
    nextId: 1
  };
}

export function createTankBattleRuntime(levelId: number) {
  const input = new InputState();
  const state = createTankBattleState(levelId);
  const world = new World();
  const rulesSystem: System = {
    name: "TankBattleRules",
    update: ({ deltaTime }) => updateTankBattle(state, readTankCommand(input), deltaTime)
  };

  world.addSystem(rulesSystem);
  return { input, state, world };
}

export function updateTankBattle(state: TankBattleState, command: TankCommand, deltaTime: number): void {
  const dt = Math.min(deltaTime, 0.05);
  if (command.pausePressed && state.status !== "won" && state.status !== "lost") {
    state.status = state.status === "paused" ? "playing" : "paused";
    state.message = state.status === "paused" ? "暂停中" : "继续战斗";
  }

  if (state.status !== "playing") {
    return;
  }

  state.elapsedTime += dt;
  state.freezeTimer = Math.max(0, state.freezeTimer - dt);
  updateTankTimers(state.player, dt);
  for (const enemy of state.enemies) updateTankTimers(enemy, dt);
  handlePlayer(state, command, dt);
  updateEnemies(state, dt);
  updateBullets(state, dt);
  updatePowerUps(state, dt);
  updateExplosions(state, dt);
  spawnEnemies(state, dt);

  if (state.enemyReserve <= 0 && state.enemies.length === 0 && state.status === "playing") {
    state.status = "won";
    state.message = "关卡清空，基地安全";
  }
}

export function getHudSnapshot(state: TankBattleState): HudSnapshot {
  return {
    level: state.level.config.id,
    score: state.score,
    lives: state.lives,
    enemiesLeft: state.enemyReserve + state.enemies.length,
    status: state.status,
    message: state.message
  };
}

function handlePlayer(state: TankBattleState, command: TankCommand, dt: number): void {
  if (command.direction) moveTank(state, state.player, command.direction, dt);
  if (command.fire) fireBullet(state, state.player);
  applyPowerUpPickup(state);
}

function updateEnemies(state: TankBattleState, dt: number): void {
  if (state.freezeTimer > 0) return;

  for (const enemy of state.enemies) {
    enemy.aiTimer -= dt;
    if (enemy.aiTimer <= 0) {
      enemy.direction = chooseEnemyDirection(state, enemy);
      enemy.aiTimer = 0.45 + state.rng() * 1.2;
    }

    moveTank(state, enemy, enemy.direction, dt);
    if (enemy.fireCooldown <= 0 && state.rng() < 0.018) {
      fireBullet(state, enemy);
    }
  }
}

function updateBullets(state: TankBattleState, dt: number): void {
  const survivors: Bullet[] = [];

  for (const bullet of state.bullets) {
    bullet.x += bullet.vx * dt;
    bullet.y += bullet.vy * dt;
    bullet.ttl -= dt;

    if (bullet.ttl <= 0 || bullet.x < 0 || bullet.y < 0 || bullet.x > LOGICAL_WIDTH || bullet.y > LOGICAL_HEIGHT) {
      continue;
    }
    if (hitTerrain(state, bullet) || hitTank(state, bullet)) {
      continue;
    }
    survivors.push(bullet);
  }

  state.bullets = survivors;
}

function updatePowerUps(state: TankBattleState, dt: number): void {
  state.powerUps = state.powerUps
    .map((powerUp) => ({ ...powerUp, ttl: powerUp.ttl - dt }))
    .filter((powerUp) => powerUp.ttl > 0);
}

function updateExplosions(state: TankBattleState, dt: number): void {
  state.explosions = state.explosions
    .map((explosion) => ({ ...explosion, age: explosion.age + dt }))
    .filter((explosion) => explosion.age < explosion.duration);
}

function spawnEnemies(state: TankBattleState, dt: number): void {
  if (state.enemyReserve <= 0 || state.enemies.length >= state.level.config.maxActiveEnemies) return;
  state.spawnTimer -= dt;
  if (state.spawnTimer > 0) return;

  const spawn = state.level.enemySpawns[randomInt(state.rng, 0, state.level.enemySpawns.length - 1)]!;
  const candidate = createTank(nextId(state, "enemy"), "enemy", spawn.x, spawn.y, "down", ENEMY_SPEED);
  if (!collidesWithTanks(state, candidate, candidate.x, candidate.y)) {
    state.enemies.push(candidate);
    state.enemyReserve -= 1;
    state.spawnTimer = 1.6;
    state.message = `敌军增援：剩余 ${state.enemyReserve + state.enemies.length}`;
  } else {
    state.spawnTimer = 0.6;
  }
}

function moveTank(state: TankBattleState, tank: Tank, direction: Direction, dt: number): void {
  const vector = directionVectors[direction];
  const nextX = tank.x + vector.x * tank.speed * dt;
  const nextY = tank.y + vector.y * tank.speed * dt;
  tank.direction = direction;

  if (canTankMoveTo(state, tank, nextX, nextY)) {
    tank.x = nextX;
    tank.y = nextY;
  }
}

function fireBullet(state: TankBattleState, tank: Tank): void {
  const cooldown = tank.team === "player" && tank.rapidTime > 0 ? PLAYER_FIRE_COOLDOWN * 0.45 : tank.fireCooldown;
  if (cooldown > 0) return;

  const vector = directionVectors[tank.direction];
  state.bullets.push({
    id: nextId(state, "bullet"),
    ownerId: tank.id,
    team: tank.team,
    x: tank.x + TANK_SIZE / 2 + vector.x * 9,
    y: tank.y + TANK_SIZE / 2 + vector.y * 9,
    vx: vector.x * BULLET_SPEED,
    vy: vector.y * BULLET_SPEED,
    ttl: 1.8,
    power: tank.team === "player" && tank.rapidTime > 0 ? 2 : 1
  });
  tank.fireCooldown = tank.team === "player" ? PLAYER_FIRE_COOLDOWN : ENEMY_FIRE_COOLDOWN;
}

function hitTerrain(state: TankBattleState, bullet: Bullet): boolean {
  const tileX = Math.floor(bullet.x / TILE_SIZE);
  const tileY = Math.floor(bullet.y / TILE_SIZE);
  const tile = getTileKind(state.level.map, tileX, tileY);
  if (!isBulletBlockedTile(tile)) return false;

  addExplosion(state, bullet.x, bullet.y, 0.22);
  if (tile === Tile.Brick || (tile === Tile.Steel && bullet.power > 1)) {
    state.level.map.set(tileX, tileY, Tile.Empty);
  }
  if (tile === Tile.Base) {
    state.status = "lost";
    state.message = "基地被击毁";
  }
  return true;
}

function hitTank(state: TankBattleState, bullet: Bullet): boolean {
  if (bullet.team === "enemy" && rectForBullet(bullet).intersects(tankRect(state.player))) {
    damagePlayer(state, bullet);
    return true;
  }

  if (bullet.team === "player") {
    const target = state.enemies.find((enemy) => rectForBullet(bullet).intersects(tankRect(enemy)));
    if (target) {
      destroyEnemy(state, target);
      return true;
    }
  }

  return false;
}

function damagePlayer(state: TankBattleState, bullet: Bullet): void {
  if (state.player.shieldTime > 0 || state.player.spawnGrace > 0) {
    addExplosion(state, bullet.x, bullet.y, 0.18);
    return;
  }

  state.lives -= 1;
  addExplosion(state, state.player.x + TANK_SIZE / 2, state.player.y + TANK_SIZE / 2, 0.45);
  if (state.lives <= 0) {
    state.status = "lost";
    state.message = "战车耗尽";
    return;
  }

  state.player.x = state.level.playerSpawn.x * TILE_SIZE + 1;
  state.player.y = state.level.playerSpawn.y * TILE_SIZE + 1;
  state.player.direction = "up";
  state.player.spawnGrace = 2.2;
  state.player.shieldTime = 2.2;
  state.message = `损失一辆战车，剩余 ${state.lives}`;
}

function destroyEnemy(state: TankBattleState, enemy: Tank): void {
  state.enemies = state.enemies.filter((item) => item.id !== enemy.id);
  state.score += 100;
  addExplosion(state, enemy.x + TANK_SIZE / 2, enemy.y + TANK_SIZE / 2, 0.42);
  maybeSpawnPowerUp(state, enemy.x, enemy.y);
  state.message = `命中！得分 ${state.score}`;
}

function maybeSpawnPowerUp(state: TankBattleState, x: number, y: number): void {
  if (state.rng() > state.level.config.powerUpRate) return;
  const kinds: PowerUpKind[] = ["shield", "rapid", "repair", "freeze"];
  state.powerUps.push({
    id: nextId(state, "power"),
    kind: kinds[randomInt(state.rng, 0, kinds.length - 1)]!,
    x: clamp(x, TILE_SIZE, LOGICAL_WIDTH - TILE_SIZE * 2),
    y: clamp(y, TILE_SIZE, LOGICAL_HEIGHT - TILE_SIZE * 2),
    ttl: 9
  });
}

function applyPowerUpPickup(state: TankBattleState): void {
  const playerRect = tankRect(state.player);
  const picked = state.powerUps.find((powerUp) => playerRect.intersects(new Rect(powerUp.x, powerUp.y, TILE_SIZE, TILE_SIZE)));
  if (!picked) return;

  if (picked.kind === "shield") state.player.shieldTime = 8;
  if (picked.kind === "rapid") state.player.rapidTime = 8;
  if (picked.kind === "repair") state.lives = Math.min(5, state.lives + 1);
  if (picked.kind === "freeze") state.freezeTimer = 6;
  state.powerUps = state.powerUps.filter((powerUp) => powerUp.id !== picked.id);
  state.score += 50;
  state.message = powerUpLabel(picked.kind);
}

function canTankMoveTo(state: TankBattleState, tank: Tank, x: number, y: number): boolean {
  if (x < 0 || y < 0 || x + TANK_SIZE > LOGICAL_WIDTH || y + TANK_SIZE > LOGICAL_HEIGHT) return false;
  if (collidesWithTerrain(state, x, y)) return false;
  return !collidesWithTanks(state, tank, x, y);
}

function collidesWithTerrain(state: TankBattleState, x: number, y: number): boolean {
  const rect = new Rect(x, y, TANK_SIZE, TANK_SIZE);
  const minX = Math.floor(rect.x / TILE_SIZE);
  const maxX = Math.floor((rect.x + rect.width - 1) / TILE_SIZE);
  const minY = Math.floor(rect.y / TILE_SIZE);
  const maxY = Math.floor((rect.y + rect.height - 1) / TILE_SIZE);

  for (let tileY = minY; tileY <= maxY; tileY += 1) {
    for (let tileX = minX; tileX <= maxX; tileX += 1) {
      if (isTankBlockedTile(state.level.map.get(tileX, tileY))) return true;
    }
  }
  return false;
}

function collidesWithTanks(state: TankBattleState, tank: Tank, x: number, y: number): boolean {
  const rect = new Rect(x, y, TANK_SIZE, TANK_SIZE);
  const others = tank.team === "player" ? state.enemies : [state.player, ...state.enemies.filter((enemy) => enemy.id !== tank.id)];
  return others.some((other) => rect.intersects(tankRect(other)));
}

function chooseEnemyDirection(state: TankBattleState, enemy: Tank): Direction {
  if (state.rng() < 0.34) {
    return state.player.x < enemy.x ? "left" : state.player.x > enemy.x ? "right" : "down";
  }
  return directions[randomInt(state.rng, 0, directions.length - 1)]!;
}

function createTank(id: string, team: "player" | "enemy", tileX: number, tileY: number, direction: Direction, speed: number): Tank {
  return {
    id,
    team,
    x: tileX * TILE_SIZE + 1,
    y: tileY * TILE_SIZE + 1,
    direction,
    speed,
    fireCooldown: team === "player" ? 0 : 0.9,
    aiTimer: 0.4,
    shieldTime: team === "player" ? 2 : 0,
    rapidTime: 0,
    spawnGrace: team === "player" ? 1.5 : 0.6
  };
}

function updateTankTimers(tank: Tank, dt: number): void {
  tank.fireCooldown = Math.max(0, tank.fireCooldown - dt);
  tank.shieldTime = Math.max(0, tank.shieldTime - dt);
  tank.rapidTime = Math.max(0, tank.rapidTime - dt);
  tank.spawnGrace = Math.max(0, tank.spawnGrace - dt);
}

function tankRect(tank: Tank): Rect {
  return new Rect(tank.x, tank.y, TANK_SIZE, TANK_SIZE);
}

function rectForBullet(bullet: Bullet): Rect {
  return new Rect(bullet.x - 2, bullet.y - 2, 4, 4);
}

function addExplosion(state: TankBattleState, x: number, y: number, duration: number): void {
  state.explosions.push({ id: nextId(state, "boom"), x, y, age: 0, duration } satisfies Explosion);
}

function nextId(state: TankBattleState, prefix: string): string {
  state.nextId += 1;
  return `${prefix}-${state.nextId}`;
}

function powerUpLabel(kind: PowerUpKind): string {
  return {
    shield: "护盾启动",
    rapid: "快速射击",
    repair: "战车修复",
    freeze: "敌军冻结"
  }[kind];
}
