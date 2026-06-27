import { fileURLToPath } from "node:url";
import { withGithubPages } from "../../scripts/next-pages-config.mjs";

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));

const nextConfig = {
  outputFileTracingRoot: repoRoot,
  transpilePackages: ["@game-engine-canvas/engine"]
};

export default withGithubPages("billiards", nextConfig);
