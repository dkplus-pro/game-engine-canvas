"use client";

import { SceneManager, createScene } from "@game-engine-canvas/engine";
import { useEffect, useMemo, useState } from "react";

export function SceneDemo() {
  const [counts, setCounts] = useState({ menu: 0, level: 0, exits: 0 });
  const [active, setActive] = useState("menu");
  const manager = useMemo(() => new SceneManager(), []);
  const scenes = useMemo(
    () => ({
      menu: createScene({
        name: "menu",
        onEnter: () => setCounts((value) => ({ ...value, menu: value.menu + 1 })),
        onExit: () => setCounts((value) => ({ ...value, exits: value.exits + 1 }))
      }),
      level: createScene({
        name: "level-01",
        onEnter: () => setCounts((value) => ({ ...value, level: value.level + 1 })),
        onExit: () => setCounts((value) => ({ ...value, exits: value.exits + 1 }))
      })
    }),
    []
  );

  function changeTo(name: "menu" | "level") {
    manager.changeTo(scenes[name]);
    manager.update(1 / 60);
    setActive(name);
  }

  useEffect(() => {
    manager.changeTo(scenes.menu);
    manager.update(1 / 60);
  }, [manager, scenes]);

  const current = manager.getCurrentScene();

  return (
    <div className="demo-grid">
      <section className="panel" aria-label="Scene facts">
        <p className="lesson-kicker">Demo 09</p>
        <h1>Scene</h1>
        <p className="copy">SceneManager 切换当前场景，并更新当前场景自己的 World。</p>
        <div className="segmented">
          <button className={active === "menu" ? "active" : ""} onClick={() => changeTo("menu")}>
            Menu
          </button>
          <button className={active === "level" ? "active" : ""} onClick={() => changeTo("level")}>
            Level
          </button>
        </div>
        <div className="fact">
          <span>Current</span>
          <strong>{current?.name}</strong>
        </div>
        <div className="fact">
          <span>Frame</span>
          <strong>{current?.world.frame ?? 0}</strong>
        </div>
        <div className="fact">
          <span>Exits</span>
          <strong>{counts.exits}</strong>
        </div>
      </section>
      <section className="stage scene-stage" aria-label="Scene stage">
        <div className={active === "menu" ? "scene-tile menu" : "scene-tile level"}>
          <strong>{active === "menu" ? "Menu Scene" : "Level Scene"}</strong>
          <span>menu:{counts.menu} level:{counts.level}</span>
        </div>
      </section>
    </div>
  );
}
