import { getLesson } from "@/content";
import { createInitialAppState, PROGRESSION_RULES } from "@/lib/progression/engine";
import type { ExerciseType } from "@/lib/content/types";
import type { AppState, ConceptStat, ExerciseStat, LessonSession, LocalProfile, ProfileProgress } from "@/lib/progression/types";

const DATABASE_NAME = "english-adventure-local";
const DATABASE_VERSION = 1;
const STATE_STORE = "app-state";
const STATE_KEY = "root";
const FALLBACK_KEY = "english-adventure-state-v1";
const STORAGE_TIMEOUT_MS = 1500;

export type PersistenceMode = "indexeddb" | "localStorage" | "memory";

export type LoadedState = {
  state: AppState;
  mode: PersistenceMode;
  recovered: boolean;
};

let databasePromise: Promise<IDBDatabase> | null = null;
let saveQueue: Promise<void> = Promise.resolve();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

type Normalized<T> = {
  value: T;
  recovered: boolean;
};

const exerciseTypes = new Set<ExerciseType>([
  "multiple-choice",
  "english-french-matching",
  "image-word-matching",
  "reorder",
  "guided-translation",
  "listening",
  "listening-choice",
  "sentence-completion",
  "dialogue",
  "memory",
  "true-false"
]);

function nowIso() {
  return new Date().toISOString();
}

function stringArray(value: unknown, fallback: string[]): Normalized<string[]> {
  if (!Array.isArray(value)) return { value: [...fallback], recovered: true };
  const validValues = value.filter((item): item is string => typeof item === "string" && item.length > 0);
  const uniqueValues = Array.from(new Set(validValues));
  return { value: uniqueValues, recovered: validValues.length !== value.length || uniqueValues.length !== validValues.length };
}

function nonNegativeInteger(value: unknown, fallback: number): Normalized<number> {
  if (typeof value === "number" && Number.isInteger(value) && value >= 0) return { value, recovered: false };
  return { value: fallback, recovered: true };
}

function booleanValue(value: unknown, fallback: boolean): Normalized<boolean> {
  if (typeof value === "boolean") return { value, recovered: false };
  return { value: fallback, recovered: true };
}

function nullableTimestamp(value: unknown, fallback: string | null): Normalized<string | null> {
  if (value === null || typeof value === "string") return { value, recovered: false };
  return { value: fallback, recovered: true };
}

function timestamp(value: unknown, fallback: string): Normalized<string> {
  if (typeof value === "string") return { value, recovered: false };
  return { value: fallback, recovered: true };
}

function normalizeExerciseStat(raw: unknown, fallback: ExerciseStat): Normalized<ExerciseStat> {
  const record = isRecord(raw) ? raw : {};
  const attempts = nonNegativeInteger(record.attempts, fallback.attempts);
  const rawErrors = nonNegativeInteger(record.errors, fallback.errors);
  const rawSuccesses = nonNegativeInteger(record.successes, fallback.successes);
  const errors = Math.min(rawErrors.value, attempts.value);
  const successes = Math.min(rawSuccesses.value, attempts.value - errors);
  const lastAttemptAt = nullableTimestamp(record.lastAttemptAt, fallback.lastAttemptAt);
  const lastErrorAt = nullableTimestamp(record.lastErrorAt, fallback.lastErrorAt);
  return {
    value: {
      attempts: attempts.value,
      errors,
      successes,
      lastAttemptAt: lastAttemptAt.value,
      lastErrorAt: errors > 0 ? lastErrorAt.value : null
    },
    recovered: !isRecord(raw) || attempts.recovered || rawErrors.recovered || rawSuccesses.recovered || errors !== rawErrors.value || successes !== rawSuccesses.value || lastAttemptAt.recovered || lastErrorAt.recovered
  };
}

