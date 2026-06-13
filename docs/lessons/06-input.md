# 第 6 课：Input

## 本课目标

建立统一输入状态，让游戏逻辑可以读取键盘和指针，而不是直接依赖 DOM 事件。

## 你将实现什么

- `InputState`
- `PointerState`
- `bindBrowserInput`
- key down / pressed / released
- pointer down / pressed / released / position

## 核心概念

浏览器事件是瞬时的，游戏系统需要的是“当前帧状态”。所以输入模块把事件转换成可查询状态：

```ts
input.keyDown("ArrowRight");
input.isKeyDown("ArrowRight");
input.wasKeyPressed("ArrowRight");
input.endFrame();
```

`endFrame` 会清空 pressed/released 这类单帧状态，但保留 down 状态。

## Demo 说明

`/lessons/05-input` 使用 `InputState`：

- 键盘驱动实体移动。
- 指针事件更新坐标。
- 页面展示当前活动按键数量和指针状态。

## 验证方式

```bash
pnpm build
pnpm test
```

## 下一课预告

下一课实现 Assets 和 SpriteRenderer。
