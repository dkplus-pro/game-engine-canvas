# 第 12 课：完整游戏 Tank Battle 90

## 本课目标

用已经完成的 `packages/engine` 能力实现一个类似经典 90 坦克大战的全屏 Canvas 游戏，并把完整游戏拆成可测试、可复盘的课程项目。

本课不是只画一个静态页面，而是把前面课程中的 ECS、输入、TileMap、AABB 碰撞、Canvas 渲染和 Scene 状态组织成一个完整玩法闭环。

## 你将实现什么

- `apps/tank-battle`：独立 Next.js 应用，全屏 Canvas 承载游戏画面。
- 像素风 HUD：分数、生命、敌人数量、关卡、暂停/重开状态。
- 经典规则：玩家坦克、敌方坦克、基地、防守/击毁、砖墙/钢墙/河流/草地、子弹碰撞。
- 程序化地图：使用确定性 seed 生成关卡，保留基地防守区和出生区。
- 自动化验证：Vitest 单元测试覆盖规则，Playwright 覆盖页面启动和 console 无报错。

## 核心概念

Tank Battle 的复杂度来自“规则很多”，不是单个算法很难。课程实现时应先把游戏拆成四层：

```text
Next.js App / HUD
  -> React 负责菜单、按钮、状态说明和可访问性
Canvas Runtime
  -> requestAnimationFrame、画布缩放、渲染顺序
Game Rules
  -> 坦克、子弹、基地、敌人波次、暂停/重开
Engine Primitives
  -> World、InputState、TileMap、Rect、AabbCollider、CanvasRenderer
```

React 不直接修改规则数据；它只发送“开始、暂停、重开、选关、触控方向、开火”这些意图。规则层每帧读取输入状态并推进世界。

## 地图与图块约定

建议用数字 TileMap 表达地图，再在渲染层映射成像素素材：

| Tile | 含义 | 坦克通行 | 子弹效果 | 备注 |
| --- | --- | --- | --- | --- |
| `0` | 地面 | 是 | 穿过 | 默认可通行 |
| `1` | 砖墙 | 否 | 击毁/削弱 | 可做局部破坏 |
| `2` | 钢墙 | 否 | 阻挡 | 普通子弹不破坏 |
| `3` | 河流 | 否 | 穿过 | 可作为地图障碍 |
| `4` | 草地 | 是 | 穿过 | 渲染在坦克上方形成遮挡 |
| `5` | 基地 | 否 | 命中失败 | 需要显著保护 |

生成地图时要保留三个硬约束：

1. 玩家出生区和基地周围必须可达。
2. 敌方出生点不能被砖墙、钢墙或河流完全封死。
3. 相同 seed 必须生成相同地图，方便课程截图和回归测试。

## 碰撞与规则

Tank Battle 可以先不用复杂物理，只使用 AABB：

- 坦克移动前计算下一帧矩形，若碰到不可通行图块或其它坦克则取消移动。
- 子弹使用小矩形碰撞，命中后立即结算并销毁。
- 基地被敌方子弹命中时进入 `gameOver`。
- 玩家子弹命中敌方坦克时增加分数并减少敌人数量。
- 暂停状态下保留画面，但不推进敌人、子弹和波次计时。

`CollisionSystem` 当前是全量两两检测。课程实现可以先接受这一点，因为地图规模和实体数量可控；如果后续加入更多敌人或粒子，再引入按图块分桶的 broad phase。

## 输入与全屏 Canvas

键盘建议约定：

- `WASD` / 方向键：移动。
- `Space`：开火。
- `P`：暂停/继续。
- `R`：重开当前关。
- `Escape`：回到菜单。

移动端使用屏幕按钮，不依赖浏览器默认手势。Canvas 需要根据 `devicePixelRatio` 设置实际像素尺寸，并把指针坐标映射回游戏逻辑坐标。不要直接把全屏 CSS 尺寸当作逻辑地图尺寸，否则高分屏和窗口缩放会让触控命中偏移。

## 本仓库实际文件组织

