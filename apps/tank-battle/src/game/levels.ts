import type { TankLevelConfig } from "./types";

export const levelConfigs: TankLevelConfig[] = [
  {
    id: 1,
    name: "城市外墙",
    seed: 199001,
    enemyBudget: 12,
    maxActiveEnemies: 3,
    brickRate: 0.42,
    steelRate: 0.05,
    waterRate: 0.06,
    grassRate: 0.08,
    powerUpRate: 0.2
  },
  {
    id: 2,
    name: "河道伏击",
    seed: 199002,
    enemyBudget: 16,
    maxActiveEnemies: 4,
    brickRate: 0.38,
    steelRate: 0.08,
    waterRate: 0.14,
    grassRate: 0.1,
    powerUpRate: 0.18
  },
  {
    id: 3,
    name: "钢铁阵地",
    seed: 199003,
    enemyBudget: 20,
    maxActiveEnemies: 4,
    brickRate: 0.34,
    steelRate: 0.13,
    waterRate: 0.08,
    grassRate: 0.12,
    powerUpRate: 0.16
  },
  {
    id: 4,
    name: "终局防线",
    seed: 199004,
    enemyBudget: 24,
    maxActiveEnemies: 5,
    brickRate: 0.32,
    steelRate: 0.16,
    waterRate: 0.1,
    grassRate: 0.14,
    powerUpRate: 0.14
  }
];

export function getLevelConfig(levelId: number): TankLevelConfig {
  return levelConfigs.find((level) => level.id === levelId) ?? levelConfigs[0]!;
}
