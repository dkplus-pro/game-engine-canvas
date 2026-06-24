# 第 13 课：用 Canvas 和引擎原语实现全屏桌球

本课把 `packages/engine` 的基础能力组合成一个全屏 Canvas 桌球练习局。最终应用位于 `apps/billiards`，重点是：浏览器运行时、圆形物理、规则状态、HUD、无障碍按钮、Web Audio 反馈和自动化验证。

## 1. 课程目标

- 使用 `World` 注册桌球规则系统，把游戏更新接入引擎帧循环。
- 使用 `InputState` 统一键盘输入，并在 React 组件中补充 Pointer Events 拖拽蓄力。
- 使用 `Vec2`、`Rect`、`clamp` 表达球桌坐标、球体速度、桌边限制和击球力度边界。
- 纯 Canvas 绘制霓虹球桌、球、袋口、瞄准线和蓄力反馈，避免依赖远端素材。
- 使用 Vitest 覆盖核心物理/规则，用 Playwright 检查全屏布局、触控尺寸和 console/pageerror 为零。

## 2. 目录结构

```text
apps/billiards/
  app/                  # Next.js App Router 页面与全局样式
  src/components/       # React 外壳、HUD、按钮和 Canvas 生命周期
  src/game/             # 单一职责游戏模块
    constants.ts        # 逻辑尺寸、球桌 Rect、袋口和力度参数
    types.ts            # BallState、BilliardsState、HUD 类型
    input.ts            # InputState -> BilliardsCommand
    runtime.ts          # World + 规则 System
    rules.ts            # 开球、回合、暂停、重置、胜利判定
    physics.ts          # 圆形碰撞、桌边反弹、落袋和母球摆放
    render.ts           # Canvas 绘制与 DPR/坐标映射
    audio.ts            # 用户手势后的 Web Audio 合成音效
  test/                 # Vitest 物理/规则测试
  e2e/                  # Playwright 前端与 console 无报错测试
```

## 3. 运行时设计

`createBilliardsRuntime()` 创建三件事：

1. `InputState` 保存键盘状态。
2. `BilliardsState` 保存球、回合、杆数、进球数、瞄准角度和力度。
3. `World` 注册 `BilliardsRules` 系统，每帧读取命令并调用 `updateBilliards()`。

React 组件只负责浏览器生命周期：Canvas resize、DPR 缩放、Pointer Events、按钮点击、HUD 同步和音效触发。这样物理和规则可以在 Node/Vitest 中独立运行。

## 4. 物理实现要点

引擎当前提供的是 AABB 碰撞系统，桌球需要圆形碰撞，所以圆形物理放在 app 层：

- 每帧根据速度移动球，并应用线性阻尼和滚动摩擦。
- 用 `TABLE_RECT` 限制球心范围，撞桌边时按恢复系数反弹。
- 两球距离小于直径时先做位置修正，再按等质量弹性碰撞交换法线速度。
- 球心进入任一袋口半径后标记 `pocketed`；母球落袋记录 scratch，并在本杆完全停止后回到开球线附近的空位。
- 连续 4 帧低于停止速度才结算本杆，避免临界速度导致回合抖动。

这些逻辑对应 `test/simulation.test.ts` 中的回归测试：球架不重叠、力度夹紧、球碰球传递速度、桌边反弹、母球落袋换手、最后一颗球落袋获胜。

## 5. 输入与交互

- 鼠标/触控：在 Canvas 上拖拽，拖拽向量决定瞄准角和力度，松手击球。
- 键盘：`A/D` 或方向键左右调整瞄准，`W/S` 或上下方向键调力度，`Space/Enter` 击球，`P/Escape` 暂停，`R` 重开。
- HUD 按钮：暂停/继续、重开、左右微调、轻击/中击/强击都满足至少 44px 的触控目标。
- `aria-live` 状态文本持续播报当前提示，Canvas 和主区域都有中文标签。

## 6. 视觉与音频

视觉采用暗黑 OLED 背景、红蓝主辅色、绿色强调色和毛玻璃 HUD。Canvas 内部绘制：

- 霓虹网格背景。
- 渐变球桌轨道与深绿色台呢。
- 6 个发光袋口。
- 虚线瞄准线、幽灵球和随力度变化的球杆。
- 径向渐变球体、色球/花球/黑八编号。

音频使用 Web Audio 合成短音效，不需要外部文件；所有调用都包在 `try/catch` 中，浏览器阻止自动播放时不会影响游戏或测试。

## 7. 验证命令

桌球包的最小验证：

```bash
pnpm --filter @game-engine-canvas/billiards test
pnpm --filter @game-engine-canvas/billiards lint
pnpm --filter @game-engine-canvas/billiards build
pnpm --filter @game-engine-canvas/billiards e2e
```

团队最终验证还应运行根命令：

```bash
pnpm test
pnpm lint
pnpm build
```

Playwright 用桌球自己的 `playwright.config.ts` 启动 Next dev server，并在每个用例里收集 `console.error` 与 `pageerror`，断言错误数组为空。
