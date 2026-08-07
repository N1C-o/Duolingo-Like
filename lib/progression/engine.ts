import { content, getLesson, getUnit } from "@/content";
import type { Exercise, ExerciseAnswer, LessonContent, ProfileId, UnitContent } from "@/lib/content/types";
import type {
  AppState,
  ConceptStat,
  ExerciseStat,
  LessonSession,
  LocalProfile,
  ProfilePreferences,
  ProfileProgress,
  RewardSummary,
  SpeechRate
} from "@/lib/progression/types";

export const PROGRESSION_RULES = {
  schemaVersion: 1,
  exerciseFirstCompletionXp: 5,
  firstSubmissionCorrectBonusXp: 2,
  exerciseReplayXp: 1,
  lessonCompletionXp: 20,
  unitCompletionXp: 50,
  replayDailyXpCap: 5,
  xpPerLevel: 100,
  consolidationMinErrors: 2,
  consolidationErrorRateAttempts: 4,
  consolidationErrorRate: 0.5,
  consolidationSuccesses: 3,
  consolidationExerciseTypes: 2
} as const;

const defaultPreferences: ProfilePreferences = {
  soundsEnabled: true,
  autoPlay: false,
  speechRate: 0.9,
  reducedMotion: false
};

function nowIso() {
  return new Date().toISOString();
}

function dateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function createEmptyProgress(): ProfileProgress {
  return {
    xpTotal: 0,
    completedLessonIds: [],
    completedUnitIds: [],
    startedLessonIds: [],
    completedExerciseIds: [],
    unlockedUnitIds: [content.course.unitIds[0]],
    parentUnlockedUnitIds: [],
    lessonSessions: {},
    exerciseStats: {},
    conceptStats: {},
    badgeIds: [],
    replayXpByDay: {},
    audioListenCount: 0,
    revisionCompletedCount: 0,
    consolidatedConceptIds: [],
    lastActivityAt: null
  };
}

export function createProfile(profileId: ProfileId): LocalProfile {
  return {
    id: profileId,
    themeId: profileId,
    firstUsedAt: null,
    preferences: { ...defaultPreferences },
    progress: createEmptyProgress()
  };
}

export function createInitialAppState(): AppState {
  return {
    schemaVersion: PROGRESSION_RULES.schemaVersion,
    contentVersion: content.course.contentVersion,
    activeProfileId: null,
    introSeen: false,
    profiles: {
      gabriel: createProfile("gabriel"),
      luca: createProfile("luca")
    }
  };
}

export function getLevel(xpTotal: number) {
  return Math.floor(Math.max(0, xpTotal) / PROGRESSION_RULES.xpPerLevel) + 1;
}

export function getLevelProgress(xpTotal: number) {
  const level = getLevel(xpTotal);
  const levelStart = (level - 1) * PROGRESSION_RULES.xpPerLevel;
  const current = Math.max(0, xpTotal - levelStart);
  return {
    level,
    current,
    next: PROGRESSION_RULES.xpPerLevel,
    percentage: Math.min(100, Math.round((current / PROGRESSION_RULES.xpPerLevel) * 100))
  };
}

function isUnitComplete(progress: ProfileProgress, unitId: string) {
  const unit = getUnit(unitId);
  return unit.lessonIds.every((lessonId) => progress.completedLessonIds.includes(lessonId));
}

function isUnitUnlocked(progress: ProfileProgress, unit: UnitContent) {
  return unit.prerequisiteUnitIds.every((prerequisiteId) => isUnitComplete(progress, prerequisiteId)) ||
    progress.parentUnlockedUnitIds.includes(unit.id);
}

function refreshUnlocks(progress: ProfileProgress) {
  progress.unlockedUnitIds = content.units.filter((unit) => isUnitUnlocked(progress, unit)).map((unit) => unit.id);
}

export type LessonStatus = "locked" | "available" | "in-progress" | "completed";
export type UnitStatus = "locked" | "available" | "in-progress" | "completed";

