import type { Scene } from "./scene";

export class SceneManager {
  private current: Scene | undefined;

  getCurrentScene(): Scene | undefined {
    return this.current;
  }

  changeTo(scene: Scene): void {
    if (this.current === scene) {
      return;
    }

    this.current?.onExit?.();
    this.current = scene;
    this.current.onEnter?.();
  }

  update(deltaTime: number): void {
    if (!this.current) {
      return;
    }

    this.current.update?.(deltaTime);
    this.current.world.update(deltaTime);
  }
}
