import { Miniflare } from "miniflare";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, "dist");
const port = Number(process.env.PORT) || 3000;

const mf = new Miniflare({
  modules: true,
  scriptPath: resolve(distDir, "server/index.js"),
  compatibilityDate: "2025-09-24",
  compatibilityFlags: ["nodejs_compat"],
  host: "0.0.0.0",
  port,
  assetsPath: resolve(distDir, "client"),
});

const url = await mf.ready;
console.log(`Listening on ${url}`);

process.on("SIGTERM", async () => { await mf.dispose(); process.exit(0); });
process.on("SIGINT", async () => { await mf.dispose(); process.exit(0); });
