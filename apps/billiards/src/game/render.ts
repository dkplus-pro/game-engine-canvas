import { Vec2 } from "@game-engine-canvas/engine";
import {
  BALL_RADIUS,
  PLAY_MAX_X,
  PLAY_MAX_Y,
  PLAY_MIN_X,
  PLAY_MIN_Y,
  POCKET_RADIUS,
  RAIL_SIZE,
  TABLE_HEIGHT,
  TABLE_WIDTH,
  ballPalette,
  pockets
} from "./constants";
import { getCueBall } from "./table";
import type { Ball, BilliardsState, TableMetrics } from "./types";

export function drawBilliards(context: CanvasRenderingContext2D, state: BilliardsState, width: number, height: number): TableMetrics {
  context.clearRect(0, 0, width, height);
  drawBackdrop(context, width, height);
  const metrics = getBilliardsTableMetrics(width, height);

  context.save();
  context.translate(metrics.x, metrics.y);
  context.scale(metrics.scale, metrics.scale);
  drawTable(context);
  drawAimGuide(context, state);
  drawBalls(context, state.balls);
  drawCue(context, state);
  context.restore();

  drawCanvasOverlay(context, state, width, height, metrics);
  return metrics;
}

export function getBilliardsTableMetrics(width: number, height: number): TableMetrics {
  const availableWidth = width * 0.94;
  const availableHeight = height < 720 ? height * 0.62 : height * 0.74;
  const scale = Math.min(availableWidth / TABLE_WIDTH, availableHeight / TABLE_HEIGHT);
  const tableWidth = TABLE_WIDTH * scale;
  const tableHeight = TABLE_HEIGHT * scale;
  return {
    x: Math.floor((width - tableWidth) / 2),
    y: Math.floor(height < 720 ? height * 0.28 : (height - tableHeight) / 2 + 24),
    width: tableWidth,
    height: tableHeight,
    scale
  };
}

export function screenToTablePoint(clientX: number, clientY: number, canvas: HTMLCanvasElement, metrics: TableMetrics): Vec2 {
  const rect = canvas.getBoundingClientRect();
  return new Vec2((clientX - rect.left - metrics.x) / metrics.scale, (clientY - rect.top - metrics.y) / metrics.scale);
}

function drawBackdrop(context: CanvasRenderingContext2D, width: number, height: number): void {
  const gradient = context.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#040713");
  gradient.addColorStop(0.48, "#071527");
  gradient.addColorStop(1, "#02040a");
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);

  context.save();
  context.strokeStyle = "rgba(34,211,238,0.08)";
  context.lineWidth = 1;
  for (let x = 0; x < width; x += 42) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x + height * 0.15, height);
    context.stroke();
  }
  context.restore();
}

function drawTable(context: CanvasRenderingContext2D): void {
  context.save();
  context.shadowColor = "rgba(34,211,238,0.32)";
  context.shadowBlur = 28;
  context.fillStyle = "#3b2316";
  roundRect(context, 0, 0, TABLE_WIDTH, TABLE_HEIGHT, 34);
  context.fill();
  context.shadowBlur = 0;

  const felt = context.createLinearGradient(PLAY_MIN_X, PLAY_MIN_Y, PLAY_MAX_X, PLAY_MAX_Y);
  felt.addColorStop(0, "#0f766e");
  felt.addColorStop(0.56, "#0d9488");
  felt.addColorStop(1, "#064e3b");
  context.fillStyle = felt;
  roundRect(context, RAIL_SIZE, RAIL_SIZE, TABLE_WIDTH - RAIL_SIZE * 2, TABLE_HEIGHT - RAIL_SIZE * 2, 18);
  context.fill();

  context.strokeStyle = "rgba(250,204,21,0.36)";
  context.lineWidth = 3;
  roundRect(context, RAIL_SIZE * 0.58, RAIL_SIZE * 0.58, TABLE_WIDTH - RAIL_SIZE * 1.16, TABLE_HEIGHT - RAIL_SIZE * 1.16, 24);
  context.stroke();

  drawDiamonds(context);
  drawPockets(context);
  context.restore();
}

function drawDiamonds(context: CanvasRenderingContext2D): void {
  context.fillStyle = "rgba(248,250,252,0.78)";
  for (let i = 1; i < 8; i += 1) {
    const x = PLAY_MIN_X + ((PLAY_MAX_X - PLAY_MIN_X) / 8) * i;
    drawDiamond(context, x, RAIL_SIZE * 0.52);
    drawDiamond(context, x, TABLE_HEIGHT - RAIL_SIZE * 0.52);
  }
  for (let i = 1; i < 4; i += 1) {
    const y = PLAY_MIN_Y + ((PLAY_MAX_Y - PLAY_MIN_Y) / 4) * i;
    drawDiamond(context, RAIL_SIZE * 0.52, y);
    drawDiamond(context, TABLE_WIDTH - RAIL_SIZE * 0.52, y);
  }
}

function drawDiamond(context: CanvasRenderingContext2D, x: number, y: number): void {
  context.save();
  context.translate(x, y);
  context.rotate(Math.PI / 4);
  context.fillRect(-4, -4, 8, 8);
  context.restore();
}

function drawPockets(context: CanvasRenderingContext2D): void {
  for (const pocket of pockets) {
    const gradient = context.createRadialGradient(pocket.x - 5, pocket.y - 5, 4, pocket.x, pocket.y, POCKET_RADIUS + 8);
    gradient.addColorStop(0, "#0f172a");
    gradient.addColorStop(1, "#000000");
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(pocket.x, pocket.y, POCKET_RADIUS + 5, 0, Math.PI * 2);
    context.fill();
  }
}

