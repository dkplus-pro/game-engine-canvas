# 第 13 课：全屏 Canvas 霓虹桌球

## 本课目标

用 `packages/engine` 的基础能力从零实现一个教学版 8 球桌球游戏：全屏 Canvas 负责球台和球体渲染，React DOM 负责 HUD、按钮和可访问交互，规则层负责物理、回合、犯规和胜负。

本课重点不是把桌球写成一个巨大的组件，而是练习“引擎原语 + 游戏层规则”的分层方式。圆形碰撞、袋口和 8 球规则都放在 `apps/billiards/src/game`，避免污染通用引擎包。

## 你将实现什么

- `apps/billiards`：独立 Next.js 应用，全屏 Canvas 运行桌球。
- 16 颗球：母球、1-7 低号球、8 号球、9-15 花色球。
- 核心交互：拖拽瞄准、松手蓄力击球、按钮/键盘快速击球、暂停、重开、全屏。
- 桌球规则：确定性摆球、球-球碰撞、库边反弹、袋口、母球落袋犯规、分组、换手、8 号球胜负。
- 自动化验证：Vitest 覆盖物理和规则，Playwright 覆盖页面启动、触控目标和 console/pageerror 为 0。

## 分层结构

```text
apps/billiards
  app/
    layout.tsx          # 页面元数据
    page.tsx            # 挂载客户端游戏
    globals.css         # 全屏布局、霓虹 HUD、可访问 focus、移动端适配
  src/components/
    billiards-app.tsx   # React 控制层：Canvas loop、输入桥接、HUD、音效触发
  src/game/
    constants.ts        # 球台尺寸、球半径、摩擦、袋口、配色
    types.ts            # 规则层状态和 HUD 快照
    table.ts            # 确定性摆球、球分组、剩余球查询
    physics.ts          # 圆形碰撞、库边反弹、摩擦、落袋
    input.ts            # InputState -> BilliardsCommand
    simulation.ts       # World/System + 回合、犯规、胜负结算
    render.ts           # Canvas 绘制和 DPR 指针映射
    audio.ts            # WebAudio 合成音效
  test/
    simulation.test.ts  # 物理和规则单测
  e2e/
    billiards.spec.ts   # 浏览器端无 console 错误验证
```

## 为什么复用 engine

本课复用仓库通用引擎中的这些原语：

- `World`：把桌球规则挂成每帧更新的系统，而不是散落在 React 回调里。
- `InputState`：统一键盘和指针状态，支持 `wasKeyPressed`、`pointer.released` 等一帧事件。
- `Vec2`：表达球位置、速度、瞄准方向和碰撞法线。
- `clamp`：限制蓄力、库边坐标和母球重置位置。

桌球的圆形碰撞没有改 `packages/engine`，因为当前引擎通用碰撞系统以 AABB 为主。本课把更具体的桌球物理放在 game 层，既能快速交付，也保留将来把 CircleCollider 抽到引擎的空间。

## 物理规则

桌球每帧按以下顺序推进：

1. 位置积分：`position += velocity * dt`。
2. 摩擦衰减：按帧率无关的指数衰减降低速度。
3. 库边反弹：球心越过可玩区域时夹回边界，并按恢复系数反向速度。
4. 球-球碰撞：等质量球只交换法线方向速度分量，切线速度保持。
5. 袋口检测：球心进入袋口半径后标记为 `pocketed`，母球落袋记录为犯规。
6. 停球结算：所有球速度低于阈值并等待短暂稳定时间后处理回合。

关键注释应写在“为什么这样做”的边界处，例如 DPR 坐标映射、等质量冲量、浏览器音频手势限制、母球重置时避让已有球。

## 教学版 8 球规则

实现采用可测试的教学版规则：

- 玩家 1 开球。
- 首次合法打进低号或花色球时决定双方分组。
- 打进己方目标球后继续出杆。
- 未打进目标球则换手。
- 母球落袋为犯规：母球重置到开球侧安全点，并换手。
- 清空己方目标球后合法打进 8 号球获胜。
- 未清空目标球就打进 8 号球，对手获胜。

这套规则足够支撑课程闭环，同时避免把真实比赛中所有争议规则一次性塞进初版。

## 输入与全屏 Canvas

Canvas 使用 CSS 铺满视口，同时按 `devicePixelRatio` 设置真实像素尺寸。指针事件不能直接使用 `clientX/clientY` 作为桌球坐标，必须经过：

```text
浏览器坐标 -> canvas CSS 坐标 -> 减去球台屏幕偏移 -> 除以球台缩放 -> 逻辑球台坐标
```

这一步在 `screenToTablePoint` 中完成，Playwright 负责验证页面没有滚动条，移动端按钮保持 44px 以上。

## UI/UX 设计

视觉方向采用 Dark OLED + 霓虹桌球厅：

- 背景：深蓝黑渐变和弱网格，不干扰球台。
- 主色：红/蓝对抗；绿色表示可继续；黄色表示 8 球和提醒。
- HUD：DOM 毛玻璃卡片，只占边缘区域，不遮挡中心球台。
- 可访问性：按钮有可见 focus；状态文本使用 `aria-live`；触控按钮不小于 44px。
- 动效：只在按钮和蓄力条使用短过渡，并尊重 `prefers-reduced-motion`。

## 音效策略

没有依赖远端资源。`audio.ts` 使用 WebAudio 合成短音色：击球、碰撞、落袋、犯规。浏览器要求音频必须由用户手势启动，因此 `start()` 只在开始游戏、拖拽或按钮点击时恢复 `AudioContext`，不会阻塞规则推进。

## 单元测试清单

`apps/billiards/test/simulation.test.ts` 至少覆盖：

- 确定性摆球：15 颗目标球 + 母球位置稳定。
- 球-球碰撞：等质量圆球交换速度。
- 库边反弹：速度反向并记录库边接触。
- 袋口：母球落袋会记录犯规、重置母球并换手。
- 分组：首次合法打进低号/花色后分配双方目标。
- 换手：未打进目标球时轮到对手。
- 8 号球：过早落袋判对手获胜。
- 暂停：暂停状态不推进物理。

## Playwright 验证清单

`apps/billiards/e2e/billiards.spec.ts` 覆盖：

- 打开 `/` 能看到标题、主区域和 Canvas。
- `body` 保持 `overflow: hidden`，Canvas 全屏承载游戏。
- 点击“开始对局”进入 AIM 状态。
- `P` 能暂停/继续，HUD 状态更新。
- “击球”按钮能进入 ROLLING 状态。
- 移动端视口下开始、击球、暂停、重开按钮都不小于 44px。
- 测试期间 `console.error` 和 `pageerror` 数组为空。

## 验证命令

```bash
pnpm --filter @game-engine-canvas/billiards test
pnpm --filter @game-engine-canvas/billiards lint
pnpm --filter @game-engine-canvas/billiards build
pnpm --filter @game-engine-canvas/billiards e2e
```

团队验收时还应运行根级 `pnpm test`、`pnpm lint`、`pnpm build`，确保新增 app 不破坏现有 playground、tank-battle 和 engine。

## 延伸练习

- 增加击球点偏移和旋转，让母球产生更真实的跟杆/缩杆。
- 把教学版规则扩展为完整 8 球规则，包括开球有效性和指定袋。
- 为球桌增加粒子、轨迹回放和慢动作教学模式。
- 如果多个游戏都需要圆形碰撞，再把 `CircleCollider` 和圆形 broad phase 抽回 `packages/engine`。