function normalizeConceptStat(raw: unknown, fallback: ConceptStat): Normalized<ConceptStat> {
  const record = isRecord(raw) ? raw : {};
  const base = normalizeExerciseStat(record, fallback);
  const consecutiveCorrect = nonNegativeInteger(record.consecutiveCorrect, fallback.consecutiveCorrect);
  const rawExerciseTypes = Array.isArray(record.exerciseTypes) ? record.exerciseTypes : null;
  const validExerciseTypes = rawExerciseTypes?.filter((type): type is ExerciseType => typeof type === "string" && exerciseTypes.has(type as ExerciseType)) ?? [...fallback.exerciseTypes];
  const uniqueExerciseTypes = Array.from(new Set(validExerciseTypes));
  const recoveredAfterError = booleanValue(record.recoveredAfterError, fallback.recoveredAfterError);
  const consolidated = booleanValue(record.consolidated, fallback.consolidated);
  const safeConsecutiveCorrect = Math.min(consecutiveCorrect.value, base.value.successes);
  const needsConsolidation = base.value.errors >= PROGRESSION_RULES.consolidationMinErrors || (base.value.attempts >= PROGRESSION_RULES.consolidationErrorRateAttempts && base.value.errors / base.value.attempts >= PROGRESSION_RULES.consolidationErrorRate);
  const safeConsolidated = consolidated.value && base.value.successes >= PROGRESSION_RULES.consolidationSuccesses && uniqueExerciseTypes.length >= PROGRESSION_RULES.consolidationExerciseTypes && recoveredAfterError.value;
  return {
    value: {
      ...base.value,
      consecutiveCorrect: safeConsecutiveCorrect,
      exerciseTypes: uniqueExerciseTypes,
      recoveredAfterError: recoveredAfterError.value,
      needsConsolidation,
      consolidated: safeConsolidated
    },
    recovered: base.recovered || consecutiveCorrect.recovered || !rawExerciseTypes || validExerciseTypes.length !== rawExerciseTypes.length || uniqueExerciseTypes.length !== validExerciseTypes.length || recoveredAfterError.recovered || consolidated.recovered || safeConsecutiveCorrect !== consecutiveCorrect.value || safeConsolidated !== consolidated.value
  };
}

function normalizeLessonSessions(raw: unknown, fallback: Record<string, LessonSession>): Normalized<Record<string, LessonSession>> {
  if (!isRecord(raw)) return { value: { ...fallback }, recovered: true };
  const sessions: Record<string, LessonSession> = {};
  let recovered = false;
  Object.entries(raw).forEach(([key, value]) => {
    if (!isRecord(value) || !key) {
      recovered = true;
      return;
    }
    let lesson;
    try {
      lesson = getLesson(key);
    } catch {
      recovered = true;
      return;
    }
    const exerciseIds = new Set(lesson.exercises.map((exercise) => exercise.id));
    const submittedExerciseIds = stringArray(value.submittedExerciseIds, []);
    const completedExerciseIds = stringArray(value.completedExerciseIds, []);
    const submitted = Array.from(new Set([...submittedExerciseIds.value, ...completedExerciseIds.value])).filter((id) => exerciseIds.has(id));
    const completed = Array.from(new Set(completedExerciseIds.value)).filter((id) => exerciseIds.has(id));
    const currentExerciseIndex = nonNegativeInteger(value.currentExerciseIndex, 0);
    const safeCurrentExerciseIndex = Math.min(currentExerciseIndex.value, Math.max(0, lesson.exercises.length - 1));
    const isReplay = booleanValue(value.isReplay, false);
    const startedAt = timestamp(value.startedAt, nowIso());
    const updatedAt = timestamp(value.updatedAt, startedAt.value);
    sessions[key] = {
      lessonId: key,
      isReplay: isReplay.value,
      currentExerciseIndex: safeCurrentExerciseIndex,
      submittedExerciseIds: submitted,
      completedExerciseIds: completed,
      startedAt: startedAt.value,
      updatedAt: updatedAt.value
    };
    recovered ||= value.lessonId !== key || submittedExerciseIds.recovered || completedExerciseIds.recovered || submitted.length !== submittedExerciseIds.value.length || completed.length !== completedExerciseIds.value.length || currentExerciseIndex.recovered || safeCurrentExerciseIndex !== currentExerciseIndex.value || isReplay.recovered || startedAt.recovered || updatedAt.recovered;
  });
  return { value: sessions, recovered };
}

