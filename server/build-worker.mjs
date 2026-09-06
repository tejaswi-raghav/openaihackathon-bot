import { cp, mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { join, relative, extname } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const dist = join(root, "dist");
const source = join(root, "server", "worker.mjs");
const output = join(dist, "server", "index.js");
const contentTypes = {
  ".css": "text/css; charset=utf-8", ".gif": "image/gif", ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8",
  ".png": "image/png", ".svg": "image/svg+xml", ".webp": "image/webp", ".webmanifest": "application/manifest+json",
};

async function collect(directory, files = {}) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = join(directory, entry.name);
    if (entry.isDirectory()) await collect(absolute, files);
    else if (entry.isFile()) {
      const path = `/${relative(dist, absolute).replaceAll("\\\\", "/")}`;
      files[path] = { type: contentTypes[extname(entry.name)] || "application/octet-stream", body: (await readFile(absolute)).toString("base64") };
    }
  }
  return files;
}

await mkdir(join(dist, "server"), { recursive: true });
const assets = await collect(dist);
delete assets["/server/index.js"];
const worker = await readFile(source, "utf8");
const bundled = worker.replace("const SITE_ASSETS = {};", `const SITE_ASSETS = ${JSON.stringify(assets)};`);
await writeFile(output, bundled);
