/**
 * Message Router
 * Routes incoming messages to appropriate handlers
 */

import { WebSocket } from "ws";
import { WebSocketMessage } from "../../../shared/types";
import { AudioStreamHandler } from "../../audio/stream-handler";
import { TranscriptProcessor } from "../../audio/transcript-processor";
import { WebSocketManager } from "./manager";

export class MessageRouter {
  private audioHandler: AudioStreamHandler;
  private transcriptProcessor: TranscriptProcessor;

  constructor() {
    this.audioHandler = new AudioStreamHandler();
    this.transcriptProcessor = new TranscriptProcessor();
  }

  async handle(
    message: WebSocketMessage,
    ws: WebSocket,
    manager: WebSocketManager
  ): Promise<void> {
    switch (message.type) {
      case "audio_chunk":
        await this.audioHandler.handleAudioChunk(message, ws, manager);
        break;

      case "transcript":
        await this.transcriptProcessor.handleTranscript(message, ws, manager);
        break;

      default:
        console.warn(`⚠️  Unhandled message type: ${message.type}`);
        manager.send(ws, {
          type: "error",
          timestamp: Date.now(),
          sessionId: message.sessionId,
          payload: {
            error: `Unhandled message type: ${message.type}`,
          },
        });
    }
  }
}
