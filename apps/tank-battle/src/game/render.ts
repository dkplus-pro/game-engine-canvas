import { FIELD_COLUMNS, FIELD_ROWS, LOGICAL_HEIGHT, LOGICAL_WIDTH, TANK_SIZE, TILE_SIZE, Tile, directionVectors } from "./constants";
import type { TankBattleAssets } from "./assets";
import type { Bullet, Direction, PowerUp, Tank, TankBattleState } from "./types";

interface BoardMetrics {
  readonly x: number;
  readonly y: number;
  readonly size: number;
  readonly scale: number;
}

const tileColors = {
  [Tile.Empty]: "#111827",
  [Tile.Brick]: "#9a5a33",
  [Tile.Steel]: "#9ca3af",
  [Tile.Water]: "#0ea5e9",
  [Tile.Grass]: "#15803d",
  [Tile.Base]: "#facc15"
} as const;

export function drawTankBattle(
  context: CanvasRenderingContext2D,
  state: TankBattleState,
  assets: TankBattleAssets | undefined,
  width: number,
  height: number
): BoardMetrics {
  context.clearRect(0, 0, width, height);
  drawBackdrop(context, width, height, assets);
  const metrics = getBoardMetrics(width, height);

  context.save();
  context.translate(metrics.x, metrics.y);
  context.scale(metrics.scale, metrics.scale);
  drawMap(context, state);
  drawPowerUps(context, state.powerUps);
  drawTanks(context, state);
  drawBullets(context, state.bullets);
  drawGrassOverlay(context, state);
  drawExplosions(context, state);
  context.restore();

  drawCanvasStatus(context, state, width, height, metrics);
  return metrics;
}

function getBoardMetrics(width: number, height: number): BoardMetrics {
  const availableWidth = width < 820 ? width * 0.94 : width * 0.72;
  const availableHeight = height * 0.82;
  const size = Math.floor(Math.min(availableWidth, availableHeight));
  return {
    x: Math.floor((width - size) / 2),
    y: Math.floor((height - size) / 2),
    size,
    scale: size / LOGICAL_WIDTH
  };
}

function drawBackdrop(context: CanvasRenderingContext2D, width: number, height: number, assets?: TankBattleAssets): void {
  const gradient = context.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#070b18");
  gradient.addColorStop(1, "#111827");
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);

  context.strokeStyle = "rgba(34,197,94,0.1)";
  context.lineWidth = 1;
  for (let x = 0; x < width; x += 32) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
  }
  for (let y = 0; y < height; y += 32) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }

  if (assets?.spriteAtlas?.complete) {
    context.globalAlpha = 0.16;
    context.drawImage(assets.spriteAtlas, width - 190, height - 190, 160, 160);
    context.globalAlpha = 1;
  }
}

function drawMap(context: CanvasRenderingContext2D, state: TankBattleState): void {
  context.fillStyle = tileColors[Tile.Empty];
  context.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

  for (let y = 0; y < FIELD_ROWS; y += 1) {
    for (let x = 0; x < FIELD_COLUMNS; x += 1) {
      const tile = state.level.map.get(x, y);
      if (tile === Tile.Empty || tile === Tile.Grass) continue;
      drawTile(context, x, y, tile);
    }
  }
}

function drawTile(context: CanvasRenderingContext2D, x: number, y: number, tile: number): void {
  const px = x * TILE_SIZE;
  const py = y * TILE_SIZE;
  context.fillStyle = tileColors[tile as keyof typeof tileColors] ?? "#fff";
  context.fillRect(px, py, TILE_SIZE, TILE_SIZE);

  if (tile === Tile.Brick) {
    context.strokeStyle = "rgba(0,0,0,0.3)";
    context.strokeRect(px + 0.5, py + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);
    context.fillStyle = "rgba(255,255,255,0.12)";
    context.fillRect(px + 2, py + 3, 12, 2);
  }
  if (tile === Tile.Steel) {
    context.fillStyle = "rgba(255,255,255,0.26)";
    context.fillRect(px + 3, py + 3, 10, 3);
  }
  if (tile === Tile.Water) {
    context.strokeStyle = "rgba(255,255,255,0.65)";
    context.beginPath();
    context.moveTo(px + 2, py + 6);
    context.lineTo(px + 14, py + 4);
    context.moveTo(px + 2, py + 12);
    context.lineTo(px + 14, py + 10);
    context.stroke();
  }
  if (tile === Tile.Base) {
    context.fillStyle = "#111827";
    context.fillRect(px + 4, py + 4, 8, 8);
  }
}

