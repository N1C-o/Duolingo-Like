export const CURRENT_SCHEMA_VERSION = 1;
export const CURRENT_CONTENT_VERSION = "1.2.1";
export const MAX_SNAPSHOT_BYTES = 900_000;
export const MAX_REPLAY_ENTRIES = 2_000;
export const REPLAY_RETENTION_DAYS = 31;

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

function startOfUtcDay(date: Date) {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function dateFromReplayKey(key: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})(?::|$)/.exec(key);
  if (!match) return null;
  const [, year, month, day] = match;
  const timestamp = Date.UTC(Number(year), Number(month) - 1, Number(day));
  const parsed = new Date(timestamp);
  if (parsed.getUTCFullYear() !== Number(year) || parsed.getUTCMonth() !== Number(month) - 1 || parsed.getUTCDate() !== Number(day)) return null;
  return timestamp;
}

export function assertSupportedVersions(schemaVersion: number, contentVersion: string) {
  if (schemaVersion !== CURRENT_SCHEMA_VERSION || contentVersion !== CURRENT_CONTENT_VERSION) throw new Error("Unsupported progression version");
}

export function isValidProgressSnapshot(value: unknown, referenceDate = new Date()) {
  if (!isRecord(value) || !isNonNegativeInteger(value.xpTotal)) return false;
  const arrayFields = [
    "completedLessonIds",
    "completedUnitIds",
    "startedLessonIds",
    "completedExerciseIds",
    "unlockedUnitIds",
    "parentUnlockedUnitIds",
    "badgeIds",
    "consolidatedConceptIds"
  ];
  if (!arrayFields.every((field) => isStringArray(value[field]))) return false;
  if (!isRecordMap(value.lessonSessions, isLessonSession)) return false;
  if (!isRecordMap(value.exerciseStats, isExerciseStat)) return false;
  if (!isRecordMap(value.conceptStats, (entry) => isExerciseStat(entry) && isRecord(entry) && isNonNegativeInteger(entry.consecutiveCorrect) && isNonNegativeInteger(entry.successes) && entry.consecutiveCorrect <= entry.successes && isStringArray(entry.exerciseTypes) && typeof entry.recoveredAfterError === "boolean" && typeof entry.needsConsolidation === "boolean" && typeof entry.consolidated === "boolean")) return false;
  if (!isRecordMap(value.replayXpByDay, isNonNegativeInteger)) return false;
  const replayEntries = Object.entries(value.replayXpByDay);
  if (replayEntries.length > MAX_REPLAY_ENTRIES) return false;
  const referenceStart = startOfUtcDay(referenceDate);
  if (!replayEntries.every(([key]) => {
    const entryStart = dateFromReplayKey(key);
    if (entryStart === null) return false;
    const age = Math.floor((referenceStart - entryStart) / 86_400_000);
    return age >= 0 && age < REPLAY_RETENTION_DAYS;
  })) return false;
  if (!isNonNegativeInteger(value.audioListenCount) || !isNonNegativeInteger(value.revisionCompletedCount)) return false;
  if (!isNullableString(value.lastActivityAt)) return false;
  const serialized = JSON.stringify(value);
  return typeof serialized === "string" && serialized.length <= MAX_SNAPSHOT_BYTES;
}

export function assertValidProgressSnapshot(value: unknown) {
  if (!isValidProgressSnapshot(value)) throw new Error("Invalid progress snapshot");
}
