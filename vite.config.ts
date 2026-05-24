import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  if (mode === "production" && !env.VITE_API_URL?.trim()) {
    throw new Error(
      "VITE_API_URL is required for production builds."
    );
  }

  return {
    plugins: [
      tsconfigPaths(),
      tailwindcss(),
      TanStackRouterVite(),
      react(),
    ],
    server: {
      allowedHosts: (env.VITE_ALLOWED_HOSTS || "localhost,127.0.0.1")
        .split(",")
        .map((h) => h.trim())
        .filter(Boolean),
    },
  };
});
