import { EcsBasicDemo } from "@/features/ecs-basic/ecs-basic-demo";
import { GameLoopDemo } from "@/features/game-loop/game-loop-demo";
import { MathDemo } from "@/features/math/math-demo";
import { CanvasRendererDemo } from "@/features/canvas-renderer/canvas-renderer-demo";
import { InputDemo } from "@/features/input/input-demo";
import { AssetsSpriteDemo } from "@/features/assets-sprite/assets-sprite-demo";
import { TileMapDemo } from "@/features/tilemap/tilemap-demo";
import { CollisionDemo } from "@/features/collision/collision-demo";
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
  },
  {
    slug: "04-canvas-renderer",
    number: 4,
    title: "Canvas Renderer",
    summary: "把 Transform2D 和 ShapeRenderer 组件绘制到 HTML Canvas。",
    component: CanvasRendererDemo
  },
  {
    slug: "05-input",
    number: 5,
    title: "Input",
    summary: "统一键盘和指针状态，区分 down、pressed、released。",
    component: InputDemo
  },
  {
    slug: "06-assets-sprite",
    number: 6,
    title: "Assets & Sprite",
    summary: "注册图片资源，并通过 SpriteRenderer 绘制精灵实体。",
    component: AssetsSpriteDemo
  },
  {
    slug: "07-tilemap-procgen",
    number: 7,
    title: "TileMap & Procgen",
    summary: "使用 TileMap、地牢房间生成和元胞自动机洞穴生成地图。",
    component: TileMapDemo
  },
  {
    slug: "08-collision",
    number: 8,
    title: "Collision",
    summary: "使用 Transform2D 和 AabbCollider 检测实体之间的矩形碰撞。",
    component: CollisionDemo
  }
];

export function getLesson(slug: string): Lesson | undefined {
  return lessons.find((lesson) => lesson.slug === slug);
}
