import type { World } from "../ecs";

type EngineFrameHandle = number | ReturnType<typeof globalThis.setTimeout>;

export interface EngineOptions {
  readonly world: World;
  readonly maxDeltaTime?: number;
  readonly requestFrame?: (callback: FrameRequestCallback) => EngineFrameHandle;
  readonly cancelFrame?: (handle: EngineFrameHandle) => void;
  readonly now?: () => number;
}

export interface StepResult {
  readonly deltaTime: number;
  readonly elapsedTime: number;
  readonly frame: number;
}

export class Engine {
  readonly world: World;

  private readonly maxDeltaTime: number;
  private readonly requestFrame: (callback: FrameRequestCallback) => EngineFrameHandle;
  private readonly cancelFrame: (handle: EngineFrameHandle) => void;
  private readonly now: () => number;
  private running = false;
  private frameHandle: EngineFrameHandle | undefined;
  private lastTime: number | undefined;

  constructor(options: EngineOptions) {
    this.world = options.world;
    this.maxDeltaTime = options.maxDeltaTime ?? 0.1;
    this.requestFrame =
      options.requestFrame ??
      globalThis.requestAnimationFrame?.bind(globalThis) ??
      ((callback) => globalThis.setTimeout(() => callback(this.now()), 1000 / 60));
    this.cancelFrame = options.cancelFrame ?? cancelEngineFrame;
    this.now = options.now ?? (() => performance.now());
  }

  isRunning(): boolean {
    return this.running;
  }

  start(): void {
    if (this.running) {
      return;
    }

    this.running = true;
    this.lastTime = undefined;
    this.frameHandle = this.requestFrame(this.tick);
  }

  stop(): void {
    if (!this.running) {
      return;
    }

    this.running = false;

    if (this.frameHandle !== undefined) {
      this.cancelFrame(this.frameHandle);
      this.frameHandle = undefined;
    }
  }

  step(deltaTime: number): StepResult {
    const safeDeltaTime = Math.max(0, Math.min(deltaTime, this.maxDeltaTime));
    this.world.update(safeDeltaTime);

    return {
      deltaTime: safeDeltaTime,
      elapsedTime: this.world.elapsedTime,
      frame: this.world.frame
    };
  }

  private readonly tick = (timestamp: number): void => {
    if (!this.running) {
      return;
    }

    const deltaTime =
      this.lastTime === undefined ? 0 : (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;
    this.step(deltaTime);
    this.frameHandle = this.requestFrame(this.tick);
  };
}

function cancelEngineFrame(handle: EngineFrameHandle): void {
  if (typeof handle === "number" && globalThis.cancelAnimationFrame) {
    globalThis.cancelAnimationFrame(handle);
    return;
  }

  globalThis.clearTimeout(handle);
}
