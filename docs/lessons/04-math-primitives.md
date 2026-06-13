# 第 4 课：Math Primitives

## 本课目标

为 2D 游戏引擎补齐基础数学工具。移动、碰撞、相机、地图和动画都会依赖这些类型。

## 你将实现什么

- `Vec2`
- `Rect`
- `clamp`
- `lerp`
- 向量加减、缩放、归一化、距离、点积
- 矩形包含和相交判断

## 核心概念

游戏中的位置、速度、方向通常可以用二维向量表示：

```ts
const position = new Vec2(80, 120);
const velocity = new Vec2(40, 0);

position.add(velocity.clone().scale(deltaTime));
```

矩形适合表达对象包围盒、屏幕区域和地图格子范围：

```ts
const actor = new Rect(10, 20, 32, 32);
const wall = new Rect(30, 20, 32, 32);

actor.intersects(wall);
```

## 模块设计

`Vec2` 是可变对象。游戏循环中会频繁更新坐标，减少临时对象有助于控制内存分配。需要保留旧值时可以调用 `clone()`。

`Rect` 提供只读派生属性：

- `left`
- `right`
- `top`
- `bottom`
- `center`

## Demo 说明

`/lessons/03-math` 会展示：

- 从起点到目标点的向量插值。
- 归一化方向和下一步位置。
- 边界内 clamp 后的位置。
- actor 矩形和 sensor 矩形的相交状态。

页面代码保持分层：

- `app/lessons/[slug]/page.tsx` 负责路由。
- `src/lessons/registry.ts` 负责课程注册。
- `src/features/math/*` 负责 math demo 的数据和视图。

## 验证方式

```bash
pnpm build
pnpm test
```

单元测试覆盖：

- 向量运算
- 距离和点积
- 矩形包含和相交
- clamp 和 lerp

## 下一课预告

下一课实现 Canvas Renderer，把 ECS 中的 `Transform2D` 和渲染组件画到 `<canvas>` 上。
