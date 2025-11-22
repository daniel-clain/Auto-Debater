/**
 * Auto-Debater Backend - Entry Point
 *
 * System Architecture:
 *
 * ┌─────────────────────────────────────────────────────────────┐
 * │                    WebSocket Manager                         │
 * │              (Single Communication Channel)                  │
 * └──────────────────────┬──────────────────────────────────────┘
 *                         │
 *         ┌───────────────┴───────────────┐
 *         │                               │
 *    ┌────▼────┐                    ┌────▼────┐
 *    │  Audio  │                    │   AI    │
 *    │ Stream  │                    │ Analysis│
 *    └────┬────┘                    └────┬────┘
 *         │                               │
 *    ┌────▼───────────────────────────────▼────┐
 *    │      Intelligence & Response Layer      │
 *    │  (Argument Model, Rebuttals, Strategy)  │
 *    └────┬────────────────────────────────────┘
 *         │
 *    ┌────▼────┐
 *    │ Profile │
 *    │ Manager │
 *    └─────────┘
 */

import { existsSync, readFileSync } from "fs";
import { createServer } from "http";
import { dirname, extname, join } from "path";
import { fileURLToPath } from "url";
import { WebSocketServer } from "ws";
import { WebSocketManager } from "./core/websocket/manager";
import { config } from "./services/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = config.port || 8000;

// Frontend build path
const frontendBuildPath = join(__dirname, "..", "frontend", "dist");
const indexHtmlPath = join(frontendBuildPath, "index.html");

// Create HTTP server
const server = createServer((req, res) => {
  if (!req.url) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  // Don't serve API routes
  if (req.url.startsWith("/api") || req.url.startsWith("/ws")) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  // Serve static files
  let filePath = join(
    frontendBuildPath,
    req.url === "/" ? "index.html" : req.url
  );

  // Security: prevent directory traversal
  if (!filePath.startsWith(frontendBuildPath)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  // If no extension, assume it's a route - serve index.html (SPA routing)
  if (!extname(filePath) && !existsSync(filePath)) {
    filePath = indexHtmlPath;
  }

  if (existsSync(filePath)) {
    const content = readFileSync(filePath);
    const ext = extname(filePath).toLowerCase();

    const contentType: Record<string, string> = {
      ".html": "text/html",
      ".js": "application/javascript",
      ".css": "text/css",
      ".json": "application/json",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".svg": "image/svg+xml",
    };

    res.writeHead(200, {
      "Content-Type": contentType[ext] || "application/octet-stream",
    });
    res.end(content);
  } else {
    // Fallback to index.html for SPA routing
    if (existsSync(indexHtmlPath)) {
      const content = readFileSync(indexHtmlPath);
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(content);
    } else {
      res.writeHead(404);
      res.end("Not found");
    }
  }
});

// Create WebSocket server
const wss = new WebSocketServer({ server });

// Initialize WebSocket Manager (single communication channel)
const wsManager = new WebSocketManager(wss);

console.log("\n" + "=".repeat(60));
console.log("Auto-Debater Backend");
console.log("=".repeat(60));
console.log(`\nSystem Architecture:`);
console.log(`  📡 WebSocket Manager: Single communication channel`);
console.log(`  🎤 Audio Processing: Real-time speech recognition`);
console.log(`  🤖 AI Analysis: Multi-agent consensus system`);
console.log(`  🧠 Intelligence: Argument modeling & rebuttal generation`);
console.log(`  👤 Profile Management: Rival tracking & persona building`);

if (existsSync(frontendBuildPath)) {
  console.log(`\n✅ Frontend build found at: ${frontendBuildPath}`);
} else {
  console.log(
    `\n⚠️  Frontend build not found. Run 'npm run build' in frontend directory`
  );
}

console.log(`\n🚀 Server starting on port ${PORT}...\n`);

server.listen(PORT, () => {
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
  console.log(`✅ WebSocket ready for connections\n`);
});
