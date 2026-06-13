# 第 2 课：ECS 核心

## 本课目标

实现游戏引擎的第一个核心模块：ECS。ECS 把对象拆成实体、组件和系统，让游戏逻辑更容易组合和扩展。

## 你将实现什么

- `World`：保存实体、组件和系统。
- `EntityId`：实体的数字 ID。
- `ComponentType`：组件类型标识，可以是字符串、symbol 或类构造器。
- `System`：每帧执行的逻辑单元。
- `query`：按组件组合查找实体。

## 核心概念

Entity 是一个 ID，本身不保存逻辑。

Component 是数据，比如：

```ts
interface Position {
  x: number;
  y: number;
}
```

System 是逻辑，比如移动系统：

```ts
const movementSystem = {
  update: ({ world, deltaTime }) => {
    for (const result of world.query("position", "velocity")) {
      const position = result.get("position");
      const velocity = result.get("velocity");

      position.x += velocity.x * deltaTime;
      position.y += velocity.y * deltaTime;
    }
  }
};
```

World 负责把这些东西组织起来。

## 模块设计

第一版 ECS 使用直接、易懂的数据结构：

```text
World
  entities: Set<EntityId>
  components: Map<ComponentType, Map<EntityId, Component>>
  systems: SystemEntry[]
```

组件按类型分组存储。查询时遍历实体，检查它是否拥有所有目标组件。

这不是性能最高的存储方式，但它很适合第一阶段：

- API 清晰。
- 行为容易测试。
- 适合教学。
- 后续可以单独做 sparse set、query cache 或 archetype 优化。

## 关键 API

创建实体：

```ts
const world = new World();
const player = world.createEntity();
```

添加组件：

```ts
world.addComponent(player, "position", { x: 80, y: 80 });
world.addComponent(player, "velocity", { x: 60, y: 20 });
```

查询实体：

```ts
for (const result of world.query("position", "velocity")) {
  const position = result.get("position");
  const velocity = result.get("velocity");
}
```

添加系统：

```ts
world.addSystem(movementSystem);
world.update(1 / 60);
```

## Demo 说明

`apps/demo-01-ecs-basic` 现在会：

- 创建一个 `World`。
- 创建 3 个实体。
- 给实体挂载 `name`、`position`、`velocity` 组件。
- 注册一个 `MovementSystem`。
- 执行一次 `world.update(1)`。
- 在页面中展示 query 后的实体位置。

这证明 demo 不是静态页面，而是在读取引擎包里的真实 ECS 数据。

## 验证方式

在仓库根目录执行：

```bash
pnpm build
pnpm test
```

单元测试覆盖：

- 实体创建和销毁。
- 组件添加、读取和查询。
- 系统优先级。
- 系统修改组件数据。

启动 demo：

```bash
pnpm --filter @game-engine-canvas/demo-01-ecs-basic dev
```

## 下一课预告

下一课实现 Game Loop：

- `Engine.start()`
- `Engine.stop()`
- `Engine.step()`
- `deltaTime`
- 固定更新和渲染更新的基础分离
