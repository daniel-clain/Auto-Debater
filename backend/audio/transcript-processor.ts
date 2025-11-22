/**
 * Transcript Processor
 * Processes transcribed text and triggers analysis
 */

import { WebSocket } from "ws";
import { TranscriptMessage } from "../../shared/types";
import { ArgumentAnalyzer } from "../ai/analyzer";
import { WebSocketManager } from "../core/websocket/manager";
import { IntelligenceCoordinator } from "../intelligence/coordinator";

export class TranscriptProcessor {
  private analyzer: ArgumentAnalyzer;
  private intelligence: IntelligenceCoordinator;

  constructor() {
    this.analyzer = new ArgumentAnalyzer();
    this.intelligence = new IntelligenceCoordinator();
  }

  async handleTranscript(
    message: TranscriptMessage,
    ws: WebSocket,
    manager: WebSocketManager
  ): Promise<void> {
    const { sessionId, payload } = message;

    console.log(
      `📝 Processing transcript: "${payload.text}" (${payload.speaker})`
    );

    // Analyze argument
    const analysis = await this.analyzer.analyze(
      payload.text,
      payload.speaker,
      sessionId
    );

    // Update intelligence model
    const updates = await this.intelligence.processArgument(
      payload.text,
      payload.speaker,
      analysis,
      sessionId
    );

    // Send micro-updates to frontend
    if (updates.microUpdate) {
      manager.send(ws, {
        type: "micro_update",
        timestamp: Date.now(),
        sessionId,
        payload: updates.microUpdate,
      });
    }

    // Send rebuttals if available
    if (updates.rebuttals) {
      manager.send(ws, {
        type: "rebuttals_update",
        timestamp: Date.now(),
        sessionId,
        payload: {
          rebuttals: updates.rebuttals,
          style: updates.style || "kind",
        },
      });
    }

    // Send summary update
    if (updates.summary) {
      manager.send(ws, {
        type: "debate_summary",
        timestamp: Date.now(),
        sessionId,
        payload: updates.summary,
      });
    }

    // Check boundaries
    if (updates.boundaryWarning) {
      manager.send(ws, {
        type: "boundary_warning",
        timestamp: Date.now(),
        sessionId,
        payload: updates.boundaryWarning,
      });
    }
  }
}
