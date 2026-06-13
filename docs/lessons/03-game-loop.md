# 第 3 课：Game Loop

## 本课目标

把 ECS 世界接入游戏循环，让系统可以按时间推进状态。

## 你将实现什么

- `Engine`
- `Engine.step(deltaTime)`
- `Engine.start()`
- `Engine.stop()`
- delta time 限制

## 核心概念

游戏循环负责不断调用 `world.update(deltaTime)`。系统不应该假设每帧时间固定，而应该根据 `deltaTime` 更新组件。

```ts
position.x += velocity.x * deltaTime;
```

## 模块设计

`Engine` 包装一个 `World`。核心逻辑在 `step`：

```ts
const engine = new Engine({ world });
engine.step(1 / 60);
```

浏览器运行时可以使用 `start` 启动 `requestAnimationFrame` 循环：

```ts
engine.start();
engine.stop();
```

为了避免切后台后 delta time 过大，`Engine` 会用 `maxDeltaTime` 截断单帧时间。

## Demo 说明

`apps/demo-02-game-loop` 创建两个带速度的实体，连续执行多次 `Engine.step`，页面展示推进后的坐标、帧数和累计时间。

## 验证方式

```bash
pnpm build
pnpm test
```

单元测试覆盖：

- delta time 截断
- `start` / `stop`
- RAF 回调推进世界帧数

## 下一课预告

下一课实现数学基础：`Vec2`、`Rect`、插值和范围限制。
