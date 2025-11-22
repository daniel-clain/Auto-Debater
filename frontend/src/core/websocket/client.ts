/**
 * WebSocket Client
 * Single communication channel for all frontend/backend communication
 */

import { MessageType, WebSocketMessage } from "../../../shared/types";

type MessageHandler = (message: WebSocketMessage) => void;

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private handlers: Map<MessageType, MessageHandler[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  /**
   * Single send function - used by all frontend modules
   */
  send(message: WebSocketMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
      console.log(`📤 Sent [${message.type}] to backend`);
    } else {
      console.error("❌ WebSocket not connected");
    }
  }

  /**
   * Register handler for specific message type
   */
  on(type: MessageType, handler: MessageHandler): void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, []);
    }
    this.handlers.get(type)!.push(handler);
  }

  /**
   * Connect to backend
   */
  connect(url: string): void {
    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log("✅ WebSocket connected");
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log(`📥 Received [${message.type}] from backend`);

          // Route to handlers
          const handlers = this.handlers.get(message.type) || [];
          handlers.forEach((handler) => handler(message));
        } catch (error) {
          console.error("❌ Error parsing message:", error);
        }
      };

      this.ws.onerror = (error) => {
        console.error("❌ WebSocket error:", error);
      };

      this.ws.onclose = () => {
        console.log("🔌 WebSocket closed");
        this.attemptReconnect(url);
      };
    } catch (error) {
      console.error("❌ Failed to connect:", error);
    }
  }

  private attemptReconnect(url: string): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `🔄 Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      );
      setTimeout(() => this.connect(url), 1000 * this.reconnectAttempts);
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