function drawTanks(context: CanvasRenderingContext2D, state: TankBattleState): void {
  drawTank(context, state.player);
  for (const enemy of state.enemies) drawTank(context, enemy);
}

function drawTank(context: CanvasRenderingContext2D, tank: Tank): void {
  context.save();
  context.translate(tank.x + TANK_SIZE / 2, tank.y + TANK_SIZE / 2);
  rotateToDirection(context, tank.direction);
  context.fillStyle = tank.team === "player" ? "#22c55e" : "#dc2626";
  context.fillRect(-6, -6, 12, 12);
  context.fillStyle = tank.team === "player" ? "#bbf7d0" : "#fecaca";
  context.fillRect(-2, -10, 4, 9);
  context.fillStyle = "rgba(0,0,0,0.35)";
  context.fillRect(-8, -6, 2, 12);
  context.fillRect(6, -6, 2, 12);
  context.restore();

  if (tank.shieldTime > 0 || tank.spawnGrace > 0) {
    context.strokeStyle = tank.team === "player" ? "#93c5fd" : "#fed7aa";
    context.lineWidth = 1.5;
    context.strokeRect(tank.x - 2, tank.y - 2, TANK_SIZE + 4, TANK_SIZE + 4);
  }
}

function drawBullets(context: CanvasRenderingContext2D, bullets: Bullet[]): void {
  for (const bullet of bullets) {
    context.fillStyle = bullet.team === "player" ? "#facc15" : "#f97316";
    context.fillRect(bullet.x - 2, bullet.y - 2, 4, 4);
  }
}

function drawPowerUps(context: CanvasRenderingContext2D, powerUps: PowerUp[]): void {
  for (const powerUp of powerUps) {
    context.fillStyle = "#22c55e";
    context.fillRect(powerUp.x, powerUp.y, TILE_SIZE, TILE_SIZE);
    context.fillStyle = "#052e16";
    context.font = "10px ui-monospace, monospace";
    context.textAlign = "center";
    context.fillText(powerUp.kind.slice(0, 1).toUpperCase(), powerUp.x + 8, powerUp.y + 11);
  }
}

function drawGrassOverlay(context: CanvasRenderingContext2D, state: TankBattleState): void {
  context.globalAlpha = 0.62;
  for (let y = 0; y < FIELD_ROWS; y += 1) {
    for (let x = 0; x < FIELD_COLUMNS; x += 1) {
      if (state.level.map.get(x, y) === Tile.Grass) drawTile(context, x, y, Tile.Grass);
    }
  }
  context.globalAlpha = 1;
}

function drawExplosions(context: CanvasRenderingContext2D, state: TankBattleState): void {
  for (const boom of state.explosions) {
    const progress = boom.age / boom.duration;
    context.strokeStyle = progress < 0.5 ? "#facc15" : "#f97316";
    context.lineWidth = 2;
    context.beginPath();
    context.arc(boom.x, boom.y, 4 + progress * 14, 0, Math.PI * 2);
    context.stroke();
  }
}

function drawCanvasStatus(context: CanvasRenderingContext2D, state: TankBattleState, width: number, height: number, metrics: BoardMetrics): void {
  if (state.status === "playing") return;
  context.fillStyle = "rgba(0,0,0,0.52)";
  context.fillRect(metrics.x, metrics.y, metrics.size, metrics.size);
  context.fillStyle = state.status === "won" ? "#22c55e" : state.status === "lost" ? "#f97316" : "#facc15";
  context.font = "900 34px ui-monospace, monospace";
  context.textAlign = "center";
  context.fillText(state.status === "won" ? "STAGE CLEAR" : state.status === "lost" ? "GAME OVER" : "PAUSED", width / 2, height / 2);
}

function rotateToDirection(context: CanvasRenderingContext2D, direction: Direction): void {
  const vector = directionVectors[direction];
  context.rotate(Math.atan2(vector.y, vector.x) + Math.PI / 2);
}
