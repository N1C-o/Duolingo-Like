export type ProfileId = "gabriel" | "luca";
export type ThemeId = "gabriel" | "luca";

export type ExerciseType =
  | "multiple-choice"
  | "english-french-matching"
  | "image-word-matching"
  | "reorder"
  | "guided-translation"
  | "listening"
  | "listening-choice"
  | "sentence-completion"
  | "dialogue"
  | "memory"
  | "true-false";

export type ChoiceOption = {
  id: string;
  label: string;
  detail?: string;
  emoji?: string;
};

export type ExerciseBase = {
  id: string;
  schemaVersion: number;
  type: ExerciseType;
  instruction: string;
  prompt: string;
  audioText?: string;
  conceptIds: string[];
  explanation: string;
  hint?: string;
  isRevisionActivity?: boolean;
};

export type MultipleChoiceExercise = ExerciseBase & {
  type: "multiple-choice";
  options: ChoiceOption[];
  correctOptionId: string;
};

export type MatchingPair = {
  id: string;
  left: string;
  right: string;
};

export type MatchingExercise = ExerciseBase & {
  type: "english-french-matching" | "image-word-matching";
  pairs: MatchingPair[];
};

export type ReorderExercise = ExerciseBase & {
  type: "reorder";
  tokens: string[];
  acceptedOrders: string[][];
};

export type GuidedTranslationExercise = ExerciseBase & {
  type: "guided-translation";
  options: ChoiceOption[];
  correctOptionId: string;
};

export type ListeningExercise = ExerciseBase & {
  type: "listening";
  answerLabel: string;
};

export type ListeningChoiceExercise = ExerciseBase & {
  type: "listening-choice";
  options: ChoiceOption[];
  correctOptionId: string;
};

export type SentenceCompletionExercise = ExerciseBase & {
  type: "sentence-completion";
  sentence: string;
  options: ChoiceOption[];
  correctOptionId: string;
};

export type DialogueLine = {
  speaker: string;
  text: string;
  translation?: string;
};

export type DialogueExercise = ExerciseBase & {
  type: "dialogue";
  lines: DialogueLine[];
  options: ChoiceOption[];
  correctOptionId: string;
};

export type MemoryCard = {
  id: string;
  label: string;
  matchId: string;
  emoji?: string;
};

export type MemoryExercise = ExerciseBase & {
  type: "memory";
  cards: MemoryCard[];
};

export type TrueFalseExercise = ExerciseBase & {
  type: "true-false";
  statement: string;
  correct: boolean;
};

export type Exercise =
  | MultipleChoiceExercise
  | MatchingExercise
  | ReorderExercise
  | GuidedTranslationExercise
  | ListeningExercise
  | ListeningChoiceExercise
  | SentenceCompletionExercise
  | DialogueExercise
  | MemoryExercise
  | TrueFalseExercise;

export type VocabularyItem = {
  id: string;
  schemaVersion: number;
  english: string;
  french: string;
  category: string;
  example: string;
  audioText: string;
};

export type LessonContent = {
  id: string;
  schemaVersion: number;
  courseId: string;
  unitId: string;
  order: number;
  title: string;
  objective: string;
  durationMinutes: number;
  difficulty: 1 | 2 | 3;
  newConceptIds: string[];
  reviewConceptIds: string[];
  prerequisiteLessonIds: string[];
  exercises: Exercise[];
};

export type UnitContent = {
  id: string;
  schemaVersion: number;
  courseId: string;
  order: number;
  title: string;
  shortTitle: string;
  topic: string;
  objective: string;
  difficulty: 1 | 2 | 3;
  prerequisiteUnitIds: string[];
  lessonIds: string[];
  vocabularyIds: string[];
  rewardTitle: string;
};

export type CourseContent = {
  id: string;
  schemaVersion: number;
  contentVersion: string;
  title: string;
  description: string;
  unitIds: string[];
  badgeIds: string[];
};

export type BadgeCondition =
  | { type: "lesson-completed"; lessonId: string }
  | { type: "unit-completed"; unitId: string }
  | { type: "lessons-completed-count"; count: number }
  | { type: "audio-listens-count"; count: number }
  | { type: "revision-completed-count"; count: number }
  | { type: "consolidation-success" };

export type BadgeDefinition = {
  id: string;
  schemaVersion: number;
  title: string;
  description: string;
  emoji: string;
  condition: BadgeCondition;
};

export type ThemeContent = {
  id: ThemeId;
  profileId: ProfileId;
  name: string;
  universe: string;
  greeting: string;
  subtitle: string;
  unitLead: string;
  currencyLabel: string;
  encouragements: string[];
  assets: {
    journey: string;
    hero: string;
    mascot: string;
  };
};

export type ContentBundle = {
  course: CourseContent;
  units: UnitContent[];
  lessons: LessonContent[];
  vocabulary: VocabularyItem[];
  badges: BadgeDefinition[];
  themes: ThemeContent[];
};

export type ChoiceAnswer = {
  type: "choice";
  optionId: string;
};

export type BooleanAnswer = {
  type: "boolean";
  value: boolean;
};

export type ListeningAnswer = {
  type: "listening";
  listened: true;
};

export type ReorderAnswer = {
  type: "reorder";
  tokens: string[];
};

export type MatchingAnswer = {
  type: "matching";
  pairs: Array<{ leftId: string; rightId: string }>;
};

export type MemoryAnswer = {
  type: "memory";
  pairs: Array<{ firstId: string; secondId: string }>;
};

export type ExerciseAnswer = ChoiceAnswer | BooleanAnswer | ListeningAnswer | ReorderAnswer | MatchingAnswer | MemoryAnswer;
