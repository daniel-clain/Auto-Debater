/**
 * Audio Stream Handler
 * Receives audio chunks from frontend and processes them
 */

import { WebSocket } from "ws";
import { AudioChunkMessage, WebSocketMessage } from "../../shared/types";
import { WebSocketManager } from "../core/websocket/manager";
import { SpeechRecognitionService } from "./speech-recognition";

export class AudioStreamHandler {
  private speechRecognition: SpeechRecognitionService;
  private audioBuffers: Map<string, Buffer[]> = new Map(); // sessionId -> chunks

  constructor() {
    this.speechRecognition = new SpeechRecognitionService();
  }

  async handleAudioChunk(
    message: AudioChunkMessage,
    ws: WebSocket,
    manager: WebSocketManager
  ): Promise<void> {
    const { sessionId, payload } = message;

    // Accumulate audio chunks
    if (!this.audioBuffers.has(sessionId)) {
      this.audioBuffers.set(sessionId, []);
    }

    const buffer = Buffer.from(payload.audioData);
    this.audioBuffers.get(sessionId)!.push(buffer);

    // If final chunk, process complete audio
    if (payload.isFinal) {
      const audioData = Buffer.concat(this.audioBuffers.get(sessionId)!);
      this.audioBuffers.delete(sessionId);

      // Convert audio to text
      const transcript = await this.speechRecognition.processAudio(audioData);

      if (transcript) {
        // Send transcript for processing
        const transcriptMessage: WebSocketMessage = {
          type: "transcript",
          timestamp: Date.now(),
          sessionId,
          payload: {
            text: transcript,
            speaker: "opponent", // Will be determined by speaker detection
          },
        };

        manager.send(ws, transcriptMessage);
      }
    }
  }
}
