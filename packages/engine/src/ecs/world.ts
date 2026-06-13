import {
  missingComponentError,
  missingEntityError
} from "./errors";
import type {
  ComponentType,
  EntityId,
  QueryResult,
  System,
  SystemContext,
  SystemEntry
} from "./types";

type ComponentStore = Map<EntityId, object>;

export class World {
  private nextEntityId = 1;
  private readonly entities = new Set<EntityId>();
  private readonly components = new Map<ComponentType, ComponentStore>();
  private readonly systems: SystemEntry[] = [];
  private nextSystemOrder = 0;

  elapsedTime = 0;
  frame = 0;

  createEntity(): EntityId {
    const entity = this.nextEntityId;
    this.nextEntityId += 1;
    this.entities.add(entity);
    return entity;
  }

  destroyEntity(entity: EntityId): boolean {
    if (!this.entities.delete(entity)) {
      return false;
    }

    for (const store of this.components.values()) {
      store.delete(entity);
    }

    return true;
  }

  hasEntity(entity: EntityId): boolean {
    return this.entities.has(entity);
  }

  getEntityCount(): number {
    return this.entities.size;
  }

  getEntities(): EntityId[] {
    return [...this.entities];
  }

  addComponent<TComponent extends object>(
    entity: EntityId,
    type: ComponentType<TComponent>,
    component: TComponent
  ): this {
    this.assertEntity(entity);
    this.getOrCreateStore(type).set(entity, component);
    return this;
  }

  removeComponent(entity: EntityId, type: ComponentType): boolean {
    this.assertEntity(entity);
    return this.components.get(type)?.delete(entity) ?? false;
  }

  hasComponent(entity: EntityId, type: ComponentType): boolean {
    this.assertEntity(entity);
    return this.components.get(type)?.has(entity) ?? false;
  }

  getComponent<TComponent extends object>(
    entity: EntityId,
    type: ComponentType<TComponent>
  ): TComponent | undefined {
    this.assertEntity(entity);
    return this.components.get(type)?.get(entity) as TComponent | undefined;
  }

  requireComponent<TComponent extends object>(
    entity: EntityId,
    type: ComponentType<TComponent>
  ): TComponent {
    const component = this.getComponent(entity, type);

    if (!component) {
      throw missingComponentError(entity, type);
    }

    return component;
  }

  query(...types: ComponentType[]): QueryResult[] {
    const matches: QueryResult[] = [];

    for (const entity of this.entities) {
      if (types.every((type) => this.components.get(type)?.has(entity))) {
        matches.push(this.createQueryResult(entity));
      }
    }

    return matches;
  }

  addSystem(system: System, priority = 0): this {
    this.systems.push({
      system,
      priority,
      order: this.nextSystemOrder
    });
    this.nextSystemOrder += 1;
    this.systems.sort(
      (a, b) => a.priority - b.priority || a.order - b.order
    );
    return this;
  }

  removeSystem(system: System): boolean {
    const index = this.systems.findIndex((entry) => entry.system === system);

    if (index === -1) {
      return false;
    }

    this.systems.splice(index, 1);
    return true;
  }

  getSystems(): System[] {
    return this.systems.map((entry) => entry.system);
  }

  update(deltaTime: number): void {
    const context: SystemContext = {
      world: this,
      deltaTime,
      elapsedTime: this.elapsedTime,
      frame: this.frame
    };

    for (const { system } of this.systems) {
      system.update(context);
    }

    this.elapsedTime += deltaTime;
    this.frame += 1;
  }

  private createQueryResult(entity: EntityId): QueryResult {
    return {
      entity,
      get: <TComponent extends object>(
        type: ComponentType<TComponent>
      ): TComponent => this.requireComponent(entity, type),
      tryGet: <TComponent extends object>(
        type: ComponentType<TComponent>
      ): TComponent | undefined => this.getComponent(entity, type),
      has: (type: ComponentType): boolean => this.hasComponent(entity, type)
    };
  }

  private getOrCreateStore(type: ComponentType): ComponentStore {
    let store = this.components.get(type);

    if (!store) {
      store = new Map<EntityId, object>();
      this.components.set(type, store);
    }

    return store;
  }

  private assertEntity(entity: EntityId): void {
    if (!this.entities.has(entity)) {
      throw missingEntityError(entity);
    }
  }
}
