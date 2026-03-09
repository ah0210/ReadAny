/**
 * React Native TTS player factories.
 *
 * - BrowserTTS → expo-speech (native OS TTS)
 * - EdgeTTS / DashScope → TODO: implement with expo-av audio playback
 *   For now they fall back to expo-speech as well.
 */
import type { TTSPlayerFactories } from "@readany/core/stores";
import { ExpoSpeechTTSPlayer } from "./expo-speech-player";

export const rnTTSPlayerFactories: TTSPlayerFactories = {
  createBrowserTTS: () => new ExpoSpeechTTSPlayer(),
  // Edge TTS and DashScope TTS need audio stream playback via expo-av.
  // For MVP, fall back to native speech synthesis.
  createEdgeTTS: () => new ExpoSpeechTTSPlayer(),
  createDashScopeTTS: () => new ExpoSpeechTTSPlayer(),
};