export function getLessonStatus(progress: ProfileProgress, lesson: LessonContent): LessonStatus {
  if (progress.completedLessonIds.includes(lesson.id)) return "completed";
  if (progress.lessonSessions[lesson.id]) return "in-progress";
  const unit = getUnit(lesson.unitId);
  if (!isUnitUnlocked(progress, unit)) return "locked";
  return lesson.prerequisiteLessonIds.every((prerequisiteId) => progress.completedLessonIds.includes(prerequisiteId)) ? "available" : "locked";
}

export function getUnitStatus(progress: ProfileProgress, unit: UnitContent): UnitStatus {
  if (isUnitComplete(progress, unit.id)) return "completed";
  if (!isUnitUnlocked(progress, unit)) return "locked";
  if (unit.lessonIds.some((lessonId) => progress.startedLessonIds.includes(lessonId))) return "in-progress";
  return "available";
}

export function getLessonResumeIndex(progress: ProfileProgress, lesson: LessonContent) {
  const session = progress.lessonSessions[lesson.id];
  if (!session) return 0;
  return Math.min(Math.max(0, session.currentExerciseIndex), lesson.exercises.length - 1);
}

export function getRecommendedLesson(progress: ProfileProgress) {
  const candidate = content.lessons.find((lesson) => {
    const status = getLessonStatus(progress, lesson);
    return status === "available" || status === "in-progress";
  });
  return candidate ?? content.lessons.find((lesson) => progress.completedLessonIds.includes(lesson.id)) ?? content.lessons[0];
}

function emptyExerciseStat(): ExerciseStat {
  return { attempts: 0, errors: 0, successes: 0, lastAttemptAt: null, lastErrorAt: null };
}

function emptyConceptStat(): ConceptStat {
  return { ...emptyExerciseStat(), consecutiveCorrect: 0, exerciseTypes: [], recoveredAfterError: false, needsConsolidation: false, consolidated: false };
}

function sameStringArray(left: string[], right: string[]) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function matchingAnswerIsComplete(exercise: Extract<Exercise, { type: "english-french-matching" | "image-word-matching" }>, answer: ExerciseAnswer) {
  if (answer.type !== "matching" || answer.pairs.length !== exercise.pairs.length) return false;
  const expectedIds = new Set(exercise.pairs.map((pair) => pair.id));
  const leftIds = new Set(answer.pairs.map((pair) => pair.leftId));
  const rightIds = new Set(answer.pairs.map((pair) => pair.rightId));
  return leftIds.size === expectedIds.size && rightIds.size === expectedIds.size && answer.pairs.every((pair) => expectedIds.has(pair.leftId) && expectedIds.has(pair.rightId) && pair.leftId === pair.rightId);
}

function memoryAnswerIsComplete(exercise: Extract<Exercise, { type: "memory" }>, answer: ExerciseAnswer) {
  if (answer.type !== "memory" || answer.pairs.length !== exercise.cards.length / 2) return false;
  const cardsById = new Map(exercise.cards.map((card) => [card.id, card]));
  const usedIds = new Set<string>();
  const validPairs = answer.pairs.every((pair) => {
    const first = cardsById.get(pair.firstId);
    const second = cardsById.get(pair.secondId);
    if (!first || !second || first.id === second.id || first.matchId !== second.matchId || usedIds.has(first.id) || usedIds.has(second.id)) return false;
    usedIds.add(first.id);
    usedIds.add(second.id);
    return true;
  });
  return validPairs && usedIds.size === exercise.cards.length;
}

export function evaluateExerciseAnswer(exercise: Exercise, answer: ExerciseAnswer) {
  if (exercise.type === "multiple-choice" || exercise.type === "guided-translation" || exercise.type === "listening-choice" || exercise.type === "sentence-completion" || exercise.type === "dialogue") {
    return answer.type === "choice" && answer.optionId === exercise.correctOptionId;
  }
  if (exercise.type === "true-false") return answer.type === "boolean" && answer.value === exercise.correct;
  if (exercise.type === "listening") return answer.type === "listening" && answer.listened;
  if (exercise.type === "reorder") return answer.type === "reorder" && exercise.acceptedOrders.some((order) => sameStringArray(order, answer.tokens));
  if (exercise.type === "english-french-matching" || exercise.type === "image-word-matching") return matchingAnswerIsComplete(exercise, answer);
  if (exercise.type === "memory") return memoryAnswerIsComplete(exercise, answer);
  return false;
}

