import { withGithubPages } from "../../scripts/next-pages-config.mjs";

const nextConfig = {
  transpilePackages: ["@game-engine-canvas/engine"]
};

export default withGithubPages("tank-battle", nextConfig);
