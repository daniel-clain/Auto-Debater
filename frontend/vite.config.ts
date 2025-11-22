import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  // Build settings for production (served from backend)
  build: {
    outDir: "dist",
    assetsDir: "assets",
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      "/ws": {
        target: "ws://localhost:8000",
        ws: true,
      },
    },
  },
  resolve: {
    alias: {
      "regenerator-runtime/runtime": "regenerator-runtime/runtime",
    },
  },
});
