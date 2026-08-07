import type { ExerciseType, ProfileId, ThemeId } from "@/lib/content/types";

export type SpeechRate = 0.75 | 0.9 | 1;

export type ProfilePreferences = {
  soundsEnabled: boolean;
  autoPlay: boolean;
  speechRate: SpeechRate;
  reducedMotion: boolean;
};

export type ExerciseStat = {
  attempts: number;
  errors: number;
  successes: number;
  lastAttemptAt: string | null;
  lastErrorAt: string | null;
};

export type ConceptStat = ExerciseStat & {
  consecutiveCorrect: number;
  exerciseTypes: ExerciseType[];
  recoveredAfterError: boolean;
  needsConsolidation: boolean;
  consolidated: boolean;
};

export type LessonSession = {
  lessonId: string;
  isReplay: boolean;
  currentExerciseIndex: number;
  submittedExerciseIds: string[];
  completedExerciseIds: string[];
  startedAt: string;
  updatedAt: string;
};

export type ProfileProgress = {
  xpTotal: number;
  completedLessonIds: string[];
  completedUnitIds: string[];
  startedLessonIds: string[];
  completedExerciseIds: string[];
  unlockedUnitIds: string[];
  parentUnlockedUnitIds: string[];
  lessonSessions: Record<string, LessonSession>;
  exerciseStats: Record<string, ExerciseStat>;
  conceptStats: Record<string, ConceptStat>;
  badgeIds: string[];
  replayXpByDay: Record<string, number>;
  audioListenCount: number;
  revisionCompletedCount: number;
  consolidatedConceptIds: string[];
  lastActivityAt: string | null;
};

export type LocalProfile = {
  id: ProfileId;
  themeId: ThemeId;
  firstUsedAt: string | null;
  preferences: ProfilePreferences;
  progress: ProfileProgress;
};

export type AppState = {
  schemaVersion: number;
  contentVersion: string;
  activeProfileId: ProfileId | null;
  introSeen: boolean;
  profiles: Record<ProfileId, LocalProfile>;
};

export type RewardSummary = {
  xpGained: number;
  newlyAwardedBadgeIds: string[];
  completedLesson: boolean;
  completedUnit: boolean;
  unlockedUnitIds: string[];
  levelBefore: number;
  levelAfter: number;
};
