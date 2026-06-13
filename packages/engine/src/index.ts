export * from "./core";
export * from "./ecs";
export * from "./assets";
export * from "./math";
export * from "./render";
export * from "./input";
export * from "./tilemap";
export * from "./physics";
export * from "./scene";

export interface EngineInfo {
  readonly name: string;
  readonly version: string;
}

export function createEngine(): EngineInfo {
  return {
    name: "game-engine-canvas",
    version: "0.1.0"
  };
}
