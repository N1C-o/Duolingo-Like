import { describe, expect, it } from "vitest";
import { createEmptyProgress } from "@/lib/progression/engine";
import { normalizeRemoteProgress, isPersistableProgress } from "@/lib/sync/remote-payload";

describe("payload distant de progression", () => {
  it("accepte et normalise une progression complète", () => {
    const progress = createEmptyProgress();
    progress.replayXpByDay = {
      "2026-06-01:hello-01": 5,
      "2026-08-08:hello-01": 1
    };

    const normalized = normalizeRemoteProgress(progress, new Date("2026-08-08T12:00:00.000Z"));

    expect(isPersistableProgress(normalized)).toBe(true);
    expect(normalized.replayXpByDay).toEqual({ "2026-08-08:hello-01": 1 });
  });

  it("refuse une progression distante dont les champs structurants sont absents", () => {
    expect(isPersistableProgress({ xpTotal: 10 })).toBe(false);
  });

  it("refuse un lastActivityAt objet et les tableaux non textuels", () => {
    const progress = createEmptyProgress();

    expect(isPersistableProgress({ ...progress, lastActivityAt: {} })).toBe(false);
    expect(isPersistableProgress({ ...progress, completedLessonIds: [42] })).toBe(false);
  });
});
