import { Vec2, clamp, type Vec2Like } from "@game-engine-canvas/engine";
import {
  BALL_RADIUS,
  LOGICAL_HEIGHT,
  LOGICAL_WIDTH,
  MAX_SHOT_POWER,
  POCKET_RADIUS,
  TABLE_RECT,
  pockets
} from "./constants";
import { findCueBall } from "./physics";
import type { BallState, BilliardsState } from "./types";

export interface TableMetrics {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly scale: number;
}

export function drawBilliards(context: CanvasRenderingContext2D, state: BilliardsState, width: number, height: number): TableMetrics {
  context.clearRect(0, 0, width, height);
  drawBackdrop(context, width, height);
  const metrics = getTableMetrics(width, height);

  context.save();
  context.translate(metrics.x, metrics.y);
  context.scale(metrics.scale, metrics.scale);
  drawTable(context);
  drawAim(context, state);
  drawBalls(context, state.balls);
  context.restore();

  drawCanvasStatus(context, state, width, height, metrics);
  return metrics;
}

export function getTableMetrics(width: number, height: number): TableMetrics {
  const availableWidth = width < 820 ? width * 0.96 : width * 0.86;
  const availableHeight = height < 760 ? height * 0.76 : height * 0.8;
  const scale = Math.min(availableWidth / LOGICAL_WIDTH, availableHeight / LOGICAL_HEIGHT);
  const tableWidth = LOGICAL_WIDTH * scale;
  const tableHeight = LOGICAL_HEIGHT * scale;
  return {
    x: Math.floor((width - tableWidth) / 2),
    y: Math.floor((height - tableHeight) / 2 + (height < 760 ? 20 : 32)),
    width: tableWidth,
    height: tableHeight,
    scale
  };
}

export function screenToLogical(metrics: TableMetrics, point: Vec2Like): Vec2 {
  return new Vec2((point.x - metrics.x) / metrics.scale, (point.y - metrics.y) / metrics.scale);
}

function drawBackdrop(context: CanvasRenderingContext2D, width: number, height: number): void {
  const gradient = context.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#020617");
  gradient.addColorStop(0.55, "#0f172a");
  gradient.addColorStop(1, "#020617");
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);

  context.strokeStyle = "rgba(34, 197, 94, 0.08)";
  context.lineWidth = 1;
  for (let x = 0; x < width; x += 42) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
  }
  for (let y = 0; y < height; y += 42) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }
}

