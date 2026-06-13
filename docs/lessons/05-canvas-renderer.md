# 第 5 课：Canvas Renderer

## 本课目标

把 ECS 世界里的实体组件绘制到 HTML Canvas，形成第一个真正的 2D 渲染管线。

## 你将实现什么

- `Transform2D`
- `ShapeRenderer`
- `CanvasRenderer`
- `RenderSystem`

## 核心概念

渲染系统不直接关心“玩家”或“敌人”，只关心实体是否同时拥有：

- `Transform2D`
- `ShapeRenderer`

```ts
for (const result of world.query(Transform2D, ShapeRenderer)) {
  renderer.drawShape(result.get(Transform2D), result.get(ShapeRenderer));
}
```

## 模块设计

`CanvasRenderer` 封装 Canvas 2D context 的具体绘制操作。`RenderSystem` 负责从 ECS 查询可渲染实体。

这样后续可以继续扩展：

- `SpriteRenderer`
- `TileMapRenderer`
- Camera
- Layer

## Demo 说明

`/lessons/04-canvas-renderer` 在 client component 中获取 canvas context，然后：

- 创建 ECS World。
- 添加 3 个实体。
- 给实体挂载 `Transform2D` 和 `ShapeRenderer`。
- 注册 `RenderSystem`。
- 执行一次 `world.update(0)` 完成绘制。

## 验证方式

```bash
pnpm build
pnpm test
```

## 下一课预告

下一课实现 Input，接入键盘、鼠标和指针状态。
