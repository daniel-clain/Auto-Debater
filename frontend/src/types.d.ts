declare module "react-speech-recognition" {
  export interface SpeechRecognitionOptions {
    continuous?: boolean;
    language?: string;
    interimResults?: boolean;
    maxAlternatives?: number;
  }

  export function useSpeechRecognition(options?: SpeechRecognitionOptions): {
    transcript: string;
    resetTranscript: () => void;
    browserSupportsSpeechRecognition: boolean;
  };

  interface SpeechRecognitionStatic {
    startListening: (options?: SpeechRecognitionOptions) => void;
    stopListening: () => void;
    abortListening: () => void;
    browserSupportsSpeechRecognition: boolean;
  }

  const SpeechRecognition: SpeechRecognitionStatic;
  export default SpeechRecognition;
}
