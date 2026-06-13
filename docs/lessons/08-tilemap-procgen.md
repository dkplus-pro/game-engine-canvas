# 第 8 课：TileMap 与地图生成

## 本课目标

实现 2D 网格地图结构，并加入两类常用地图生成算法：房间地牢和洞穴。

## 你将实现什么

- `TileMap`
- `generateDungeon`
- `generateCave`
- seeded random

## 核心概念

TileMap 是固定宽高的二维网格。每个格子保存数字：

- `0` 表示地面
- `1` 表示墙

```ts
const map = new TileMap(32, 18, 1);
map.set(10, 8, 0);
```

地牢生成使用随机房间和走廊连接。洞穴生成使用随机填充和元胞自动机平滑。

## Demo 说明

`/lessons/07-tilemap-procgen` 同时展示：

- Dungeon：随机房间 + 走廊。
- Cave：元胞自动机洞穴。

两者都使用确定性 seed，保证课程页面每次结果一致。

## 验证方式

```bash
pnpm build
pnpm test
```

## 下一课预告

下一课实现 AABB 碰撞系统。
