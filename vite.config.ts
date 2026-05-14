
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import type { UserConfig } from "vite";

const rawAllowedHosts = process.env.VITE_ALLOWED_HOSTS?.trim();
const resolvedAllowedHosts: UserConfig["server"]["allowedHosts"] =
  rawAllowedHosts === "true" || rawAllowedHosts === "*"
    ? true
    : (rawAllowedHosts || "prime.santos-games.com,localhost,127.0.0.1")
        .split(",")
        .map((host) => host.trim())
        .filter(Boolean);

const config: UserConfig = {
  tanstackStart: {
    server: { entry: "server" },
  },
  server: {
    allowedHosts: resolvedAllowedHosts,
  },
  preview: {
    allowedHosts: resolvedAllowedHosts,
  },
};

export default defineConfig(config);
