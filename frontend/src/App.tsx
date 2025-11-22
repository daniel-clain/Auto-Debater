/**
 * Auto-Debater Frontend - Main App
 * Uses WebSocket for all communication with backend
 */

import { useCallback, useEffect, useState } from "react";
import {
  ArgumentStyle,
  BoundaryWarningMessage,
  DebateSummaryMessage,
  DebateSummary as DebateSummaryType,
  MicroUpdateMessage,
  Rebuttal,
  RebuttalsUpdateMessage,
  WebSocketMessage,
} from "../../shared/types";
import "./App.css";
import AudioRecorder from "./components/AudioRecorder";
import BoundaryWarning from "./components/BoundaryWarning";
import DebateSummary from "./components/DebateSummary";
import ModeSelector from "./components/ModeSelector";
import OptionButtons from "./components/OptionButtons";
import PrimaryButton from "./components/PrimaryButton";
import { WEBSOCKET_URL } from "./config";
import { WebSocketClient } from "./core/websocket/client";

function App() {
  const [mode, setMode] = useState<"earpiece" | "ui">("earpiece");
  const [sessionId] = useState<string>(() => `session-${Date.now()}`);
  const [wsClient] = useState<WebSocketClient>(() => new WebSocketClient());
  const [rebuttals, setRebuttals] = useState<Rebuttal[]>([]);
  const [selectedRebuttal, setSelectedRebuttal] = useState<string | null>(null);
  const [summary, setSummary] = useState<DebateSummaryType | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [style, setStyle] = useState<ArgumentStyle>("kind");
  const [boundaryWarning, setBoundaryWarning] = useState<string | null>(null);
  const [topRebuttal, setTopRebuttal] = useState<Rebuttal | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    wsClient.connect(WEBSOCKET_URL);

    // Register message handlers
    wsClient.on("micro_update", (message: WebSocketMessage) => {
      const msg = message as MicroUpdateMessage;
      setTopRebuttal(msg.payload.topRebuttal);
      setSummary(msg.payload.summary);
      setIsProcessing(false);
    });

    wsClient.on("rebuttals_update", (message: WebSocketMessage) => {
      const msg = message as RebuttalsUpdateMessage;
      setRebuttals(msg.payload.rebuttals);
      setStyle(msg.payload.style);
    });

    wsClient.on("debate_summary", (message: WebSocketMessage) => {
      const msg = message as DebateSummaryMessage;
      setSummary(msg.payload);
    });

    wsClient.on("boundary_warning", (message: WebSocketMessage) => {
      const msg = message as BoundaryWarningMessage;
      setBoundaryWarning(msg.payload.message);
      if (msg.payload.severity === "critical") {
        // Handle critical boundary violation
        console.error("Critical boundary violation!");
      }
    });

    wsClient.on("error", (message: WebSocketMessage) => {
      console.error("WebSocket error:", message);
    });

    return () => {
      wsClient.disconnect();
    };
  }, [wsClient]);

  // Handle primary button click - play top rebuttal
  const handlePrimaryClick = useCallback(() => {
    if (topRebuttal && mode === "earpiece") {
      // Play audio of top rebuttal
      const utterance = new SpeechSynthesisUtterance(topRebuttal.text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  }, [topRebuttal, mode]);

  // Handle option button click - play selected rebuttal
  const handleOptionClick = useCallback(
    (rebuttalId: string) => {
      setSelectedRebuttal(rebuttalId);
      const rebuttal = rebuttals.find((r) => r.id === rebuttalId);
      if (rebuttal && mode === "earpiece") {
        const utterance = new SpeechSynthesisUtterance(rebuttal.text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    },
    [rebuttals, mode]
  );

  return (
    <div className="app">
      <ModeSelector mode={mode} onModeChange={setMode} />

      {boundaryWarning && (
        <BoundaryWarning
          message={boundaryWarning}
          onDismiss={() => setBoundaryWarning(null)}
        />
      )}

      <div className="app-content">
        <div className="top-section">
          <PrimaryButton
            onClick={handlePrimaryClick}
            disabled={!topRebuttal || isProcessing}
            isProcessing={isProcessing}
          />
        </div>

        <div className="bottom-section">
          {summary && <DebateSummary summary={summary} />}

          <OptionButtons
            rebuttals={rebuttals}
            selectedId={selectedRebuttal}
            onSelect={handleOptionClick}
            style={style}
          />
        </div>
      </div>

      <AudioRecorder
        sessionId={sessionId}
        wsClient={wsClient}
        isRecording={isRecording}
        onRecordingChange={setIsRecording}
        onProcessingChange={setIsProcessing}
      />
    </div>
  );
}

export default App;
