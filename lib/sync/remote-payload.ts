import type { ProfileProgress } from "@/lib/progression/types";
import { pruneReplayXpByDay } from "@/lib/sync/snapshot";

const requiredArrayFields = [
  "completedLessonIds",
  "completedUnitIds",
  "startedLessonIds",
  "completedExerciseIds",
  "unlockedUnitIds",
  "parentUnlockedUnitIds",
  "badgeIds",
  "consolidatedConceptIds"
] as const;

const requiredObjectFields = ["lessonSessions", "exerciseStats", "conceptStats", "replayXpByDay"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string" && item.length > 0);
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isExerciseStat(value: unknown): boolean {
  if (!isRecord(value)) return false;
  if (!isNonNegativeInteger(value.attempts) || !isNonNegativeInteger(value.errors) || !isNonNegativeInteger(value.successes)) return false;
  if (value.errors > value.attempts || value.successes > value.attempts - value.errors) return false;
  return isNullableString(value.lastAttemptAt) && isNullableString(value.lastErrorAt);
}

function isLessonSession(value: unknown): boolean {
  return isRecord(value) && typeof value.lessonId === "string" && typeof value.isReplay === "boolean" && isNonNegativeInteger(value.currentExerciseIndex) && isStringArray(value.submittedExerciseIds) && isStringArray(value.completedExerciseIds) && typeof value.startedAt === "string" && typeof value.updatedAt === "string";
}

function isRecordMap(value: unknown, predicate: (entry: unknown) => boolean): value is Record<string, unknown> {
  return isRecord(value) && Object.entries(value).every(([key, entry]) => key.length > 0 && predicate(entry));
}

export function isPersistableProgress(value: unknown): value is ProfileProgress {
  if (!isRecord(value) || !isNonNegativeInteger(value.xpTotal)) return false;
  if (!requiredArrayFields.every((field) => isStringArray(value[field]))) return false;
  if (!isRecordMap(value.lessonSessions, isLessonSession)) return false;
  if (!isRecordMap(value.exerciseStats, isExerciseStat)) return false;
  if (!isRecordMap(value.conceptStats, (entry) => isExerciseStat(entry) && isRecord(entry) && isNonNegativeInteger(entry.consecutiveCorrect) && isNonNegativeInteger(entry.successes) && entry.consecutiveCorrect <= entry.successes && isStringArray(entry.exerciseTypes) && typeof entry.recoveredAfterError === "boolean" && typeof entry.needsConsolidation === "boolean" && typeof entry.consolidated === "boolean")) return false;
  if (!isRecordMap(value.replayXpByDay, isNonNegativeInteger)) return false;
  if (!requiredObjectFields.every((field) => isRecord(value[field]))) return false;
  if (!isNonNegativeInteger(value.audioListenCount) || !isNonNegativeInteger(value.revisionCompletedCount)) return false;
  if (!isNullableString(value.lastActivityAt)) return false;
  return true;
}

export function normalizeRemoteProgress(value: unknown, referenceDate = new Date()): ProfileProgress {
  if (!isPersistableProgress(value)) throw new Error("Progression distante invalide");
  const progress = JSON.parse(JSON.stringify(value)) as ProfileProgress;
  progress.replayXpByDay = pruneReplayXpByDay(progress.replayXpByDay, referenceDate);
  return progress;
}