function drawTable(context: CanvasRenderingContext2D): void {
  context.fillStyle = "rgba(0, 0, 0, 0.38)";
  roundRect(context, TABLE_RECT.x - 48, TABLE_RECT.y - 48, TABLE_RECT.width + 96, TABLE_RECT.height + 96, 48);
  context.fill();

  const rail = context.createLinearGradient(TABLE_RECT.x, TABLE_RECT.y, TABLE_RECT.right, TABLE_RECT.bottom);
  rail.addColorStop(0, "#7f1d1d");
  rail.addColorStop(0.5, "#1d4ed8");
  rail.addColorStop(1, "#064e3b");
  context.fillStyle = rail;
  roundRect(context, TABLE_RECT.x - 34, TABLE_RECT.y - 34, TABLE_RECT.width + 68, TABLE_RECT.height + 68, 36);
  context.fill();

  const felt = context.createRadialGradient(TABLE_RECT.center.x, TABLE_RECT.center.y, 80, TABLE_RECT.center.x, TABLE_RECT.center.y, 620);
  felt.addColorStop(0, "#15803d");
  felt.addColorStop(0.6, "#065f46");
  felt.addColorStop(1, "#064e3b");
  context.fillStyle = felt;
  roundRect(context, TABLE_RECT.x, TABLE_RECT.y, TABLE_RECT.width, TABLE_RECT.height, 26);
  context.fill();

  context.strokeStyle = "rgba(248, 250, 252, 0.16)";
  context.lineWidth = 3;
  context.stroke();

  for (const pocket of pockets) {
    context.fillStyle = "#020617";
    context.beginPath();
    context.arc(pocket.x, pocket.y, POCKET_RADIUS, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = "rgba(34, 197, 94, 0.64)";
    context.lineWidth = 2;
    context.stroke();
  }

  context.strokeStyle = "rgba(255, 255, 255, 0.16)";
  context.setLineDash([8, 12]);
  context.beginPath();
  context.moveTo(TABLE_RECT.x + TABLE_RECT.width * 0.25, TABLE_RECT.y + 18);
  context.lineTo(TABLE_RECT.x + TABLE_RECT.width * 0.25, TABLE_RECT.bottom - 18);
  context.stroke();
  context.setLineDash([]);
}

function drawAim(context: CanvasRenderingContext2D, state: BilliardsState): void {
  if (state.status === "rolling" || state.status === "paused" || state.status === "won") return;
  const cue = findCueBall(state);
  if (cue.pocketed) return;

  const powerRatio = clamp(state.shot.power / MAX_SHOT_POWER, 0, 1);
  const direction = new Vec2(Math.cos(state.shot.angle), Math.sin(state.shot.angle));
  const end = cue.position.clone().add(direction.clone().scale(280 + powerRatio * 180));
  const ghost = cue.position.clone().add(direction.clone().scale(92));

  context.strokeStyle = `rgba(250, 204, 21, ${0.42 + powerRatio * 0.34})`;
  context.lineWidth = 4;
  context.setLineDash([18, 12]);
  context.beginPath();
  context.moveTo(cue.position.x, cue.position.y);
  context.lineTo(end.x, end.y);
  context.stroke();
  context.setLineDash([]);

  context.strokeStyle = "rgba(248, 250, 252, 0.46)";
  context.lineWidth = 2;
  context.beginPath();
  context.arc(ghost.x, ghost.y, BALL_RADIUS, 0, Math.PI * 2);
  context.stroke();

  context.strokeStyle = "rgba(239, 68, 68, 0.86)";
  context.lineWidth = 8;
  context.beginPath();
  context.moveTo(cue.position.x - direction.x * (50 + powerRatio * 120), cue.position.y - direction.y * (50 + powerRatio * 120));
  context.lineTo(cue.position.x - direction.x * 18, cue.position.y - direction.y * 18);
  context.stroke();
}

function drawBalls(context: CanvasRenderingContext2D, balls: readonly BallState[]): void {
  for (const ball of balls) {
    if (ball.pocketed) continue;
    drawBallShadow(context, ball);
    drawBall(context, ball);
  }
}

function drawBallShadow(context: CanvasRenderingContext2D, ball: BallState): void {
  context.fillStyle = "rgba(0, 0, 0, 0.34)";
  context.beginPath();
  context.ellipse(ball.position.x + 4, ball.position.y + 6, BALL_RADIUS * 1.05, BALL_RADIUS * 0.72, 0, 0, Math.PI * 2);
  context.fill();
}

function drawBall(context: CanvasRenderingContext2D, ball: BallState): void {
  const gradient = context.createRadialGradient(
    ball.position.x - BALL_RADIUS * 0.35,
    ball.position.y - BALL_RADIUS * 0.45,
    BALL_RADIUS * 0.2,
    ball.position.x,
    ball.position.y,
    BALL_RADIUS
  );
  gradient.addColorStop(0, "#ffffff");
  gradient.addColorStop(0.32, ball.color);
  gradient.addColorStop(1, "#0f172a");

  context.fillStyle = gradient;
  context.beginPath();
  context.arc(ball.position.x, ball.position.y, BALL_RADIUS, 0, Math.PI * 2);
  context.fill();

  if (ball.kind === "stripe") {
    context.save();
    context.beginPath();
    context.arc(ball.position.x, ball.position.y, BALL_RADIUS - 1, 0, Math.PI * 2);
    context.clip();
    context.fillStyle = "rgba(255, 255, 255, 0.82)";
    context.fillRect(ball.position.x - BALL_RADIUS, ball.position.y - 6, BALL_RADIUS * 2, 12);
    context.restore();
  }

  context.strokeStyle = "rgba(255, 255, 255, 0.42)";
  context.lineWidth = 1.5;
  context.stroke();

  if (ball.kind !== "cue") {
    context.fillStyle = ball.number === 8 ? "#f8fafc" : "#020617";
    context.font = "700 10px ui-monospace, monospace";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(String(ball.number), ball.position.x, ball.position.y + 0.5);
  }
}

function drawCanvasStatus(context: CanvasRenderingContext2D, state: BilliardsState, width: number, height: number, metrics: TableMetrics): void {
  if (state.status !== "paused" && state.status !== "won") return;
  context.fillStyle = "rgba(2, 6, 23, 0.56)";
  context.fillRect(metrics.x, metrics.y, metrics.width, metrics.height);
  context.fillStyle = state.status === "won" ? "#22c55e" : "#facc15";
  context.font = "900 42px ui-monospace, monospace";
  context.textAlign = "center";
  context.fillText(state.status === "won" ? "TABLE CLEAR" : "PAUSED", width / 2, height / 2);
}

function roundRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number): void {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.arcTo(x + width, y, x + width, y + height, safeRadius);
  context.arcTo(x + width, y + height, x, y + height, safeRadius);
  context.arcTo(x, y + height, x, y, safeRadius);
  context.arcTo(x, y, x + width, y, safeRadius);
  context.closePath();
}
