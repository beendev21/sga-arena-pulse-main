import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, "dist");
const script = readFileSync(resolve(distDir, "server/index.js"), "utf-8");
const port = Number(process.env.PORT) || 3000;

const mf = new Miniflare({
  modules: true,
  script,
  compatibilityDate: "2025-09-24",
  compatibilityFlags: ["nodejs_compat"],
  host: "0.0.0.0",
  port,
  assets: { path: resolve(distDir, "client") },
});

const url = await mf.ready;
console.log(`Listening on ${url}`);

process.on("SIGTERM", async () => { await mf.dispose(); process.exit(0); });
process.on("SIGINT", async () => { await mf.dispose(); process.exit(0); });
