import type { SpeechRate } from "@/lib/progression/types";

export function speechAvailable() {
  return typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

export function stopSpeaking() {
  if (speechAvailable()) window.speechSynthesis.cancel();
}

export function speakEnglish(text: string, rate: SpeechRate) {
  if (!speechAvailable()) return false;
  stopSpeaking();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = rate;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
  return true;
}
