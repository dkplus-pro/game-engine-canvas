# 第 7 课：Assets 与 Sprite

## 本课目标

实现资源存储和精灵渲染，让实体可以绘制图片而不只是几何图形。

## 你将实现什么

- `AssetStore`
- `SpriteRenderer`
- `CanvasRenderer.drawSprite`
- `RenderSystem` 同时处理 shape 和 sprite

## 核心概念

资源加载和实体渲染需要解耦。实体组件只保存资源 key：

```ts
world.addComponent(entity, SpriteRenderer, new SpriteRenderer({
  imageKey: "hero",
  width: 32,
  height: 32
}));
```

实际图片由 `AssetStore` 管理：

```ts
assets.registerImage("hero", image);
```

## Demo 说明

`/lessons/06-assets-sprite` 在浏览器中创建一个小 canvas 作为 sprite 图像，注册到 `AssetStore`，再用 ECS 创建多个 sprite 实体并渲染。

## 验证方式

```bash
pnpm build
pnpm test
```

## 下一课预告

下一课实现 TileMap 和地图生成。