```text
apps/tank-battle
  app/
    layout.tsx              # 页面元数据和 html/body
    page.tsx                # 挂载客户端游戏组件
    globals.css             # 全屏像素风 UI、HUD、触控按钮
  public/assets/
    tank-battle-sprites.png # Bailian 生成的像素素材 atlas
    audio/mission-start.wav # Bailian 生成的开场语音
  src/components/
    tank-battle-app.tsx     # React 控制层：选关、HUD、键盘/触控、Canvas loop
  src/game/
    constants.ts            # 逻辑尺寸、图块、速度、方向
    levels.ts               # 可选关卡参数
    map-generator.ts        # seed 地图生成、基地/出生区约束
    input.ts                # InputState -> TankCommand
    simulation.ts           # ECS World/System + 规则推进
    render.ts               # Canvas 绘制顺序和全屏缩放
    assets.ts               # AssetStore + PNG/WAV 加载
    audio.ts                # WebAudio 射击/爆炸/道具兜底音效
    types.ts                # 规则层类型
  test/
    map-generator.test.ts
    simulation.test.ts
  e2e/
    tank-battle.spec.ts
```

单个文件如果超过 500 行，应优先按“状态、规则、渲染、输入、音频、UI”拆分，而不是继续追加条件分支。本实现中最大的规则文件 `simulation.ts` 控制在 500 行以内，方便课程逐段讲解。

## 素材与音效

本课使用 `bl image generate` 生成了一个原创复古像素素材图集，保存到 `apps/tank-battle/public/assets/tank-battle-sprites.png`。运行时通过 engine 的 `AssetStore` 注册为 `tank-atlas`，当前主要作为菜单/背景装饰；核心战斗单位仍使用程序化像素绘制，以确保 sprite atlas 加载失败时游戏也能正常运行。

开场语音由 `bl speech synthesize` 使用 `longfei_v3` 声音生成，保存到 `apps/tank-battle/public/assets/audio/mission-start.wav`。射击、爆炸和道具提示则用 WebAudio 生成短音色，这样不依赖额外网络请求，也不会因为浏览器阻止自动播放而影响规则推进。

## 单元测试清单

Vitest 至少覆盖：

- 相同 seed 生成相同地图，不同 seed 有机会生成不同布局。
- 基地和玩家出生点周围不会被完全封死。
- 砖墙被普通子弹命中后会被破坏，钢墙不会。
- 河流阻挡坦克但不阻挡子弹，草地不阻挡移动。
- 暂停时 `update` 不推进子弹位置、敌人计时或分数。
- 重开会重置生命、分数、敌人波次和地图。
- 玩家/敌人/基地碰撞后进入正确结果状态。

## Playwright 验证清单

Playwright 用来证明浏览器页面真的能启动，并且没有隐藏的客户端错误：

- 打开 `/` 后能看到标题“坦克大战 90”和全屏 Canvas。
- 首屏按钮可聚焦，触控目标不小于 44px。
- 选择关卡、开始、暂停、继续、重开都能更新 HUD 状态。
- 运行过程中 `console.error` 和 `pageerror` 数量为 0。
- 视口切换到移动尺寸后，触控按钮仍在安全区内，Canvas 不出现滚动条。

示例命令：

```bash
pnpm --filter @game-engine-canvas/tank-battle test
pnpm --filter @game-engine-canvas/tank-battle e2e
pnpm --filter @game-engine-canvas/tank-battle build
```

## 验收标准

本课完成时应满足：

- `pnpm build` 和 `pnpm test` 通过。
- Tank Battle 页面启动后无 console 错误。
- 至少一个关卡可以完整游玩：开始、移动、开火、暂停、重开、胜负结算。
- 文档能解释为什么使用 `packages/engine` 的 ECS、输入、TileMap 和碰撞模块，而不是在 React 组件里写所有规则。

## 下一课预告

后续可以继续加入：

- 道具系统：护盾、冰冻、升级子弹、加命。
- 更完整的敌人 AI 和波次配置。
- 关卡编辑器，把 TileMap 导出成 JSON。
- WebAudio 音效混音和设置菜单。
