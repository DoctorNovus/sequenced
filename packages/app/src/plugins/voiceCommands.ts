import { registerPlugin } from "@capacitor/core";

export type SpeechPermissionStatus = "authorized" | "denied" | "restricted" | "not_determined" | "unknown";
export type MicrophonePermissionStatus = "granted" | "denied" | "undetermined" | "unknown";

export interface VoiceCommandsPlugin {
  checkSpeechPermission(): Promise<{
    speech: SpeechPermissionStatus;
    microphone: MicrophonePermissionStatus;
  }>;
  requestSpeechPermission(): Promise<{
    speech: SpeechPermissionStatus;
    microphone: MicrophonePermissionStatus;
  }>;
  startListening(): Promise<void>;
  stopListening(): Promise<void>;
  speak(options: { text: string }): Promise<void>;
  addListener(
    eventName: "partialResult" | "finalResult" | "listeningState" | "error",
    listenerFunc: (event: { text?: string; isFinal?: boolean; isListening?: boolean; message?: string }) => void
  ): Promise<{ remove: () => void }>;
}

export const VoiceCommands = registerPlugin<VoiceCommandsPlugin>("VoiceCommands");
