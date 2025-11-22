import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Configuration for mobile access on local network
// Run with: npm run dev -- --config vite.config.mobile.ts

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0", // Allow access from network
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
});
