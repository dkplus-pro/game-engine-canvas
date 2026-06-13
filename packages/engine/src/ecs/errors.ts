import type { ComponentType, EntityId } from "./types";

export class WorldError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WorldError";
  }
}

export function describeComponentType(type: ComponentType): string {
  if (typeof type === "string") {
    return type;
  }

  if (typeof type === "symbol") {
    return type.description ?? type.toString();
  }

  return type.name || "AnonymousComponent";
}

export function missingEntityError(entity: EntityId): WorldError {
  return new WorldError(`Entity ${entity} does not exist.`);
}

export function missingComponentError(
  entity: EntityId,
  type: ComponentType
): WorldError {
  return new WorldError(
    `Entity ${entity} does not have component ${describeComponentType(type)}.`
  );
}
