# 第 13 课：全屏 Canvas 桌球游戏

## 本课目标

用 `packages/engine` 中已经完成的基础能力，从零到一实现一个可运行、可测试、可复盘的全屏 Canvas 桌球游戏。课程目标不是只画一张球桌，而是把桌球拆成可维护的运行时、物理、规则、渲染、音频、HUD 和 QA 流程。

本课的成品优先放在 `apps/billiards`，并复用引擎包中的 `World`、`InputState`、`Vec2`、`Rect`、`clamp` 等基础能力。圆形碰撞、袋口和桌球规则保留在游戏层实现，因为当前引擎碰撞系统只提供 AABB。

## 你将实现什么

- `apps/billiards`：独立 Next.js 应用，全屏 Canvas 承载桌球画面。
- 16 颗球：1 颗母球、15 颗目标球，使用确定性三角 rack 开局。
- 桌球核心操作：鼠标/触控拖拽瞄准、蓄力、释放击球、回合切换、犯规提示和重置。
- 物理规则：球-球圆形碰撞、库边反弹、袋口进球、摩擦减速、静止判定。
- 暗黑霓虹 UI：毛玻璃 HUD、蓄力条、幽灵球瞄准、可见焦点、移动端触控目标。
- 自动化验证：Vitest 覆盖物理/规则，Playwright 覆盖页面启动、交互和 console 无报错。

## 分层设计

桌球游戏要避免把所有逻辑塞进 React 组件。推荐按下面四层组织：

```text
Next.js App / HUD
  -> React 只负责布局、按钮、状态展示和可访问性
Canvas Runtime
  -> requestAnimationFrame、DPR 缩放、输入坐标映射、WebAudio 解锁
Billiards Rules
  -> 击球、碰撞、袋口、回合、犯规、重置
Engine Primitives
  -> World、InputState、Vec2、Rect、clamp、CanvasRenderer
```

React 层发送“开始、暂停、重置、指针拖拽、释放击球”这些意图；规则层根据当前输入和 `deltaTime` 推进状态；渲染层只读取快照并绘制。这样单元测试可以直接验证规则层，而不需要启动浏览器。

## 推荐文件组织

```text
apps/billiards
  app/
    layout.tsx                 # 页面元数据和 html/body
    page.tsx                   # 挂载客户端游戏组件
    globals.css                # 全屏布局、霓虹 HUD、触控和 focus 样式
  src/components/
    billiards-app.tsx          # React 控制层：Canvas、HUD、按钮、键盘/触控桥接
  src/game/
    audio.ts                   # WebAudio 合成击球/碰撞/进袋音效
    constants.ts               # 逻辑尺寸、球半径、袋口、摩擦、颜色
    geometry.ts                # 坐标缩放、球桌矩形、指针到逻辑空间映射
    input.ts                   # InputState/Pointer -> 瞄准和蓄力命令
    physics.ts                 # 圆形碰撞、库边反弹、摩擦和静止判定
    render.ts                  # 球桌、球、轨迹、幽灵球、粒子绘制
    rules.ts                   # 开局、击球、进袋、犯规、回合和胜负
    runtime.ts                 # requestAnimationFrame loop 和状态快照
    types.ts                   # Ball/GameState/Shot/Round 等类型
  test/
    physics.test.ts
    rules.test.ts
  e2e/
    billiards.spec.ts
  next.config.mjs
  package.json
  playwright.config.ts
  tsconfig.json
  vitest.config.ts
```

单一职责是本课的主要质量约束。非高度内聚的文件超过 500 行时，应优先按“规则、物理、渲染、输入、音频、UI”拆分，而不是继续追加分支。

## 桌球物理边界

本课不需要真实刚体引擎，但需要稳定、可测试的近似物理：

