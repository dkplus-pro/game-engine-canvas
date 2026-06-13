import type { ComponentType } from "react";

export interface Lesson {
  readonly slug: string;
  readonly number: number;
  readonly title: string;
  readonly summary: string;
  readonly component: ComponentType;
}
