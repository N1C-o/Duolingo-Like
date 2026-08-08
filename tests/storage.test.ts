import { afterEach, describe, expect, it } from "vitest";
import { content } from "@/content";
import { createInitialAppState } from "@/lib/progression/engine";
import { loadAppState, saveAppState } from "@/lib/storage/local-store";
import type { LessonSession } from "@/lib/progression/types";

const storageKey = "english-adventure-state-v1";

function installLocalStorage(value: unknown) {
  const values = new Map<string, string>([[storageKey, JSON.stringify(value)]]);
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, nextValue: string) => values.set(key, nextValue),
    removeItem: (key: string) => values.delete(key),
    clear: () => values.clear(),
    key: (index: number) => Array.from(values.keys())[index] ?? null,
    get length() { return values.size; }
  };
  Object.defineProperty(globalThis, "window", { configurable: true, value: { localStorage: storage } });
  return storage;
}

afterEach(() => {
  Reflect.deleteProperty(globalThis, "window");
});

describe("persistance locale", () => {
  it("répare une session obsolète et borne l’exercice courant", async () => {
    const state = createInitialAppState();
    const malformedSession: LessonSession = {
      lessonId: "old-lesson-id",
      isReplay: false,
      currentExerciseIndex: 999,
      submittedExerciseIds: ["hello-01-multiple-choice", "missing-exercise"],
      completedExerciseIds: ["hello-01-multiple-choice", "missing-exercise"],
      startedAt: "not-a-date",
      updatedAt: "not-a-date"
    };
    const raw = {
      ...state,
      activeProfileId: "gabriel",
      profiles: {
        ...state.profiles,
        gabriel: {
          ...state.profiles.gabriel,
          progress: {
            ...state.profiles.gabriel.progress,
            lessonSessions: { "hello-01": malformedSession }
          }
        }
      }
    };
    installLocalStorage(raw);

    const loaded = await loadAppState();
    const session = loaded.state.profiles.gabriel.progress.lessonSessions["hello-01"];

    expect(loaded.mode).toBe("localStorage");
    expect(loaded.recovered).toBe(true);
    expect(session.lessonId).toBe("hello-01");
    expect(session.currentExerciseIndex).toBe(5);
    expect(session.submittedExerciseIds).toEqual(["hello-01-multiple-choice"]);
    expect(session.completedExerciseIds).toEqual(["hello-01-multiple-choice"]);
  });

  it("ne signale pas une récupération pour une première installation vide", async () => {
    const storage = installLocalStorage(undefined);
    storage.clear();

    const loaded = await loadAppState();

    expect(loaded.mode).toBe("localStorage");
    expect(loaded.recovered).toBe(false);
    expect(loaded.state.activeProfileId).toBeNull();
  });

  it("écrit dans le fallback local quand IndexedDB est indisponible", async () => {
    const storage = installLocalStorage(undefined);
    storage.clear();
    const state = createInitialAppState();

    await expect(saveAppState(state)).resolves.toBe("localStorage");
    expect(JSON.parse(storage.getItem(storageKey) ?? "{}").contentVersion).toBe(content.course.contentVersion);
  });

  it("sérialise les sauvegardes rapides et conserve le dernier état", async () => {
    const storage = installLocalStorage(undefined);
    storage.clear();
    const first = createInitialAppState();
    const second = { ...first, activeProfileId: "luca" as const };

    await Promise.all([saveAppState(first), saveAppState(second)]);

    expect(JSON.parse(storage.getItem(storageKey) ?? "{}").activeProfileId).toBe("luca");
  });
});
