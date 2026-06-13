# 第 9 课：Collision

## 本课目标

实现基础 AABB 碰撞检测，用于角色、墙体、道具和简单物理交互。

## 你将实现什么

- `AabbCollider`
- `getAabb`
- `CollisionSystem`
- `CollisionPair`

## 核心概念

Collider 描述局部尺寸，Transform 描述世界位置。两者组合得到世界坐标矩形：

```ts
const box = getAabb(transform, collider);
```

`CollisionSystem` 查询所有带 `Transform2D` 和 `AabbCollider` 的实体，两两检测矩形相交。

## Demo 说明

`/lessons/08-collision` 创建 3 个实体，其中 Player 和 Crate 相交，Wall 不相交。页面高亮参与碰撞的 AABB。

## 验证方式

```bash
pnpm build
pnpm test
```

## 下一课预告

下一课实现 Scene 管理。
