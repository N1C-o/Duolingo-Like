import { describe, expect, it } from "vitest";
import { createEmptyProgress } from "@/lib/progression/engine";
import {
  assertSupportedVersions,
  isValidProgressSnapshot,
  CURRENT_CONTENT_VERSION,
  CURRENT_SCHEMA_VERSION
} from "@/convex/progress_validation";

describe("validation Convex des snapshots", () => {
  it("accepte une progression complète de la version courante", () => {
    expect(isValidProgressSnapshot(createEmptyProgress(), new Date("2026-08-08T12:00:00.000Z"))).toBe(true);
  });

  it("refuse une version de schéma ou de contenu inconnue", () => {
    expect(() => assertSupportedVersions(CURRENT_SCHEMA_VERSION + 1, CURRENT_CONTENT_VERSION)).toThrow();
    expect(() => assertSupportedVersions(CURRENT_SCHEMA_VERSION, "9.9.9")).toThrow();
  });

  it("limite replayXpByDay aux 31 derniers jours", () => {
    const progress = createEmptyProgress();
    progress.replayXpByDay = {
      "2026-07-08:old": 1,
      "2026-07-10:kept": 1
    };

    expect(isValidProgressSnapshot(progress, new Date("2026-08-08T12:00:00.000Z"))).toBe(false);
    progress.replayXpByDay = { "2026-07-10:kept": 1 };
    expect(isValidProgressSnapshot(progress, new Date("2026-08-08T12:00:00.000Z"))).toBe(true);
  });

  it("refuse les structures internes mal formées", () => {
    const progress = createEmptyProgress();
    progress.completedLessonIds = ["hello-01"];
    expect(isValidProgressSnapshot({ ...progress, completedLessonIds: [42] }, new Date("2026-08-08T12:00:00.000Z"))).toBe(false);
    expect(isValidProgressSnapshot({ ...progress, lessonSessions: { "hello-01": { lessonId: "hello-01" } } }, new Date("2026-08-08T12:00:00.000Z"))).toBe(false);
    expect(isValidProgressSnapshot({ ...progress, exerciseStats: { "hello-01": { attempts: 1, errors: 2, successes: 0, lastAttemptAt: null, lastErrorAt: null } } }, new Date("2026-08-08T12:00:00.000Z"))).toBe(false);
  });
});
