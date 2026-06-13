"use client";

import { InputState, Rect, clamp } from "@game-engine-canvas/engine";
import { useEffect, useRef, useState } from "react";

interface Brick {
  readonly rect: Rect;
  alive: boolean;
}

interface GameState {
  paddle: Rect;
  ball: { x: number; y: number; vx: number; vy: number; radius: number };
  bricks: Brick[];
  score: number;
  lives: number;
  status: "playing" | "won" | "lost";
}

const width = 720;
const height = 460;

function createGame(): GameState {
  const bricks: Brick[] = [];
  const columns = 8;
  const rows = 5;
  const brickWidth = 72;
  const brickHeight = 22;
  const gap = 10;
  const startX = 52;
  const startY = 58;

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      bricks.push({
        rect: new Rect(
          startX + column * (brickWidth + gap),
          startY + row * (brickHeight + gap),
          brickWidth,
          brickHeight
        ),
        alive: true
      });
    }
  }

  return {
    paddle: new Rect(width / 2 - 58, height - 46, 116, 16),
    ball: { x: width / 2, y: height - 78, vx: 180, vy: -230, radius: 9 },
    bricks,
    score: 0,
    lives: 3,
    status: "playing"
  };
}

function resetBall(game: GameState) {
  game.ball.x = width / 2;
  game.ball.y = height - 78;
  game.ball.vx = game.score % 2 === 0 ? 180 : -180;
  game.ball.vy = -230;
}

function updateGame(game: GameState, input: InputState, deltaTime: number) {
  if (game.status !== "playing") {
    return;
  }

  const paddleSpeed = 420;
  if (input.isKeyDown("ArrowLeft") || input.isKeyDown("KeyA")) {
    game.paddle.x -= paddleSpeed * deltaTime;
  }
  if (input.isKeyDown("ArrowRight") || input.isKeyDown("KeyD")) {
    game.paddle.x += paddleSpeed * deltaTime;
  }
  if (input.pointer.position.x > 0) {
    game.paddle.x = input.pointer.position.x - game.paddle.width / 2;
  }
  game.paddle.x = clamp(game.paddle.x, 12, width - game.paddle.width - 12);

  game.ball.x += game.ball.vx * deltaTime;
  game.ball.y += game.ball.vy * deltaTime;

  if (game.ball.x < game.ball.radius || game.ball.x > width - game.ball.radius) {
    game.ball.vx *= -1;
    game.ball.x = clamp(game.ball.x, game.ball.radius, width - game.ball.radius);
  }
  if (game.ball.y < game.ball.radius) {
    game.ball.vy *= -1;
    game.ball.y = game.ball.radius;
  }

  const ballRect = new Rect(
    game.ball.x - game.ball.radius,
    game.ball.y - game.ball.radius,
    game.ball.radius * 2,
    game.ball.radius * 2
  );

  if (ballRect.intersects(game.paddle) && game.ball.vy > 0) {
    const hit = (game.ball.x - game.paddle.center.x) / (game.paddle.width / 2);
    game.ball.vx = hit * 260;
    game.ball.vy = -Math.abs(game.ball.vy);
    game.ball.y = game.paddle.y - game.ball.radius;
  }

  for (const brick of game.bricks) {
    if (!brick.alive || !ballRect.intersects(brick.rect)) {
      continue;
    }

    brick.alive = false;
    game.score += 10;
    game.ball.vy *= -1;
    break;
  }

  if (game.bricks.every((brick) => !brick.alive)) {
    game.status = "won";
  }

  if (game.ball.y > height + 24) {
    game.lives -= 1;
    if (game.lives <= 0) {
      game.status = "lost";
    } else {
      resetBall(game);
    }
  }
}

function drawGame(context: CanvasRenderingContext2D, game: GameState) {
  context.clearRect(0, 0, width, height);
  context.fillStyle = "#edf4f2";
  context.fillRect(0, 0, width, height);
  context.fillStyle = "#17201c";
  context.font = "700 16px ui-monospace, Menlo, monospace";
  context.fillText(`Score ${game.score}`, 24, 30);
  context.fillText(`Lives ${game.lives}`, width - 110, 30);

  const palette = ["#0f766e", "#0f766e", "#b45309", "#334155", "#475569"];
  for (const [index, brick] of game.bricks.entries()) {
    if (!brick.alive) continue;
    context.fillStyle = palette[Math.floor(index / 8)] ?? "#0f766e";
    context.fillRect(brick.rect.x, brick.rect.y, brick.rect.width, brick.rect.height);
  }

  context.fillStyle = "#134e4a";
  context.fillRect(game.paddle.x, game.paddle.y, game.paddle.width, game.paddle.height);
  context.beginPath();
  context.fillStyle = "#b45309";
  context.arc(game.ball.x, game.ball.y, game.ball.radius, 0, Math.PI * 2);
  context.fill();

  if (game.status !== "playing") {
    context.fillStyle = "rgba(255,255,255,0.86)";
    context.fillRect(0, 0, width, height);
    context.fillStyle = "#17201c";
    context.font = "800 34px system-ui, sans-serif";
    context.textAlign = "center";
    context.fillText(game.status === "won" ? "Stage Clear" : "Game Over", width / 2, height / 2);
    context.textAlign = "start";
  }
}

export function BreakoutGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const inputRef = useRef(new InputState());
  const gameRef = useRef(createGame());
  const [hud, setHud] = useState({ score: 0, lives: 3, status: "playing" });

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    const input = inputRef.current;

    if (!canvas || !context) {
      return;
    }

    let frame = 0;
    let last = performance.now();
    const keyDown = (event: KeyboardEvent) => {
      if (event.code === "Space" && gameRef.current.status !== "playing") {
        gameRef.current = createGame();
      }
      input.keyDown(event.code);
    };
    const keyUp = (event: KeyboardEvent) => input.keyUp(event.code);
    const pointerMove = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      const scaleX = width / bounds.width;
      const scaleY = height / bounds.height;
      input.pointerMove((event.clientX - bounds.left) * scaleX, (event.clientY - bounds.top) * scaleY);
    };
    const loop = (time: number) => {
      const deltaTime = Math.min((time - last) / 1000, 0.033);
      last = time;
      updateGame(gameRef.current, input, deltaTime);
      drawGame(context, gameRef.current);
      setHud({
        score: gameRef.current.score,
        lives: gameRef.current.lives,
        status: gameRef.current.status
      });
      input.endFrame();
      frame = requestAnimationFrame(loop);
    };

    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);
    canvas.addEventListener("pointermove", pointerMove);
    frame = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
      canvas.removeEventListener("pointermove", pointerMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="breakout-wrap">
      <canvas ref={canvasRef} width={width} height={height} />
      <div className="breakout-hud">
        <span>Score {hud.score}</span>
        <span>Lives {hud.lives}</span>
        <span>{hud.status}</span>
      </div>
    </div>
  );
}