1. 每帧先用速度推进球的位置，再处理库边反弹。
2. 球-球碰撞使用圆心距离判断；碰撞后沿法线交换法向速度分量，并做轻微位置分离，避免球重叠卡住。
3. 摩擦使用指数或线性衰减均可，但必须有最小速度阈值，低于阈值后速度归零，保证回合能结束。
4. 袋口判断用圆心到袋口中心的距离，距离小于袋口半径时进袋。
5. 母球进袋要进入犯规/手中球状态；目标球进袋则从活动球列表移除或标记 `pocketed`。

关键注释应放在这些边界上：圆形碰撞分离、坐标缩放、静止阈值、浏览器音频解锁、犯规规则。不要给明显的变量赋值写注释。

## 输入与全屏 Canvas

桌球的输入重点是“指针坐标必须映射到逻辑球桌坐标”。Canvas CSS 尺寸、实际像素尺寸和游戏逻辑尺寸是三套坐标：

- CSS 尺寸：浏览器布局中的宽高。
- 设备像素尺寸：`canvas.width` / `canvas.height`，需要乘 `devicePixelRatio`。
- 逻辑尺寸：规则层使用的稳定球桌坐标。

推荐流程：

1. `ResizeObserver` 或窗口 resize 更新 Canvas backing store。
2. 渲染前根据可用 viewport 计算 letterbox 或 cover 缩放。
3. 指针事件通过 `getBoundingClientRect()` 转换到 Canvas CSS 坐标，再除以缩放比例得到逻辑坐标。
4. 拖拽方向从母球指向指针的反方向，拖拽距离映射为击球力度。
5. `Escape` 暂停，`R` 重置，`Space` 或释放指针击球；按钮必须有清晰 `aria-label`。

## 视觉与音效设计

建议使用暗黑 OLED + 霓虹球桌风格，保证游戏画面在全屏下有足够对比：

- 背景：深蓝/黑色径向渐变，球桌边缘使用青蓝或紫红外发光。
- 球：Canvas 渐变球面、编号文本、白色高光，母球单独突出。
- 瞄准：虚线轨迹、幽灵球、动态蓄力光环，移动端不遮挡母球。
- HUD：毛玻璃卡片展示回合、剩余球、力度、提示和状态。
- 可访问性：按钮高度/宽度不小于 44px，focus ring 明显；`prefers-reduced-motion` 下减少粒子和闪烁。
- 音效：优先用 WebAudio 合成击球、碰撞、进袋短音效，避免远端资源和自动播放失败影响测试。

## Vitest 单元测试清单

单元测试应直接覆盖规则层和物理层，不依赖 React：

- 开局有 1 颗母球和 15 颗目标球，目标球 rack 位置确定且不重叠。
- `Vec2`/`clamp` 等引擎 primitive 被规则层复用，而不是重复实现基础数学。
- 球-球碰撞会改变速度方向，并在碰撞后分离重叠。
- 库边碰撞会把球约束回球桌内，并反转对应速度分量。
- 摩擦会让球逐步减速，低于阈值后进入完全静止。
- 目标球进入袋口后标记 `pocketed`，不再参与碰撞。
- 母球进袋会进入犯规/手中球状态，并允许重置到开球区。
- 所有球静止后才允许下一杆，运动中不能重复击球。
- 重置会恢复开局 rack、分数、回合和提示。

示例命令：

```bash
pnpm --filter @game-engine-canvas/billiards test
pnpm --filter @game-engine-canvas/billiards lint
pnpm --filter @game-engine-canvas/billiards build
```

## Playwright 验证清单

Playwright 需要证明页面真的能在浏览器中运行，并且没有隐藏客户端错误：

- 打开 `/` 后能看到主标题“霓虹桌球”和可访问的全屏 Canvas。
- `body` 不出现滚动条，Canvas 覆盖 viewport 主游戏区域。
- “开始游戏”“重置球局”“暂停/继续”按钮可聚焦且触控目标不小于 44px。
- 鼠标或触控拖拽母球附近后释放，HUD 能显示击球/运动/等待下一杆状态。
- 桌面和移动视口都监听 `console.error` 与 `pageerror`，数量必须为 0。
- 移动视口下 HUD 和触控提示不遮挡主要击球区域，页面不产生横向滚动。

