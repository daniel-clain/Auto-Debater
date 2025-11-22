/**
 * WebSocket Manager
 * Single communication channel for all frontend/backend communication
 */

import { WebSocket, WebSocketServer } from "ws";
import { WebSocketMessage } from "../../../shared/types";
import { MessageRouter } from "./router";

export class WebSocketManager {
  private wss: WebSocketServer;
  private router: MessageRouter;
  private clients: Map<WebSocket, string> = new Map(); // ws -> sessionId

  constructor(wss: WebSocketServer) {
    this.wss = wss;
    this.router = new MessageRouter();
    this.setupConnectionHandlers();
  }

  /**
   * Single send function - used by all backend modules
   */
  send(ws: WebSocket, message: WebSocketMessage): void {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify(message));
        console.log(
          `📤 Sent [${message.type}] to session ${message.sessionId}`
        );
      } catch (error) {
        console.error(`❌ Error sending message:`, error);
      }
    }
  }

  /**
   * Broadcast to all clients in a session
   */
  broadcastToSession(
    sessionId: string,
    message: Omit<WebSocketMessage, "sessionId">
  ): void {
    const fullMessage: WebSocketMessage = {
      ...message,
      sessionId,
    } as WebSocketMessage;

    this.clients.forEach((clientSessionId, ws) => {
      if (clientSessionId === sessionId) {
        this.send(ws, fullMessage);
      }
    });
  }

  private setupConnectionHandlers(): void {
    this.wss.on("connection", (ws: WebSocket) => {
      console.log("🔌 New WebSocket connection");

      ws.on("message", async (data: Buffer) => {
        try {
          const message: WebSocketMessage = JSON.parse(data.toString());
          console.log(
            `📥 Received [${message.type}] from session ${message.sessionId}`
          );

          // Track session
          this.clients.set(ws, message.sessionId);

          // Route to appropriate handler
          await this.router.handle(message, ws, this);
        } catch (error) {
          console.error("❌ Error processing message:", error);
          this.send(ws, {
            type: "error",
            timestamp: Date.now(),
            sessionId: "unknown",
            payload: {
              error: error instanceof Error ? error.message : "Unknown error",
            },
          });
        }
      });

      ws.on("close", () => {
        console.log("🔌 WebSocket connection closed");
        this.clients.delete(ws);
      });

      ws.on("error", (error) => {
        console.error("❌ WebSocket error:", error);
      });
    });
  }
}