function ensureSession(progress: ProfileProgress, lesson: LessonContent): LessonSession {
  const session = progress.lessonSessions[lesson.id];
  if (session) return session;
  const created: LessonSession = {
    lessonId: lesson.id,
    isReplay: progress.completedLessonIds.includes(lesson.id),
    currentExerciseIndex: 0,
    submittedExerciseIds: [],
    completedExerciseIds: [],
    startedAt: nowIso(),
    updatedAt: nowIso()
  };
  progress.lessonSessions[lesson.id] = created;
  return created;
}

function rewardSummary(beforeXp: number, progress: ProfileProgress, overrides: Partial<RewardSummary> = {}): RewardSummary {
  return {
    xpGained: progress.xpTotal - beforeXp,
    newlyAwardedBadgeIds: [],
    completedLesson: false,
    completedUnit: false,
    unlockedUnitIds: [...progress.unlockedUnitIds],
    levelBefore: getLevel(beforeXp),
    levelAfter: getLevel(progress.xpTotal),
    ...overrides
  };
}

function badgeConditionMet(badgeId: string, progress: ProfileProgress) {
  const badge = content.badges.find((candidate) => candidate.id === badgeId);
  if (!badge) return false;
  const condition = badge.condition;
  if (condition.type === "lesson-completed") return progress.completedLessonIds.includes(condition.lessonId);
  if (condition.type === "unit-completed") return progress.completedUnitIds.includes(condition.unitId);
  if (condition.type === "lessons-completed-count") return progress.completedLessonIds.length >= condition.count;
  if (condition.type === "audio-listens-count") return progress.audioListenCount >= condition.count;
  if (condition.type === "revision-completed-count") return progress.revisionCompletedCount >= condition.count;
  return progress.consolidatedConceptIds.length > 0;
}

function awardBadges(progress: ProfileProgress) {
  const newlyAwardedBadgeIds: string[] = [];
  content.badges.forEach((badge) => {
    if (!progress.badgeIds.includes(badge.id) && badgeConditionMet(badge.id, progress)) {
      progress.badgeIds.push(badge.id);
      newlyAwardedBadgeIds.push(badge.id);
    }
  });
  return newlyAwardedBadgeIds;
}

export function activateProfile(state: AppState, profileId: ProfileId): AppState {
  const next = clone(state);
  const profile = next.profiles[profileId];
  profile.firstUsedAt ??= nowIso();
  next.activeProfileId = profileId;
  refreshUnlocks(profile.progress);
  return next;
}

export function startLesson(state: AppState, profileId: ProfileId, lessonId: string): AppState {
  const next = clone(state);
  const profile = next.profiles[profileId];
  const lesson = getLesson(lessonId);
  if (getLessonStatus(profile.progress, lesson) === "locked") return state;
  if (!profile.progress.startedLessonIds.includes(lessonId)) profile.progress.startedLessonIds.push(lessonId);
  ensureSession(profile.progress, lesson);
  profile.progress.lastActivityAt = nowIso();
  refreshUnlocks(profile.progress);
  return next;
}

function updateExerciseStats(profile: LocalProfile, exercise: Exercise, correct: boolean, timestamp: string) {
  const progress = profile.progress;
  const exerciseStat = progress.exerciseStats[exercise.id] ?? emptyExerciseStat();
  exerciseStat.attempts += 1;
  if (correct) exerciseStat.successes += 1;
  else {
    exerciseStat.errors += 1;
    exerciseStat.lastErrorAt = timestamp;
  }
  exerciseStat.lastAttemptAt = timestamp;
  progress.exerciseStats[exercise.id] = exerciseStat;

  exercise.conceptIds.forEach((conceptId) => {
    const conceptStat = progress.conceptStats[conceptId] ?? emptyConceptStat();
    const hadErrorBefore = conceptStat.errors > 0;
    conceptStat.attempts += 1;
    if (correct) {
      conceptStat.successes += 1;
      conceptStat.consecutiveCorrect += 1;
      if (hadErrorBefore) conceptStat.recoveredAfterError = true;
    } else {
      conceptStat.errors += 1;
      conceptStat.consecutiveCorrect = 0;
      conceptStat.lastErrorAt = timestamp;
    }
    if (!conceptStat.exerciseTypes.includes(exercise.type)) conceptStat.exerciseTypes.push(exercise.type);
    conceptStat.lastAttemptAt = timestamp;
    conceptStat.needsConsolidation = conceptStat.errors >= PROGRESSION_RULES.consolidationMinErrors ||
      (conceptStat.attempts >= PROGRESSION_RULES.consolidationErrorRateAttempts && conceptStat.errors / conceptStat.attempts >= PROGRESSION_RULES.consolidationErrorRate);
    conceptStat.consolidated = conceptStat.successes >= PROGRESSION_RULES.consolidationSuccesses &&
      conceptStat.exerciseTypes.length >= PROGRESSION_RULES.consolidationExerciseTypes &&
      conceptStat.recoveredAfterError;
    progress.conceptStats[conceptId] = conceptStat;
    if (conceptStat.consolidated && !progress.consolidatedConceptIds.includes(conceptId)) progress.consolidatedConceptIds.push(conceptId);
  });
}

