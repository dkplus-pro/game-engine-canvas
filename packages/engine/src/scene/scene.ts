import { World } from "../ecs";

export interface Scene {
  readonly name: string;
  readonly world: World;
  onEnter?(): void;
  onExit?(): void;
  update?(deltaTime: number): void;
}

export function createScene(options: CreateSceneOptions): Scene {
  const world = options.world ?? new World();

  return {
    name: options.name,
    world,
    onEnter: options.onEnter,
    onExit: options.onExit,
    update: options.update
  };
}

export interface CreateSceneOptions {
  readonly name: string;
  readonly world?: World;
  readonly onEnter?: () => void;
  readonly onExit?: () => void;
  readonly update?: (deltaTime: number) => void;
}
