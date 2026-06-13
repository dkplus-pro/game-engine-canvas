import type { World } from "./world";

export type EntityId = number;

export interface ComponentConstructor<TComponent extends object = object> {
  new (...args: any[]): TComponent;
}

export type ComponentType<TComponent extends object = object> =
  | string
  | symbol
  | ComponentConstructor<TComponent>;

export interface QueryResult {
  readonly entity: EntityId;
  get<TComponent extends object>(type: ComponentType<TComponent>): TComponent;
  tryGet<TComponent extends object>(
    type: ComponentType<TComponent>
  ): TComponent | undefined;
  has(type: ComponentType): boolean;
}

export interface SystemContext {
  readonly world: World;
  readonly deltaTime: number;
  readonly elapsedTime: number;
  readonly frame: number;
}

export interface System {
  readonly name?: string;
  update(context: SystemContext): void;
}

export interface SystemEntry {
  readonly system: System;
  readonly priority: number;
  readonly order: number;
}
