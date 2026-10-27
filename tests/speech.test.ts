import { afterEach, describe, expect, it, vi } from "vitest";
import { speakEnglish, stopSpeaking } from "@/lib/platform/speech";
import recordedAudio from "@/content/audio-manifest.json";

function installAudio({ noSpeech = false, reject = false } = {}) {
  const audios: Array<{
    path: string;
    playbackRate: number;
    currentTime: number;
    play: ReturnType<typeof vi.fn>;
    pause: ReturnType<typeof vi.fn>;
    listeners: Record<string, () => void>;
  }> = [];
  class Audio {
    playbackRate = 1;
    currentTime = 0;
    listeners: Record<string, () => void> = {};
    play = vi.fn(() => reject ? Promise.reject(new Error("Playback refused")) : Promise.resolve());
    pause = vi.fn();
    constructor(public path: string) { audios.push(this); }
    addEventListener(type: string, handler: () => void) { this.listeners[type] = handler; }
  }
  class Utterance {
    lang = "";
    rate = 1;
    pitch = 1;
    constructor(public text: string) {}
  }
  const speak = vi.fn();
  const cancel = vi.fn();
  vi.stubGlobal("window", {
    Audio,
    ...(noSpeech ? {} : { SpeechSynthesisUtterance: Utterance, speechSynthesis: { speak, cancel } })
  });
  return { audios, speak, cancel };
}

afterEach(() => {
  stopSpeaking();
  vi.unstubAllGlobals();
});

describe("voix enregistrées et secours navigateur", () => {
  it("lit tous les enregistrements du parcours sans dépendre de la synthèse navigateur", () => {
    const { audios, speak } = installAudio({ noSpeech: true });
    for (const [text, clip] of Object.entries(recordedAudio.clips)) {
      expect(speakEnglish(text, 0.75)).toBe(true);
      expect(audios.at(-1)?.path).toBe(clip.path);
      expect(audios.at(-1)?.playbackRate).toBe(0.75);
    }
    expect(audios).toHaveLength(Object.keys(recordedAudio.clips).length);
    expect(speak).not.toHaveBeenCalled();
  });

  it("lit un fichier local même lorsque la synthèse vocale n’existe pas", () => {
    const { audios } = installAudio({ noSpeech: true });
    expect(speakEnglish("  Hello!  ", 0.75)).toBe(true);
    expect(audios[0].path).toBe("/audio/lessons/hello-01/hello-narrator.wav");
    expect(audios[0].playbackRate).toBe(0.75);
    expect(audios[0].play).toHaveBeenCalledOnce();
  });

  it("normalise les apostrophes et espaces avant de chercher l’enregistrement", () => {
    const { audios } = installAudio();
    expect(speakEnglish("What’s   your name?", 0.9)).toBe(true);
    expect(audios[0].path).toContain("name-question.wav");
  });

  it("utilise le secours anglais pour un texte sans enregistrement", () => {
    const { audios, speak } = installAudio();
    expect(speakEnglish("A new sentence.", 0.9)).toBe(true);
    expect(audios).toHaveLength(0);
    expect(speak).toHaveBeenCalledWith(expect.objectContaining({ text: "A new sentence.", lang: "en-US", rate: 0.9 }));
  });

  it("bascule une seule fois vers le secours si le fichier échoue", async () => {
    const { audios, speak } = installAudio({ reject: true });
    speakEnglish("Hello!", 0.9);
    await Promise.resolve();
    audios[0].listeners.error();
    expect(speak).toHaveBeenCalledOnce();
  });

  it("ignore l’erreur tardive d’un enregistrement interrompu par la phrase suivante", () => {
    const { audios, speak } = installAudio();
    speakEnglish("Hello!", 1);
    speakEnglish("I’m Gabriel.", 1);
    audios[0].listeners.error();
    expect(audios[0].pause).toHaveBeenCalledOnce();
    expect(speak).not.toHaveBeenCalled();
    expect(audios[1].play).toHaveBeenCalledOnce();
  });

  it("signale l’indisponibilité lorsque ni fichier ni synthèse ne peuvent parler", () => {
    installAudio({ noSpeech: true });
    expect(speakEnglish("A new sentence.", 1)).toBe(false);
  });
});
