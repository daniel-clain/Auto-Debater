/**
 * Audio Recorder Component
 * Records audio and sends chunks via WebSocket
 */

import { useEffect, useRef } from "react";
import { AudioChunkMessage } from "../../../shared/types";
import { WebSocketClient } from "../core/websocket/client";

interface AudioRecorderProps {
  sessionId: string;
  wsClient: WebSocketClient;
  isRecording: boolean;
  onRecordingChange: (recording: boolean) => void;
  onProcessingChange: (processing: boolean) => void;
}

export default function AudioRecorder({
  sessionId,
  wsClient,
  isRecording,
  onRecordingChange,
  onProcessingChange,
}: AudioRecorderProps) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const chunkIndexRef = useRef(0);

  useEffect(() => {
    // Auto-start recording on mount
    startRecording();

    return () => {
      stopRecording();
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);

          // Send chunk via WebSocket
          event.data.arrayBuffer().then((audioData) => {
            const message: AudioChunkMessage = {
              type: "audio_chunk",
              timestamp: Date.now(),
              sessionId,
              payload: {
                audioData,
                chunkIndex: chunkIndexRef.current++,
                isFinal: false,
              },
            };

            wsClient.send(message);
          });
        }
      };

      mediaRecorder.onstop = () => {
        // Send final chunk
        const allChunks = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        allChunks.arrayBuffer().then((audioData) => {
          const message: AudioChunkMessage = {
            type: "audio_chunk",
            timestamp: Date.now(),
            sessionId,
            payload: {
              audioData,
              chunkIndex: chunkIndexRef.current++,
              isFinal: true,
            },
          };

          wsClient.send(message);
          onProcessingChange(true);
        });

        audioChunksRef.current = [];
        chunkIndexRef.current = 0;

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000); // Send chunks every second
      onRecordingChange(true);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      onRecordingChange(false);
    }
  };

  return null; // This component doesn't render UI
}
