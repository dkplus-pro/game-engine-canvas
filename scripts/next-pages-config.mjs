function normalizePath(path) {
  if (!path || path === "/") {
    return "";
  }

  const withLeadingSlash = path.startsWith("/") ? path : `/${path}`;
  return withLeadingSlash.replace(/\/+$/, "");
}

function getRepositoryName() {
  if (process.env.GITHUB_PAGES_REPOSITORY) {
    return process.env.GITHUB_PAGES_REPOSITORY;
  }

  const githubRepository = process.env.GITHUB_REPOSITORY;
  if (githubRepository?.includes("/")) {
    return githubRepository.split("/").at(-1) ?? "";
  }

  return githubRepository ?? "";
}

function getDefaultSiteBasePath() {
  const repositoryName = getRepositoryName();

  if (!repositoryName || repositoryName.endsWith(".github.io")) {
    return "";
  }

  return `/${repositoryName}`;
}

export function getGithubPagesAppBasePath(appSlug) {
  const siteBasePath = normalizePath(
    process.env.GITHUB_PAGES_BASE_PATH ?? getDefaultSiteBasePath()
  );

  return normalizePath(`${siteBasePath}/${appSlug}`);
}

export function withGithubPages(appSlug, nextConfig = {}) {
  const isGithubPagesBuild = process.env.GITHUB_PAGES === "true";
  const basePath = isGithubPagesBuild ? getGithubPagesAppBasePath(appSlug) : "";
  const pagesConfig = isGithubPagesBuild
    ? {
        output: "export",
        trailingSlash: true,
        ...(basePath
          ? {
              assetPrefix: basePath,
              basePath
            }
          : {}),
        images: {
          ...nextConfig.images,
          unoptimized: true
        }
      }
    : {};

  return {
    ...nextConfig,
    ...pagesConfig,
    env: {
      ...nextConfig.env,
      NEXT_PUBLIC_BASE_PATH: basePath
    }
  };
}