function normalizeExerciseStats(raw: unknown, fallback: Record<string, ExerciseStat>): Normalized<Record<string, ExerciseStat>> {
  if (!isRecord(raw)) return { value: { ...fallback }, recovered: true };
  const stats: Record<string, ExerciseStat> = {};
  let recovered = false;
  Object.entries(raw).forEach(([key, value]) => {
    if (!key) {
      recovered = true;
      return;
    }
    const normalized = normalizeExerciseStat(value, fallback[key] ?? { attempts: 0, errors: 0, successes: 0, lastAttemptAt: null, lastErrorAt: null });
    stats[key] = normalized.value;
    recovered ||= normalized.recovered;
  });
  return { value: stats, recovered };
}

function normalizeConceptStats(raw: unknown, fallback: Record<string, ConceptStat>): Normalized<Record<string, ConceptStat>> {
  if (!isRecord(raw)) return { value: { ...fallback }, recovered: true };
  const stats: Record<string, ConceptStat> = {};
  let recovered = false;
  Object.entries(raw).forEach(([key, value]) => {
    if (!key) {
      recovered = true;
      return;
    }
    const normalized = normalizeConceptStat(value, fallback[key] ?? { attempts: 0, errors: 0, successes: 0, lastAttemptAt: null, lastErrorAt: null, consecutiveCorrect: 0, exerciseTypes: [], recoveredAfterError: false, needsConsolidation: false, consolidated: false });
    stats[key] = normalized.value;
    recovered ||= normalized.recovered;
  });
  return { value: stats, recovered };
}

function normalizeNumberMap(raw: unknown, fallback: Record<string, number>): Normalized<Record<string, number>> {
  if (!isRecord(raw)) return { value: { ...fallback }, recovered: true };
  const values: Record<string, number> = {};
  let recovered = false;
  Object.entries(raw).forEach(([key, value]) => {
    const normalized = nonNegativeInteger(value, 0);
    if (key) values[key] = normalized.value;
    recovered ||= !key || normalized.recovered;
  });
  return { value: values, recovered };
}

function normalizeProgress(raw: unknown, fallback: ProfileProgress): Normalized<ProfileProgress> {
  if (!isRecord(raw)) return { value: fallback, recovered: true };
  const xpTotal = nonNegativeInteger(raw.xpTotal, fallback.xpTotal);
  const completedLessonIds = stringArray(raw.completedLessonIds, fallback.completedLessonIds);
  const completedUnitIds = stringArray(raw.completedUnitIds, fallback.completedUnitIds);
  const startedLessonIds = stringArray(raw.startedLessonIds, fallback.startedLessonIds);
  const completedExerciseIds = stringArray(raw.completedExerciseIds, fallback.completedExerciseIds);
  const unlockedUnitIds = stringArray(raw.unlockedUnitIds, fallback.unlockedUnitIds);
  const parentUnlockedUnitIds = stringArray(raw.parentUnlockedUnitIds, fallback.parentUnlockedUnitIds);
  const lessonSessions = normalizeLessonSessions(raw.lessonSessions, fallback.lessonSessions);
  const exerciseStats = normalizeExerciseStats(raw.exerciseStats, fallback.exerciseStats);
  const conceptStats = normalizeConceptStats(raw.conceptStats, fallback.conceptStats);
  const badgeIds = stringArray(raw.badgeIds, fallback.badgeIds);
  const replayXpByDay = normalizeNumberMap(raw.replayXpByDay, fallback.replayXpByDay);
  const audioListenCount = nonNegativeInteger(raw.audioListenCount, fallback.audioListenCount);
  const revisionCompletedCount = nonNegativeInteger(raw.revisionCompletedCount, fallback.revisionCompletedCount);
  const consolidatedConceptIds = stringArray(raw.consolidatedConceptIds, fallback.consolidatedConceptIds);
  const lastActivityAt = nullableTimestamp(raw.lastActivityAt, fallback.lastActivityAt);
  return {
    value: {
    ...fallback,
      xpTotal: xpTotal.value,
      completedLessonIds: completedLessonIds.value,
      completedUnitIds: completedUnitIds.value,
      startedLessonIds: startedLessonIds.value,
      completedExerciseIds: completedExerciseIds.value,
      unlockedUnitIds: unlockedUnitIds.value,
      parentUnlockedUnitIds: parentUnlockedUnitIds.value,
      lessonSessions: lessonSessions.value,
      exerciseStats: exerciseStats.value,
      conceptStats: conceptStats.value,
      badgeIds: badgeIds.value,
      replayXpByDay: replayXpByDay.value,
      audioListenCount: audioListenCount.value,
      revisionCompletedCount: revisionCompletedCount.value,
      consolidatedConceptIds: consolidatedConceptIds.value,
      lastActivityAt: lastActivityAt.value
    },
    recovered: xpTotal.recovered || completedLessonIds.recovered || completedUnitIds.recovered || startedLessonIds.recovered || completedExerciseIds.recovered || unlockedUnitIds.recovered || parentUnlockedUnitIds.recovered || lessonSessions.recovered || exerciseStats.recovered || conceptStats.recovered || badgeIds.recovered || replayXpByDay.recovered || audioListenCount.recovered || revisionCompletedCount.recovered || consolidatedConceptIds.recovered || lastActivityAt.recovered
  };
}

