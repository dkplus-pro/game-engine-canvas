# Game Engine Canvas

一个用 TypeScript、Next.js 和 Canvas 搭建的 2D ECS 游戏引擎学习项目。仓库包含共享引擎包和多个可独立展示的课程应用。

## GitHub Pages

在线展示入口：

- [Game Engine Canvas 总览](https://dkplus-pro.github.io/game-engine-canvas/)
- [Playground 课程 Demo](https://dkplus-pro.github.io/game-engine-canvas/playground/)
- [Tank Battle](https://dkplus-pro.github.io/game-engine-canvas/tank-battle/)
- [Billiards](https://dkplus-pro.github.io/game-engine-canvas/billiards/)

## 本地开发

```sh
pnpm install
pnpm dev
```

常用检查：

```sh
pnpm build
pnpm test
pnpm lint
pnpm build:pages
```

## 新增 App

新增 `apps/*` 下的 Next.js 应用时，接入共享 GitHub Pages 配置即可自动进入静态发布流程。具体约定见 [docs/github-pages.md](docs/github-pages.md)。
