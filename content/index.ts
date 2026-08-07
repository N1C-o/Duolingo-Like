import rawBadges from "@/content/badges.json";
import rawCourse from "@/content/course.json";
import rawFamily from "@/content/units/family.json";
import rawFamily01 from "@/content/lessons/family-01.json";
import rawFamily02 from "@/content/lessons/family-02.json";
import rawFamily03 from "@/content/lessons/family-03.json";
import rawGabrielTheme from "@/content/themes/gabriel.json";
import rawHello from "@/content/units/hello.json";
import rawHello01 from "@/content/lessons/hello-01.json";
import rawHello02 from "@/content/lessons/hello-02.json";
import rawLucaTheme from "@/content/themes/luca.json";
import rawVocabulary from "@/content/vocabulary.json";
import type {
  BadgeDefinition,
  ContentBundle,
  Exercise,
  ExerciseType,
  LessonContent,
  ProfileId,
  ThemeContent,
  UnitContent
} from "@/lib/content/types";

const exerciseTypes: ExerciseType[] = [
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
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertContent(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Contenu invalide : ${message}`);
  }
}

function assertStringArray(value: unknown, message: string) {
  assertContent(Array.isArray(value) && value.every((item) => typeof item === "string"), message);
}

function validateExercise(exercise: Exercise) {
  assertContent(typeof exercise.id === "string" && exercise.id.length > 0, "un exercice doit avoir un identifiant");
  assertContent(exerciseTypes.includes(exercise.type), `${exercise.id} utilise un type inconnu`);
  assertContent(typeof exercise.instruction === "string" && typeof exercise.prompt === "string", `${exercise.id} doit avoir une consigne et un prompt`);
  assertStringArray(exercise.conceptIds, `${exercise.id} doit référencer ses notions`);
  assertContent(typeof exercise.explanation === "string" && exercise.explanation.length > 0, `${exercise.id} doit avoir une correction`);
  if ("isRevisionActivity" in exercise) assertContent(typeof exercise.isRevisionActivity === "boolean", `${exercise.id} a un indicateur de révision invalide`);

  if (["listening", "listening-choice"].includes(exercise.type)) {
    assertContent(typeof exercise.audioText === "string" && exercise.audioText.length > 0, `${exercise.id} doit avoir un texte vocal`);
  }

  if (hasOptions(exercise)) {
    assertContent(Array.isArray(exercise.options) && exercise.options.length >= 2, `${exercise.id} doit avoir au moins deux propositions`);
    assertContent(exercise.options.every((option) => typeof option.id === "string" && typeof option.label === "string"), `${exercise.id} a une proposition invalide`);
    assertContent(exercise.options.some((option) => option.id === exercise.correctOptionId), `${exercise.id} référence une bonne réponse absente`);
  }

  if (exercise.type === "english-french-matching" || exercise.type === "image-word-matching") {
    assertContent(Array.isArray(exercise.pairs) && exercise.pairs.length >= 2, `${exercise.id} doit avoir au moins deux paires`);
    assertContent(exercise.pairs.every((pair) => pair.id && pair.left && pair.right), `${exercise.id} a une paire invalide`);
  }

  if (exercise.type === "reorder") {
    assertContent(Array.isArray(exercise.tokens) && exercise.tokens.length >= 2, `${exercise.id} doit avoir des mots à remettre en ordre`);
    assertContent(Array.isArray(exercise.acceptedOrders) && exercise.acceptedOrders.length > 0, `${exercise.id} doit avoir un ordre attendu`);
  }

  if (exercise.type === "sentence-completion") {
    assertContent(typeof exercise.sentence === "string" && exercise.sentence.includes("___"), `${exercise.id} doit indiquer le mot manquant`);
  }

  if (exercise.type === "listening") {
    assertContent(typeof exercise.answerLabel === "string" && exercise.answerLabel.length > 0, `${exercise.id} doit avoir un bouton de validation`);
  }

  if (exercise.type === "dialogue") {
    assertContent(Array.isArray(exercise.lines) && exercise.lines.length >= 2, `${exercise.id} doit avoir un dialogue`);
  }

  if (exercise.type === "memory") {
    assertContent(Array.isArray(exercise.cards) && exercise.cards.length >= 4 && exercise.cards.length % 2 === 0, `${exercise.id} doit avoir un nombre pair de cartes`);
    const matchCounts = new Map<string, number>();
    exercise.cards.forEach((card) => matchCounts.set(card.matchId, (matchCounts.get(card.matchId) ?? 0) + 1));
    assertContent(Array.from(matchCounts.values()).every((count) => count === 2), `${exercise.id} doit former des paires de deux cartes`);
  }

  if (exercise.type === "true-false") {
    assertContent(typeof exercise.statement === "string" && typeof exercise.correct === "boolean", `${exercise.id} doit avoir une affirmation et une réponse booléenne`);
  }
}

function hasOptions(exercise: Exercise): exercise is Exercise & { options: Array<{ id: string; label: string }>; correctOptionId: string } {
  return ["multiple-choice", "guided-translation", "listening-choice", "sentence-completion", "dialogue"].includes(exercise.type);
}

function validateNoCycles<T extends { id: string; prerequisiteLessonIds?: string[]; prerequisiteUnitIds?: string[] }>(items: T[], getPrerequisites: (item: T) => string[]) {
  const byId = new Map(items.map((item) => [item.id, item]));
  const visiting = new Set<string>();
  const visited = new Set<string>();

  const visit = (id: string) => {
    if (visiting.has(id)) throw new Error(`Contenu invalide : cycle de prérequis autour de ${id}`);
    if (visited.has(id)) return;
    const item = byId.get(id);
    assertContent(item, `prérequis inconnu ${id}`);
    visiting.add(id);
    getPrerequisites(item).forEach((prerequisiteId) => {
      assertContent(byId.has(prerequisiteId), `${id} référence un prérequis inconnu ${prerequisiteId}`);
      visit(prerequisiteId);
    });
    visiting.delete(id);
    visited.add(id);
  };

  items.forEach((item) => visit(item.id));
}

export function validateContent(bundle: ContentBundle) {
  assertContent(bundle.course.id && bundle.course.contentVersion, "le parcours doit être versionné");
  const unitIds = new Set(bundle.units.map((unit) => unit.id));
  const lessonIds = new Set(bundle.lessons.map((lesson) => lesson.id));
  const badgeIds = new Set(bundle.badges.map((badge) => badge.id));
  const themeIds = new Set(bundle.themes.map((theme) => theme.id));

  assertContent(bundle.course.unitIds.every((id) => unitIds.has(id)), "le parcours référence une unité absente");
  assertContent(bundle.course.badgeIds.every((id) => badgeIds.has(id)), "le parcours référence un badge absent");
  assertContent(themeIds.has("gabriel") && themeIds.has("luca"), "les thèmes initiaux sont obligatoires");

  const exerciseIds = new Set<string>();
  bundle.units.forEach((unit) => {
    assertContent(unit.courseId === bundle.course.id, `${unit.id} n’appartient pas au parcours`);
    assertContent(unit.lessonIds.every((id) => lessonIds.has(id)), `${unit.id} référence une leçon absente`);
  });

  bundle.lessons.forEach((lesson) => {
    assertContent(lesson.courseId === bundle.course.id, `${lesson.id} n’appartient pas au parcours`);
    assertContent(unitIds.has(lesson.unitId), `${lesson.id} référence une unité absente`);
    assertContent(lesson.exercises.length >= 5 && lesson.exercises.length <= 8, `${lesson.id} doit contenir entre 5 et 8 exercices`);
    assertContent(lesson.newConceptIds.length <= 3, `${lesson.id} introduit trop de notions nouvelles`);
    lesson.exercises.forEach((exercise) => {
      assertContent(!exerciseIds.has(exercise.id), `identifiant d’exercice dupliqué : ${exercise.id}`);
      exerciseIds.add(exercise.id);
      validateExercise(exercise);
    });
  });

  bundle.badges.forEach((badge) => assertContent(typeof badge.title === "string" && badge.condition.type, `${badge.id} est incomplet`));
  validateNoCycles(bundle.units, (unit) => unit.prerequisiteUnitIds);
  validateNoCycles(bundle.lessons, (lesson) => lesson.prerequisiteLessonIds);
}

export const content: ContentBundle = {
  course: rawCourse as ContentBundle["course"],
  units: [rawHello, rawFamily] as unknown as UnitContent[],
  lessons: [rawHello01, rawHello02, rawFamily01, rawFamily02, rawFamily03] as unknown as LessonContent[],
  vocabulary: rawVocabulary as ContentBundle["vocabulary"],
  badges: rawBadges as BadgeDefinition[],
  themes: [rawGabrielTheme, rawLucaTheme] as unknown as ThemeContent[]
};

validateContent(content);

const unitsById = new Map(content.units.map((unit) => [unit.id, unit]));
const lessonsById = new Map(content.lessons.map((lesson) => [lesson.id, lesson]));
const themesById = new Map(content.themes.map((theme) => [theme.id, theme]));

export function getUnit(unitId: string): UnitContent {
  const unit = unitsById.get(unitId);
  if (!unit) throw new Error(`Unité inconnue : ${unitId}`);
  return unit;
}

export function getLesson(lessonId: string): LessonContent {
  const lesson = lessonsById.get(lessonId);
  if (!lesson) throw new Error(`Leçon inconnue : ${lessonId}`);
  return lesson;
}

export function getTheme(themeId: ProfileId): ThemeContent {
  const theme = themesById.get(themeId);
  if (!theme) throw new Error(`Thème inconnu : ${themeId}`);
  return theme;
}

export function getLessonsForUnit(unitId: string) {
  return getUnit(unitId).lessonIds.map(getLesson);
}

export function getVocabularyForUnit(unitId: string) {
  const vocabularyById = new Map(content.vocabulary.map((item) => [item.id, item]));
  return getUnit(unitId).vocabularyIds.flatMap((id) => {
    const item = vocabularyById.get(id);
    return item ? [item] : [];
  });
}
