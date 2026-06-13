# 第 11 课：完整游戏 Breakout

## 本课目标

用前面完成的引擎能力做一个完整可玩的 2D 游戏。

## 你将实现什么

- 一个 Breakout 游戏页面。
- requestAnimationFrame 游戏循环。
- `InputState` 控制挡板。
- `Rect` 做球、挡板和砖块的碰撞判断。
- Canvas 绘制游戏画面。
- 分数、生命和结束状态。

## 核心概念

完整游戏不是新建一个孤立 app，而是放在课程 playground 中的一个页面。这样课程 demo 和成品游戏共享同一个壳层、路由和引擎包。

游戏内部仍然按模块拆分：

- `breakout-demo.tsx` 负责课程页面展示。
- `breakout-game.tsx` 负责游戏循环、输入、更新和绘制。

## Demo 说明

`/lessons/10-breakout` 是第一个完整游戏页面。

它复用：

- `InputState`
- `Rect`
- `clamp`
- Canvas 绘制

## 验证方式

```bash
pnpm build
pnpm test
```

## 下一课预告

后续可以继续加入声音、关卡数据、TileMap 场景、资源加载和发布流程。
