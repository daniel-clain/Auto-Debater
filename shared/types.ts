/**
 * Shared TypeScript Types
 * Used by both frontend and backend for type-safe communication
 */

// ============================================================================
// WebSocket Message Types
// ============================================================================

export type MessageType =
  | "audio_chunk"
  | "audio_complete"
  | "transcript"
  | "argument_analysis"
  | "rebuttals_update"
  | "debate_summary"
  | "micro_update"
  | "boundary_warning"
  | "error";

// ============================================================================
// Base Message Structure
// ============================================================================

export interface BaseMessage {
  type: MessageType;
  timestamp: number;
  sessionId: string;
}

// ============================================================================
// Frontend → Backend Messages
// ============================================================================

export interface AudioChunkMessage extends BaseMessage {
  type: "audio_chunk";
  payload: {
    audioData: ArrayBuffer;
    chunkIndex: number;
    isFinal: boolean;
  };
}

export interface TranscriptMessage extends BaseMessage {
  type: "transcript";
  payload: {
    text: string;
    speaker: "user" | "opponent";
    confidence?: number;
  };
}

// ============================================================================
// Backend → Frontend Messages
// ============================================================================

export interface MicroUpdateMessage extends BaseMessage {
  type: "micro_update";
  payload: {
    topRebuttal: Rebuttal;
    summary: DebateSummary;
    priority: number;
  };
}

export interface RebuttalsUpdateMessage extends BaseMessage {
  type: "rebuttals_update";
  payload: {
    rebuttals: Rebuttal[];
    style: ArgumentStyle;
  };
}

export interface DebateSummaryMessage extends BaseMessage {
  type: "debate_summary";
  payload: DebateSummary;
}

export interface BoundaryWarningMessage extends BaseMessage {
  type: "boundary_warning";
  payload: {
    message: string;
    severity: "warning" | "critical";
    toneScore: number;
  };
}

export interface ArgumentAnalysisMessage extends BaseMessage {
  type: "argument_analysis";
  payload: {
    argumentId: string;
    analysis: ArgumentAnalysis;
    rebuttals?: Rebuttal[];
  };
}

export interface ErrorMessage extends BaseMessage {
  type: "error";
  payload: {
    error: string;
    code?: string;
  };
}

// ============================================================================
// Unified Message Type
// ============================================================================

export type WebSocketMessage =
  | AudioChunkMessage
  | TranscriptMessage
  | MicroUpdateMessage
  | RebuttalsUpdateMessage
  | DebateSummaryMessage
  | BoundaryWarningMessage
  | ArgumentAnalysisMessage
  | ErrorMessage;

// ============================================================================
// Domain Types
// ============================================================================

export interface Rebuttal {
  id: string;
  text: string;
  priority: number;
  impactScore: number;
  style: ArgumentStyle;
  consensusScore: number;
}

export type ArgumentStyle =
  | "kind"
  | "stern"
  | "playful"
  | "trap"
  | "mysterious";

export interface DebateSummary {
  totalArguments: number;
  userArguments: number;
  opponentArguments: number;
  opponentToneScore: number;
  userToneScore: number;
  debateHealth: "good" | "deteriorating" | "critical";
  boundaryViolations: number;
}

export interface ArgumentAnalysis {
  factCheckScore: number;
  toneScore: number;
  logicalFallacies: string[];
  emotion: string;
  consensusScore: number;
  keyPoints: string[];
}

export interface RivalProfile {
  id: string;
  identifier: string;
  name: string;
  personaType: string;
  beliefPatterns: Record<string, number>;
  aggressionScore: number;
  argumentCount: number;
}
