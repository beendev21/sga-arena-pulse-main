
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { loadEnv, type UserConfig } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const rawAllowedHosts = env.VITE_ALLOWED_HOSTS?.trim();
  const resolvedAllowedHosts: UserConfig["server"]["allowedHosts"] =
    rawAllowedHosts === "true" || rawAllowedHosts === "*"
      ? true
      : (rawAllowedHosts || "prime.santos-games.com,localhost,127.0.0.1")
          .split(",")
          .map((host) => host.trim())
          .filter(Boolean);

  if (mode === "production" && !env.VITE_API_URL?.trim()) {
    throw new Error(
      "VITE_API_URL is required for production builds. Ensure the build environment provides it before running vite build."
    );
  }

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

  return config;
});