function normalizeProfile(raw: unknown, fallback: LocalProfile): Normalized<LocalProfile> {
  if (!isRecord(raw)) return { value: fallback, recovered: true };
  const preferences = isRecord(raw.preferences) ? raw.preferences : {};
  const soundsEnabled = booleanValue(preferences.soundsEnabled, fallback.preferences.soundsEnabled);
  const autoPlay = booleanValue(preferences.autoPlay, fallback.preferences.autoPlay);
  const speechRate: Normalized<LocalProfile["preferences"]["speechRate"]> = preferences.speechRate === 0.75 || preferences.speechRate === 0.9 || preferences.speechRate === 1 ? { value: preferences.speechRate as LocalProfile["preferences"]["speechRate"], recovered: false } : { value: fallback.preferences.speechRate, recovered: true };
  const reducedMotion = booleanValue(preferences.reducedMotion, fallback.preferences.reducedMotion);
  const progress = normalizeProgress(raw.progress, fallback.progress);
  const firstUsedAt = nullableTimestamp(raw.firstUsedAt, fallback.firstUsedAt);
  const themeId: Normalized<LocalProfile["themeId"]> = raw.themeId === "gabriel" || raw.themeId === "luca" ? { value: raw.themeId, recovered: false } : { value: fallback.themeId, recovered: true };
  return {
    value: {
    ...fallback,
    id: fallback.id,
    themeId: themeId.value,
    firstUsedAt: firstUsedAt.value,
    preferences: {
      ...fallback.preferences,
      soundsEnabled: soundsEnabled.value,
      autoPlay: autoPlay.value,
      speechRate: speechRate.value,
      reducedMotion: reducedMotion.value
    },
    progress: progress.value
    },
    recovered: raw.id !== fallback.id || !isRecord(raw.preferences) || themeId.recovered || firstUsedAt.recovered || soundsEnabled.recovered || autoPlay.recovered || speechRate.recovered || reducedMotion.recovered || progress.recovered
  };
}

function normalizeState(raw: unknown): { state: AppState; recovered: boolean } {
  const initial = createInitialAppState();
  if (!isRecord(raw) || !isRecord(raw.profiles)) return { state: initial, recovered: true };
  const rawProfiles = raw.profiles;
  const activeProfileId = raw.activeProfileId === null || raw.activeProfileId === "gabriel" || raw.activeProfileId === "luca" ? raw.activeProfileId : null;
  const gabriel = normalizeProfile(rawProfiles.gabriel, initial.profiles.gabriel);
  const luca = normalizeProfile(rawProfiles.luca, initial.profiles.luca);
  const introSeen = booleanValue(raw.introSeen, initial.introSeen);
  return {
    state: {
      ...initial,
      schemaVersion: initial.schemaVersion,
      contentVersion: initial.contentVersion,
      activeProfileId,
      introSeen: introSeen.value,
      profiles: {
        gabriel: gabriel.value,
        luca: luca.value
      }
    },
    recovered: raw.schemaVersion !== initial.schemaVersion || raw.contentVersion !== initial.contentVersion || (raw.activeProfileId !== null && raw.activeProfileId !== "gabriel" && raw.activeProfileId !== "luca") || introSeen.recovered || gabriel.recovered || luca.recovered
  };
}

