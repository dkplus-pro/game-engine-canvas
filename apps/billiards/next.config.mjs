import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));

const nextConfig = {
  outputFileTracingRoot: repoRoot,
  transpilePackages: ["@game-engine-canvas/engine"]
};

export default nextConfig;
