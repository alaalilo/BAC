import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: (() => {
    const repository = process.env.GITHUB_REPOSITORY?.split("/")[1];
    if (!process.env.GITHUB_ACTIONS || !repository || repository.endsWith(".github.io")) return "/";
    return `/${repository}/`;
  })(),
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("recharts") || id.includes("d3-")) return "charts";
            if (id.includes("framer-motion")) return "motion";
            if (id.includes("lucide-react")) return "icons";
            if (id.includes("react-dom") || id.includes("/react/")) return "react-vendor";
          }
        },
      },
    },
  },
});