function recordExerciseAttempt(state: AppState, profileId: ProfileId, lessonId: string, exerciseId: string, answer: ExerciseAnswer, completesExercise: boolean) {
  const next = clone(state);
  const profile = next.profiles[profileId];
  const lesson = getLesson(lessonId);
  const exercise = lesson.exercises.find((candidate) => candidate.id === exerciseId);
  if (!exercise) throw new Error(`Exercice inconnu : ${exerciseId}`);
  const session = ensureSession(profile.progress, lesson);
  const timestamp = nowIso();
  const correct = evaluateExerciseAnswer(exercise, answer);
  const firstSubmission = !session.submittedExerciseIds.includes(exerciseId);
  const firstExerciseCompletion = completesExercise && !session.completedExerciseIds.includes(exerciseId);
  const everCompleted = profile.progress.completedExerciseIds.includes(exerciseId);
  const beforeXp = profile.progress.xpTotal;

  if (firstSubmission) session.submittedExerciseIds.push(exerciseId);
  if (firstExerciseCompletion) {
    session.completedExerciseIds.push(exerciseId);
    if (!everCompleted) {
      profile.progress.completedExerciseIds.push(exerciseId);
      profile.progress.xpTotal += PROGRESSION_RULES.exerciseFirstCompletionXp;
      if (correct) profile.progress.xpTotal += PROGRESSION_RULES.firstSubmissionCorrectBonusXp;
    } else {
      const replayKey = `${dateKey()}:${lessonId}`;
      const replayEarned = profile.progress.replayXpByDay[replayKey] ?? 0;
      const replayReward = Math.min(PROGRESSION_RULES.exerciseReplayXp, PROGRESSION_RULES.replayDailyXpCap - replayEarned);
      if (replayReward > 0) {
        profile.progress.xpTotal += replayReward;
        profile.progress.replayXpByDay[replayKey] = replayEarned + replayReward;
      }
    }
  }

  updateExerciseStats(profile, exercise, correct, timestamp);
  if (firstExerciseCompletion && !everCompleted && correct && exercise.isRevisionActivity) profile.progress.revisionCompletedCount += 1;
  session.updatedAt = timestamp;
  profile.progress.lastActivityAt = timestamp;
  const newlyAwardedBadgeIds = awardBadges(profile.progress);
  refreshUnlocks(profile.progress);
  return {
    state: next,
    reward: rewardSummary(beforeXp, profile.progress, { newlyAwardedBadgeIds }),
    firstSubmission,
    correct
  };
}

export function recordExerciseAnswer(state: AppState, profileId: ProfileId, lessonId: string, exerciseId: string, answer: ExerciseAnswer) {
  return recordExerciseAttempt(state, profileId, lessonId, exerciseId, answer, true);
}

export function recordExerciseError(state: AppState, profileId: ProfileId, lessonId: string, exerciseId: string, answer: ExerciseAnswer) {
  const lesson = getLesson(lessonId);
  const exercise = lesson.exercises.find((candidate) => candidate.id === exerciseId);
  if (!exercise) throw new Error(`Exercice inconnu : ${exerciseId}`);
  if (evaluateExerciseAnswer(exercise, answer)) return { state, reward: rewardSummary(state.profiles[profileId].progress.xpTotal, state.profiles[profileId].progress), firstSubmission: false, correct: true };
  return recordExerciseAttempt(state, profileId, lessonId, exerciseId, answer, false);
}

