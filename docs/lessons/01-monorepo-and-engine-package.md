# 第 1 课：Monorepo 与引擎包骨架

## 本课目标

建立游戏引擎项目的基础工程结构，让引擎代码可以作为 npm 包构建，也可以被 apps 里的 demo 直接引用。

## 你将实现什么

- 一个基于 pnpm workspace 的 monorepo。
- 一个由 Turborepo 调度的构建系统。
- 一个位于 `packages/engine` 的引擎包。
- 一个位于 `apps/demo-01-ecs-basic` 的 Next.js demo。
- 一套最小验证命令：构建、类型检查、单元测试。

## 核心概念

monorepo 把多个应用和多个包放在同一个仓库里管理。本项目约定：

- `apps/*` 放 demo 和完整游戏。
- `packages/*` 放可复用的引擎模块。
- `docs/*` 放课程和架构文档。

引擎包使用源码开发，发布时输出到 `dist`：

- `dist/index.mjs` 面向 ESM 使用者。
- `dist/index.cjs` 面向 CommonJS 使用者。
- `dist/index.d.ts` 面向 TypeScript 类型提示。

## 模块设计

第一阶段不实现完整游戏逻辑，只建立一条可运行链路：

```text
apps/demo-01-ecs-basic
  -> workspace dependency
packages/engine
  -> rollup build
  -> dist output
```

demo 通过 `@game-engine-canvas/engine` 引用引擎包。这样后续每增加一个引擎模块，都能马上在 app 中做可视化验证。

## 关键 API

当前只有一个用于验证包引用的 API：

```ts
import { createEngine } from "@game-engine-canvas/engine";

const engine = createEngine();
```

它返回引擎包的基础身份信息。下一课会把它替换为真正的 ECS 世界模型。

## Demo 说明

`apps/demo-01-ecs-basic` 是第一个 Next.js demo。当前页面展示：

- demo 名称
- 引擎包名称
- 引擎包版本
- 一个临时的实体预览区域

这个 demo 的主要价值不是玩法，而是验证 app 可以正确消费本地 engine 包。

## 验证方式

在仓库根目录执行：

```bash
pnpm install
pnpm build
pnpm test
```

开发时可以启动 demo：

```bash
pnpm --filter @game-engine-canvas/demo-01-ecs-basic dev
```

## 下一课预告

下一课实现 ECS 核心：

- Entity
- Component
- System
- World
- Query

完成后，demo 会从静态预览变成真实读取 ECS 世界状态的页面。
