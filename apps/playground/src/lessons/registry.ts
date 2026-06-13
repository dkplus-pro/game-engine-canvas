import { EcsBasicDemo } from "@/features/ecs-basic/ecs-basic-demo";
import { GameLoopDemo } from "@/features/game-loop/game-loop-demo";
import { MathDemo } from "@/features/math/math-demo";
import type { Lesson } from "./types";

export const lessons: Lesson[] = [
  {
    slug: "01-ecs-basic",
    number: 1,
    title: "ECS Basic",
    summary: "创建 World、实体、组件和系统，并展示 query 结果。",
    component: EcsBasicDemo
  },
  {
    slug: "02-game-loop",
    number: 2,
    title: "Game Loop",
    summary: "用 Engine.step 和 deltaTime 推进 ECS 世界状态。",
    component: GameLoopDemo
  },
  {
    slug: "03-math",
    number: 3,
    title: "Math Primitives",
    summary: "使用 Vec2、Rect、clamp 和 lerp 表达 2D 游戏中的空间关系。",
    component: MathDemo
  }
];

export function getLesson(slug: string): Lesson | undefined {
  return lessons.find((lesson) => lesson.slug === slug);
}