function canUseIndexedDb() {
  return typeof window !== "undefined" && "indexedDB" in window;
}

function canUseLocalStorage() {
  return typeof window !== "undefined" && "localStorage" in window;
}

function withStorageTimeout<T>(operation: Promise<T>, message: string) {
  let timeoutId: number | null = null;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = window.setTimeout(() => reject(new Error(message)), STORAGE_TIMEOUT_MS);
  });
  return Promise.race([operation, timeout]).finally(() => {
    if (timeoutId !== null) window.clearTimeout(timeoutId);
  });
}

function openDatabase() {
  if (!canUseIndexedDb()) return Promise.reject(new Error("IndexedDB indisponible"));
  if (databasePromise) return databasePromise;
  const opening = new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    const timeoutId = window.setTimeout(() => reject(new Error("Ouverture IndexedDB trop longue")), STORAGE_TIMEOUT_MS);
    request.onerror = () => {
      window.clearTimeout(timeoutId);
      reject(request.error ?? new Error("Impossible d’ouvrir IndexedDB"));
    };
    request.onblocked = () => {
      window.clearTimeout(timeoutId);
      reject(new Error("Ouverture IndexedDB bloquée"));
    };
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STATE_STORE)) database.createObjectStore(STATE_STORE);
    };
    request.onsuccess = () => {
      window.clearTimeout(timeoutId);
      resolve(request.result);
    };
  });
  databasePromise = opening.catch((error: unknown) => {
    databasePromise = null;
    throw error;
  });
  return databasePromise;
}

async function readIndexedDb() {
  const database = await openDatabase();
  return withStorageTimeout(new Promise<unknown>((resolve, reject) => {
    const transaction = database.transaction(STATE_STORE, "readonly");
    const request = transaction.objectStore(STATE_STORE).get(STATE_KEY);
    request.onerror = () => reject(request.error ?? new Error("Lecture IndexedDB impossible"));
    transaction.onabort = () => reject(transaction.error ?? new Error("Lecture IndexedDB interrompue"));
    request.onsuccess = () => resolve(request.result);
  }), "Lecture IndexedDB trop longue");
}

async function writeIndexedDb(state: AppState) {
  const database = await openDatabase();
  return withStorageTimeout(new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STATE_STORE, "readwrite");
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("Écriture IndexedDB impossible"));
    transaction.onabort = () => reject(transaction.error ?? new Error("Écriture IndexedDB interrompue"));
    transaction.objectStore(STATE_STORE).put(state, STATE_KEY);
  }), "Écriture IndexedDB trop longue");
}

function readFallback() {
  if (!canUseLocalStorage()) return undefined;
  try {
    const serialized = window.localStorage.getItem(FALLBACK_KEY);
    return serialized ? JSON.parse(serialized) as unknown : undefined;
  } catch {
    return undefined;
  }
}

function writeFallback(state: AppState) {
  if (!canUseLocalStorage()) return false;
  try {
    window.localStorage.setItem(FALLBACK_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export async function loadAppState(): Promise<LoadedState> {
  try {
    const raw = await readIndexedDb();
    const fallback = raw === undefined ? readFallback() : undefined;
    const normalized = normalizeState(raw ?? fallback);
    const recovered = raw !== undefined || fallback !== undefined ? normalized.recovered : false;
    if (raw === undefined || normalized.recovered) await writeIndexedDb(normalized.state);
    return { state: normalized.state, recovered, mode: "indexeddb" };
  } catch {
    const fallback = readFallback();
    const normalized = normalizeState(fallback);
    return { state: normalized.state, recovered: fallback === undefined ? false : normalized.recovered, mode: canUseLocalStorage() ? "localStorage" : "memory" };
  }
}

async function persistAppState(state: AppState): Promise<PersistenceMode> {
  try {
    await writeIndexedDb(state);
    return "indexeddb";
  } catch {
    return writeFallback(state) ? "localStorage" : "memory";
  }
}

export function saveAppState(state: AppState): Promise<PersistenceMode> {
  const queuedSave = saveQueue.then(() => persistAppState(state), () => persistAppState(state));
  saveQueue = queuedSave.then(() => undefined, () => undefined);
  return queuedSave;
}
