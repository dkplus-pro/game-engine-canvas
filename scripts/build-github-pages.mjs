import { spawnSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const appsRoot = path.join(repoRoot, "apps");
const pagesDist = path.join(repoRoot, "pages-dist");
const repositoryName =
  process.env.GITHUB_PAGES_REPOSITORY ??
  process.env.GITHUB_REPOSITORY?.split("/").at(-1) ??
  path.basename(repoRoot);

function readPackageJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function hasNextConfig(appPath) {
  return ["next.config.js", "next.config.mjs", "next.config.ts"].some((fileName) =>
    existsSync(path.join(appPath, fileName))
  );
}

function discoverApps() {
  return readdirSync(appsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const appPath = path.join(appsRoot, entry.name);
      const packageJsonPath = path.join(appPath, "package.json");

      if (!existsSync(packageJsonPath) || !hasNextConfig(appPath)) {
        return undefined;
      }

      const packageJson = readPackageJson(packageJsonPath);
      return {
        name: entry.name,
        packageName: packageJson.name ?? entry.name,
        description: packageJson.description ?? ""
      };
    })
    .filter(Boolean)
    .sort((left, right) => left.name.localeCompare(right.name));
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function writeLandingPage(apps) {
  const appLinks = apps
    .map((app) => {
      const label = escapeHtml(app.name);
      const description = app.description
        ? `<p>${escapeHtml(app.description)}</p>`
        : `<p>${escapeHtml(app.packageName)}</p>`;

      return `<a class="app-card" href="./${encodeURIComponent(app.name)}/"><strong>${label}</strong>${description}</a>`;
    })
    .join("\n        ");

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Game Engine Canvas</title>
    <style>
      :root {
        color-scheme: dark;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background: #101214;
        color: #f4f5f6;
      }

      body {
        margin: 0;
        min-height: 100vh;
      }

      main {
        width: min(960px, calc(100% - 32px));
        margin: 0 auto;
        padding: 56px 0;
      }

      h1 {
        margin: 0 0 12px;
        font-size: clamp(2rem, 5vw, 4rem);
        line-height: 1;
      }

      .intro {
        max-width: 680px;
        margin: 0 0 32px;
        color: #bac2cc;
        font-size: 1.05rem;
        line-height: 1.7;
      }

      .app-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 16px;
      }

      .app-card {
        display: block;
        min-height: 116px;
        padding: 18px;
        border: 1px solid #303740;
        border-radius: 8px;
        background: #181c20;
        color: inherit;
        text-decoration: none;
      }

      .app-card:hover {
        border-color: #6aa7ff;
        background: #20262c;
      }

      .app-card strong {
        display: block;
        margin-bottom: 10px;
        font-size: 1.1rem;
      }

      .app-card p {
        margin: 0;
        color: #aab4bf;
        line-height: 1.5;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>Game Engine Canvas</h1>
      <p class="intro">Static builds for every app in this repository. Each app is deployed as its own GitHub Pages subpath.</p>
      <section class="app-grid" aria-label="Apps">
        ${appLinks}
      </section>
    </main>
  </body>
</html>
`;

  writeFileSync(path.join(pagesDist, "index.html"), html);
  writeFileSync(path.join(pagesDist, "404.html"), html);
}

const apps = discoverApps();

if (apps.length === 0) {
  throw new Error("No Next.js apps found under apps/*.");
}

rmSync(pagesDist, { force: true, recursive: true });

const build = spawnSync("pnpm", ["exec", "turbo", "run", "build", "--force"], {
  cwd: repoRoot,
  env: {
    ...process.env,
    GITHUB_PAGES: "true",
    GITHUB_PAGES_REPOSITORY: repositoryName
  },
  stdio: "inherit"
});

if (build.status !== 0) {
  process.exit(build.status ?? 1);
}

mkdirSync(pagesDist, { recursive: true });
writeFileSync(path.join(pagesDist, ".nojekyll"), "");

for (const app of apps) {
  const outDir = path.join(appsRoot, app.name, "out");
  const targetDir = path.join(pagesDist, app.name);

  if (!existsSync(outDir)) {
    throw new Error(
      `Missing static export for ${app.name}. Make sure its next.config uses withGithubPages("${app.name}", ...).`
    );
  }

  rmSync(targetDir, { force: true, recursive: true });
  mkdirSync(targetDir, { recursive: true });
  cpSync(outDir, targetDir, { recursive: true });
}

writeLandingPage(apps);

console.log(`Prepared GitHub Pages artifact at ${path.relative(repoRoot, pagesDist)}`);