export function advanceLesson(state: AppState, profileId: ProfileId, lessonId: string) {
  const next = clone(state);
  const profile = next.profiles[profileId];
  const lesson = getLesson(lessonId);
  const session = profile.progress.lessonSessions[lessonId];
  if (!session) return { state, reward: rewardSummary(profile.progress.xpTotal, profile.progress), completed: false };
  const currentExercise = lesson.exercises[session.currentExerciseIndex];
  if (!currentExercise || !session.completedExerciseIds.includes(currentExercise.id)) {
    return { state, reward: rewardSummary(profile.progress.xpTotal, profile.progress), completed: false };
  }

  const beforeXp = profile.progress.xpTotal;
  if (session.currentExerciseIndex < lesson.exercises.length - 1) {
    session.currentExerciseIndex += 1;
    session.updatedAt = nowIso();
    profile.progress.lastActivityAt = session.updatedAt;
    return { state: next, reward: rewardSummary(beforeXp, profile.progress), completed: false };
  }

  const wasCompleted = profile.progress.completedLessonIds.includes(lessonId);
  if (!wasCompleted) {
    profile.progress.completedLessonIds.push(lessonId);
    profile.progress.xpTotal += PROGRESSION_RULES.lessonCompletionXp;
  }

  const unit = getUnit(lesson.unitId);
  const unitWasComplete = profile.progress.completedUnitIds.includes(unit.id);
  const unitIsComplete = unit.lessonIds.every((id) => profile.progress.completedLessonIds.includes(id));
  let completedUnit = false;
  if (!unitWasComplete && unitIsComplete) {
    profile.progress.completedUnitIds.push(unit.id);
    profile.progress.xpTotal += PROGRESSION_RULES.unitCompletionXp;
    completedUnit = true;
  }

  delete profile.progress.lessonSessions[lessonId];
  profile.progress.lastActivityAt = nowIso();
  const newlyAwardedBadgeIds = awardBadges(profile.progress);
  refreshUnlocks(profile.progress);
  return {
    state: next,
    reward: rewardSummary(beforeXp, profile.progress, {
      newlyAwardedBadgeIds,
      completedLesson: !wasCompleted,
      completedUnit
    }),
    completed: true
  };
}

export function recordAudioListen(state: AppState, profileId: ProfileId) {
  const next = clone(state);
  const profile = next.profiles[profileId];
  profile.progress.audioListenCount += 1;
  profile.progress.lastActivityAt = nowIso();
  const newlyAwardedBadgeIds = awardBadges(profile.progress);
  return { state: next, newlyAwardedBadgeIds };
}

export function updatePreferences(state: AppState, profileId: ProfileId, preferences: Partial<ProfilePreferences>) {
  const next = clone(state);
  next.profiles[profileId].preferences = { ...next.profiles[profileId].preferences, ...preferences };
  return next;
}

export function unlockUnitForParent(state: AppState, profileId: ProfileId, unitId: string, unlocked: boolean) {
  const next = clone(state);
  const progress = next.profiles[profileId].progress;
  const unlockedIds = new Set(progress.parentUnlockedUnitIds);
  if (unlocked) unlockedIds.add(unitId);
  else unlockedIds.delete(unitId);
  progress.parentUnlockedUnitIds = Array.from(unlockedIds);
  refreshUnlocks(progress);
  return next;
}

export function resetProfile(state: AppState, profileId: ProfileId) {
  const next = clone(state);
  next.profiles[profileId] = createProfile(profileId);
  if (next.activeProfileId === profileId) next.activeProfileId = null;
  return next;
}

export function getTopConsolidationConcepts(progress: ProfileProgress) {
  return Object.entries(progress.conceptStats)
    .filter(([, stat]) => stat.needsConsolidation && !stat.consolidated)
    .sort(([, a], [, b]) => b.errors - a.errors || b.attempts - a.attempts)
    .slice(0, 3)
    .map(([conceptId, stat]) => ({ conceptId, stat }));
}
