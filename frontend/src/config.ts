// Configuration for WebSocket connection
// Auto-detects if running on mobile or local

const getWebSocketUrl = (): string => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";

  // If served from same origin as backend (production build), use relative path
  if (hostname !== "localhost" && hostname !== "127.0.0.1") {
    // Use same origin (frontend and backend on same domain/port via tunnel)
    return `${protocol}//${hostname}${
      window.location.port ? `:${window.location.port}` : ""
    }`;
  }

  // Development: use localhost
  return "ws://localhost:8000";
};

export const WEBSOCKET_URL = getWebSocketUrl();

// Log the WebSocket URL for debugging
console.log(`WebSocket URL: ${WEBSOCKET_URL}`);
