# GitHub Pages 发布约定

这个仓库用一个 GitHub Pages 站点承载所有 `apps/*` 下的 Next.js 应用。发布脚本会自动扫描带有 `package.json` 和 `next.config.*` 的 app，静态导出后聚合到 `pages-dist/`。

默认发布路径：

- `/game-engine-canvas/playground/`
- `/game-engine-canvas/tank-battle/`
- `/game-engine-canvas/billiards/`

## 新增 app checklist

1. 在 `apps/<app-name>` 下创建 Next.js app。
2. 在 `next.config.mjs` 中接入共享配置：

   ```js
   import { withGithubPages } from "../../scripts/next-pages-config.mjs";

   const nextConfig = {
     transpilePackages: ["@game-engine-canvas/engine"]
   };

   export default withGithubPages("<app-name>", nextConfig);
   ```

3. 只使用 GitHub Pages 支持的静态能力：客户端交互、静态页面、`generateStaticParams()` 枚举的动态页面。
4. 不依赖 SSR、API routes、server actions 或 Next image optimizer。
5. 如果代码里要引用 `public` 资源，不要写死 `/assets/...`。使用 `process.env.NEXT_PUBLIC_BASE_PATH` 拼出资源路径。
6. 本地运行 `pnpm build:pages`，确认 `pages-dist/<app-name>/` 已生成。

## 发布

推送到 `main` 后，`.github/workflows/pages.yml` 会运行：

```sh
pnpm install --frozen-lockfile
pnpm build:pages
```

然后把 `pages-dist` 作为 GitHub Pages artifact 部署。

如果仓库改名或使用自定义域，可以在 workflow 环境中设置 `GITHUB_PAGES_BASE_PATH` 覆盖默认站点前缀。
