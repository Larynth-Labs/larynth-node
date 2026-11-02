import { build } from "esbuild";
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const dist = join(root, "dist");
rmSync(dist, { recursive: true, force: true });

await build({
  entryPoints: { index: join(root, "src/index.ts"), webhooks: join(root, "src/webhooks.ts") },
  outdir: dist,
  bundle: true,
  splitting: true,
  format: "esm",
  platform: "node",
  target: "node24",
  sourcemap: false,
});

const tsc = join(root, "node_modules/typescript/bin/tsc");
execFileSync(process.execPath, [tsc, "-p", join(root, "tsconfig.build.json")], { stdio: "inherit" });

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

function fix(file) {
  const base = dirname(file);
  const src = readFileSync(file, "utf8").replace(/(from\s+|import\()(["'])(\.{1,2}\/[^"']*)\2/g, (m, pre, q, spec) => {
    if (/\.(js|json)$/.test(spec)) return m;
    const target = resolve(base, spec);
    if (existsSync(`${target}.d.ts`)) return `${pre}${q}${spec}.js${q}`;
    if (existsSync(join(target, "index.d.ts"))) return `${pre}${q}${spec}/index.js${q}`;
    return m;
  });
  writeFileSync(file, src);
}

for (const f of walk(dist).filter((f) => f.endsWith(".d.ts"))) fix(f);
