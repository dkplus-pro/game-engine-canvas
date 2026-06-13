export * from "./core";
export * from "./ecs";

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
