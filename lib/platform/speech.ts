import type { SpeechRate } from "@/lib/progression/types";

const LOCAL_AUDIO_BY_TEXT = new Map<string, string>([
  ["hello", "/audio/lessons/hello-01/hello-narrator.wav"],
  ["hello!", "/audio/lessons/hello-01/hello-narrator.wav"],
  ["the suitcase is sleeping!", "/audio/lessons/hello-01/gabriel-suitcase-sleeping.wav"],
  ["maybe it needs a friendly hello.", "/audio/lessons/hello-01/luca-friendly-hello.wav"],
  ["hello! click!", "/audio/lessons/hello-01/suitcase-hello-click.wav"],
  ["the first map is inside!", "/audio/lessons/hello-01/gabriel-map-inside.wav"],
  ["what's your name?", "/audio/lessons/hello-01/name-question.wav"],
  ["i'm gabriel.", "/audio/lessons/hello-01/im-gabriel.wav"]
]);

let activeAudio: HTMLAudioElement | null = null;
let speechRequestId = 0;

function normalizeSpeechText(text: string) {
  return text.trim().replace(/[’']/g, "'").replace(/\s+/g, " ").toLowerCase();
}

export function speechAvailable() {
  return typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

function speakWithSpeechSynthesis(text: string, rate: SpeechRate) {
  if (!speechAvailable()) return false;

  try {
    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = rate;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
    return true;
  } catch {
    return false;
  }
}

export function stopSpeaking() {
  speechRequestId += 1;
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.currentTime = 0;
    activeAudio = null;
  }
  if (speechAvailable()) window.speechSynthesis.cancel();
}

export function speakEnglish(text: string, rate: SpeechRate) {
  stopSpeaking();
  const requestId = speechRequestId;
  const localAudioPath = LOCAL_AUDIO_BY_TEXT.get(normalizeSpeechText(text));

  if (localAudioPath && typeof window !== "undefined" && typeof window.Audio === "function") {
    try {
      const audio = new window.Audio(localAudioPath);
      let fallbackStarted = false;
      activeAudio = audio;

      const fallbackToSpeech = () => {
        if (fallbackStarted || requestId !== speechRequestId) return false;
        fallbackStarted = true;
        if (activeAudio === audio) {
          audio.pause();
          activeAudio = null;
        }
        if (speechAvailable()) window.speechSynthesis.cancel();
        return speakWithSpeechSynthesis(text, rate);
      };

      audio.addEventListener("error", () => {
        fallbackToSpeech();
      }, { once: true });
      audio.addEventListener("ended", () => {
        if (requestId === speechRequestId && activeAudio === audio) activeAudio = null;
      }, { once: true });

      try {
        const playPromise = audio.play();
        void playPromise.catch(() => {
          fallbackToSpeech();
        });
        return true;
      } catch {
        return fallbackToSpeech();
      }
    } catch {
      activeAudio = null;
    }
  }

  return speakWithSpeechSynthesis(text, rate);
}
