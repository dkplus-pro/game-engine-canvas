import { BreakoutGame } from "./breakout-game";

export function BreakoutDemo() {
  return (
    <div className="demo-grid">
      <section className="panel" aria-label="Breakout facts">
        <p className="lesson-kicker">Game 01</p>
        <h1>Breakout</h1>
        <p className="copy">完整游戏页面复用输入、数学、碰撞判断和 Canvas 绘制。</p>
        <div className="fact">
          <span>Loop</span>
          <strong>requestAnimationFrame</strong>
        </div>
        <div className="fact">
          <span>Input</span>
          <strong>InputState</strong>
        </div>
        <div className="fact">
          <span>Geometry</span>
          <strong>Rect</strong>
        </div>
      </section>
      <section className="game-panel" aria-label="Breakout game">
        <BreakoutGame />
      </section>
    </div>
  );
}
