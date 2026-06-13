# 第 10 课：Scene

## 本课目标

实现场景管理，让游戏可以在菜单、关卡、暂停和结束状态之间切换。

## 你将实现什么

- `Scene`
- `createScene`
- `SceneManager`
- `onEnter`
- `onExit`
- 当前场景 World 更新

## 核心概念

每个 Scene 可以拥有自己的 World：

```ts
const level = createScene({ name: "level-01" });
manager.changeTo(level);
manager.update(deltaTime);
```

切换场景时，旧场景执行 `onExit`，新场景执行 `onEnter`。

## Demo 说明

`/lessons/09-scene` 提供 Menu 和 Level 两个场景，切换时展示当前场景名、World 帧数和生命周期计数。

## 验证方式

```bash
pnpm build
pnpm test
```

## 下一课预告

下一课用已有模块做完整 Breakout 游戏。
