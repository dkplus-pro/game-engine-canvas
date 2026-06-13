"use client";

import { InputState, Vec2, clamp } from "@game-engine-canvas/engine";
import { useEffect, useRef, useState } from "react";

interface InputSnapshot {
  readonly x: number;
  readonly y: number;
  readonly pointerX: number;
  readonly pointerY: number;
  readonly activeKeys: string[];
  readonly pointerDown: boolean;
}

export function InputDemo() {
  const inputRef = useRef(new InputState());
  const [snapshot, setSnapshot] = useState<InputSnapshot>({
    x: 260,
    y: 170,
    pointerX: 0,
    pointerY: 0,
    activeKeys: [],
    pointerDown: false
  });

  useEffect(() => {
    const input = inputRef.current;
    const position = new Vec2(260, 170);
    let frame = 0;

    const keyDown = (event: KeyboardEvent) => input.keyDown(event.code);
    const keyUp = (event: KeyboardEvent) => input.keyUp(event.code);
    const loop = () => {
      const speed = 4;

      if (input.isKeyDown("ArrowLeft") || input.isKeyDown("KeyA")) position.x -= speed;
      if (input.isKeyDown("ArrowRight") || input.isKeyDown("KeyD")) position.x += speed;
      if (input.isKeyDown("ArrowUp") || input.isKeyDown("KeyW")) position.y -= speed;
      if (input.isKeyDown("ArrowDown") || input.isKeyDown("KeyS")) position.y += speed;

      position.x = clamp(position.x, 24, 548);
      position.y = clamp(position.y, 24, 328);

      setSnapshot({
        x: position.x,
        y: position.y,
        pointerX: input.pointer.position.x,
        pointerY: input.pointer.position.y,
        activeKeys: ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "KeyW", "KeyA", "KeyS", "KeyD"].filter((key) =>
          input.isKeyDown(key)
        ),
        pointerDown: input.pointer.down
      });
      input.endFrame();
      frame = requestAnimationFrame(loop);
    };

    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);
    frame = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="demo-grid">
      <section className="panel" aria-label="Input facts">
        <p className="lesson-kicker">Demo 05</p>
        <h1>Input</h1>
        <p className="copy">InputState 保存键盘和指针的当前帧状态。</p>
        <div className="fact">
          <span>Keys</span>
          <strong>{snapshot.activeKeys.length || "none"}</strong>
        </div>
        <div className="fact">
          <span>Pointer</span>
          <strong>
            {snapshot.pointerX.toFixed(0)},{snapshot.pointerY.toFixed(0)}
          </strong>
        </div>
        <div className="fact">
          <span>Down</span>
          <strong>{snapshot.pointerDown ? "true" : "false"}</strong>
        </div>
      </section>
      <section
        className="stage"
        aria-label="Input stage"
        onPointerDown={(event) =>
          inputRef.current.pointerDown(event.nativeEvent.offsetX, event.nativeEvent.offsetY)
        }
        onPointerMove={(event) =>
          inputRef.current.pointerMove(event.nativeEvent.offsetX, event.nativeEvent.offsetY)
        }
        onPointerUp={(event) =>
          inputRef.current.pointerUp(event.nativeEvent.offsetX, event.nativeEvent.offsetY)
        }
      >
        <div className="input-crosshair" style={{ left: snapshot.pointerX, top: snapshot.pointerY }} />
        <div className="entity moving" style={{ left: snapshot.x, top: snapshot.y }}>
          Input
        </div>
      </section>
    </div>
  );
}