建议沿用 `apps/tank-battle` 的 e2e 结构，为桌球应用提供独立端口，例如：

```bash
pnpm --filter @game-engine-canvas/billiards e2e
```

`playwright.config.ts` 中的 webServer 可以使用：

```text
pnpm --filter @game-engine-canvas/billiards exec next dev --hostname 127.0.0.1 --port 3200
```

## Playwright 草案与选择器契约

如果 `apps/billiards` 尚未落地，可以先用以下草案作为实现契约。实现侧应提供稳定的可访问名称或 `data-testid`，避免 e2e 依赖易变文案和 Canvas 像素：

```ts
import { expect, test, type Page } from "@playwright/test";

function collectPageErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

test("starts billiards game without browser errors", async ({ page }) => {
  const errors = collectPageErrors(page);
  await page.goto("/");

  await expect(page.getByRole("main", { name: "霓虹桌球全屏游戏" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "霓虹桌球" })).toBeVisible();
  await expect(page.getByTestId("billiards-canvas")).toBeVisible();
  await expect(page.locator("body")).toHaveCSS("overflow", "hidden");

  await page.getByRole("button", { name: "开始游戏" }).click();
  await expect(page.getByTestId("billiards-status")).toContainText(/瞄准|等待|运动/);

  const canvas = page.getByTestId("billiards-canvas");
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Canvas bounding box is unavailable.");
  await page.mouse.move(box.x + box.width * 0.35, box.y + box.height * 0.5);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.5);
  await page.mouse.up();

  expect(errors).toEqual([]);
});
```

建议实现侧至少暴露这些稳定契约：

- `data-testid="billiards-canvas"`：主 Canvas。
- `data-testid="billiards-status"`：当前状态，如瞄准、运动、等待下一杆、暂停。
- `data-testid="billiards-power"`：蓄力值或进度条。
- 主容器使用 `role="main"` 和名称“霓虹桌球全屏游戏”。
- 主要按钮使用可访问名称：“开始游戏”“暂停游戏”“继续游戏”“重置球局”。

## QA 审查清单

合并前至少完成以下审查：

- 代码组织：规则、物理、渲染、输入、音频、React UI 分层明确；无无关大文件。
- 引擎复用：`World`/`InputState`/`Vec2`/`Rect`/`clamp` 的使用有实际价值，不只是形式化导入。
- 浏览器健壮性：Canvas resize、DPR、WebAudio 用户手势限制、组件卸载清理都已处理。
- 规则边界：母球进袋、目标球进袋、球仍在运动、重置和暂停不会互相污染状态。
- 可访问性：主要按钮有语义名称、focus 可见、移动端目标尺寸达标。
- 自动化：单元测试、lint、build、Playwright e2e 均通过；e2e 明确断言 console/pageerror 为空。

## 验收标准

本课完成时应满足：

- `apps/billiards` 可以独立运行，并在全屏 Canvas 中完成至少一局基础桌球流程。
- `pnpm --filter @game-engine-canvas/billiards test` 通过。
- `pnpm --filter @game-engine-canvas/billiards lint` 通过。
- `pnpm --filter @game-engine-canvas/billiards build` 通过。
- `pnpm --filter @game-engine-canvas/billiards e2e` 通过，且 `console.error` / `pageerror` 为 0。
- 文档、测试和实现提交使用规范中文 conventional commit，例如 `feat: 新增桌球运行时`、`test: 补充桌球规则测试`、`docs: 新增桌球课程`。

## 下一课预告

后续可以继续扩展：

- 更完整的 8-ball/9-ball 规则和犯规判定。
- AI 对手、击球建议线和训练模式。
- 回放系统，把每杆输入和状态快照记录为 JSON。
- 使用原创图片/音效素材增强菜单、球杆和进袋反馈，但核心玩法仍保持离线可运行。