function drawBalls(context: CanvasRenderingContext2D, balls: Ball[]): void {
  for (const ball of balls) {
    if (ball.pocketed) continue;
    drawBallShadow(context, ball);
    drawBall(context, ball);
  }
}

function drawBallShadow(context: CanvasRenderingContext2D, ball: Ball): void {
  context.fillStyle = "rgba(0,0,0,0.34)";
  context.beginPath();
  context.ellipse(ball.position.x + 3, ball.position.y + 5, BALL_RADIUS * 0.95, BALL_RADIUS * 0.62, 0, 0, Math.PI * 2);
  context.fill();
}

function drawBall(context: CanvasRenderingContext2D, ball: Ball): void {
  const palette = ball.number === 0 ? { fill: "#f8fafc" } : ballPalette[ball.number]!;
  const shine = context.createRadialGradient(ball.position.x - 5, ball.position.y - 6, 2, ball.position.x, ball.position.y, BALL_RADIUS);
  shine.addColorStop(0, "#ffffff");
  shine.addColorStop(0.28, palette.fill);
  shine.addColorStop(1, shade(palette.stripe ?? palette.fill));

  context.fillStyle = shine;
  context.beginPath();
  context.arc(ball.position.x, ball.position.y, BALL_RADIUS, 0, Math.PI * 2);
  context.fill();

  if (palette.stripe) {
    context.save();
    context.beginPath();
    context.arc(ball.position.x, ball.position.y, BALL_RADIUS - 0.5, 0, Math.PI * 2);
    context.clip();
    context.fillStyle = palette.stripe;
    context.fillRect(ball.position.x - BALL_RADIUS, ball.position.y - 5, BALL_RADIUS * 2, 10);
    context.restore();
  }

  context.fillStyle = ball.number === 8 ? "#f8fafc" : "#111827";
  context.beginPath();
  context.arc(ball.position.x, ball.position.y, 5.3, 0, Math.PI * 2);
  context.fill();
  if (ball.number > 0) {
    context.fillStyle = ball.number === 8 ? "#111827" : "#f8fafc";
    context.font = "700 7px ui-monospace, monospace";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(String(ball.number), ball.position.x, ball.position.y + 0.3);
  }
}

function drawAimGuide(context: CanvasRenderingContext2D, state: BilliardsState): void {
  if (state.status !== "aiming") return;
  const cue = getCueBall(state);
  if (cue.pocketed) return;
  const direction = new Vec2(Math.cos(state.aimAngle), Math.sin(state.aimAngle));
  const target = findAimTarget(cue, direction, state.balls);

  context.save();
  context.setLineDash([12, 10]);
  context.strokeStyle = "rgba(34,211,238,0.78)";
  context.lineWidth = 2.2;
  context.beginPath();
  context.moveTo(cue.position.x, cue.position.y);
  context.lineTo(target.x, target.y);
  context.stroke();
  context.setLineDash([]);
  context.strokeStyle = "rgba(250,204,21,0.9)";
  context.beginPath();
  context.arc(target.x, target.y, BALL_RADIUS, 0, Math.PI * 2);
  context.stroke();
  context.restore();
}

function drawCue(context: CanvasRenderingContext2D, state: BilliardsState): void {
  if (state.status !== "aiming") return;
  const cue = getCueBall(state);
  if (cue.pocketed) return;
  const pullBack = 36 + state.shotPower * 72;
  const x = cue.position.x - Math.cos(state.aimAngle) * pullBack;
  const y = cue.position.y - Math.sin(state.aimAngle) * pullBack;

  context.save();
  context.translate(x, y);
  context.rotate(state.aimAngle);
  context.strokeStyle = "#f4d19b";
  context.lineWidth = 7;
  context.lineCap = "round";
  context.beginPath();
  context.moveTo(-210, 0);
  context.lineTo(-12, 0);
  context.stroke();
  context.strokeStyle = "#22d3ee";
  context.lineWidth = 3;
  context.beginPath();
  context.moveTo(-12, 0);
  context.lineTo(18, 0);
  context.stroke();
  context.restore();
}

function drawCanvasOverlay(context: CanvasRenderingContext2D, state: BilliardsState, width: number, height: number, metrics: TableMetrics): void {
  if (state.status === "aiming" || state.status === "rolling") return;
  context.fillStyle = "rgba(0,0,0,0.44)";
  context.fillRect(metrics.x, metrics.y, metrics.width, metrics.height);
  context.fillStyle = state.status === "won" ? "#22c55e" : "#facc15";
  context.font = "900 34px ui-monospace, monospace";
  context.textAlign = "center";
  context.fillText(state.status === "won" ? `PLAYER ${state.winner} WINS` : "PAUSED", width / 2, height / 2);
}

function findAimTarget(cue: Ball, direction: Vec2, balls: Ball[]): Vec2 {
  let bestDistance = 620;
  for (const ball of balls) {
    if (ball.number === 0 || ball.pocketed) continue;
    const toBall = Vec2.from(ball.position).subtract(cue.position);
    const projection = toBall.dot(direction);
    if (projection <= BALL_RADIUS * 2 || projection >= bestDistance) continue;
    const perpendicular = Vec2.from(toBall).subtract(Vec2.from(direction).scale(projection)).length();
    if (perpendicular <= BALL_RADIUS * 2.05) {
      bestDistance = projection - BALL_RADIUS * 2;
    }
  }
  return Vec2.from(cue.position).add(Vec2.from(direction).scale(bestDistance));
}

function roundRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number): void {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
}

function shade(color: string): string {
  if (color === "#f8fafc") return "#cbd5e1";
  if (color === "#111827") return "#020617";
  return color;
}
