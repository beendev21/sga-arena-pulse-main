
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const previewAllowedHosts = (
  process.env.VITE_ALLOWED_HOSTS ?? "prime.santos-games.com,localhost,127.0.0.1"
)
  .split(",")
  .map((host) => host.trim())
  .filter(Boolean);

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  preview: {
    allowedHosts: previewAllowedHosts,
  },
});
