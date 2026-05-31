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
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // React core — muda raramente, cache longo
            "vendor-react": ["react", "react-dom"],
            // Roteamento e data fetching
            "vendor-tanstack": [
              "@tanstack/react-router",
              "@tanstack/react-query",
            ],
            // Animações — separadas pra não bloquear o parse inicial
            "vendor-motion": ["framer-motion", "gsap", "@gsap/react"],
            // UI primitives Radix
            "vendor-ui": [
              "@radix-ui/react-dialog",
              "@radix-ui/react-dropdown-menu",
              "@radix-ui/react-select",
              "@radix-ui/react-tabs",
              "@radix-ui/react-tooltip",
              "@radix-ui/react-popover",
              "@radix-ui/react-accordion",
            ],
          },
        },
      },
      // avisa quando chunk > 400KB (padrão é 500KB)
      chunkSizeWarningLimit: 400,
    },
  };
});
