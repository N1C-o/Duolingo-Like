import rawBadges from "@/content/badges.json";
import rawCourse from "@/content/course.json";
import rawFamily from "@/content/units/family.json";
import rawFamily01 from "@/content/lessons/family-01.json";
import rawFamily02 from "@/content/lessons/family-02.json";
import rawFamily03 from "@/content/lessons/family-03.json";
import rawHome from "@/content/units/home.json";
import rawHome01 from "@/content/lessons/home-01.json";
import rawHome02 from "@/content/lessons/home-02.json";
import rawHome03 from "@/content/lessons/home-03.json";
import rawSchoolPlay from "@/content/units/school-play.json";
import rawSchoolPlay01 from "@/content/lessons/school-play-01.json";
import rawSchoolPlay02 from "@/content/lessons/school-play-02.json";
import rawSchoolPlay03 from "@/content/lessons/school-play-03.json";
import rawFood from "@/content/units/food.json";
import rawFood01 from "@/content/lessons/food-01.json";
import rawFood02 from "@/content/lessons/food-02.json";
import rawFood03 from "@/content/lessons/food-03.json";
import rawLikes from "@/content/units/likes.json";
import rawLikes01 from "@/content/lessons/likes-01.json";
import rawLikes02 from "@/content/lessons/likes-02.json";
import rawLikes03 from "@/content/lessons/likes-03.json";
import rawDay from "@/content/units/day.json";
import rawDay01 from "@/content/lessons/day-01.json";
import rawDay02 from "@/content/lessons/day-02.json";
import rawDay03 from "@/content/lessons/day-03.json";
import rawNumbersColours from "@/content/units/numbers-colours.json";
import rawNumbersColours01 from "@/content/lessons/numbers-colours-01.json";
import rawNumbersColours02 from "@/content/lessons/numbers-colours-02.json";
import rawNumbersColours03 from "@/content/lessons/numbers-colours-03.json";
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

const responseModes = new Set(["recognition", "guided-production"]);
const readingModes = new Set(["word-recognition", "phrase-recognition", "audio-to-text", "word-order"]);
const phonologyFocuses = new Set(["greeting-rhythm", "question-intonation", "word-stress", "phrase-rhythm"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertContent(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Contenu invalide : ${message}`);
  }
}

function assertStringArray(value: unknown, message: string) {
  assertContent(Array.isArray(value) && value.every((item) => typeof item === "string" && item.length > 0), message);
}

function assertUniqueIds(items: Array<{ id: string }>, label: string) {
  const ids = items.map((item) => item.id);
  assertContent(ids.every((id) => typeof id === "string" && id.length > 0), `${label} doit avoir des identifiants non vides`);
  assertContent(new Set(ids).size === ids.length, `${label} contient un identifiant dupliqué`);
}

function validateSceneLine(value: unknown, message: string) {
  assertContent(isRecord(value), `${message} est invalide`);
  assertContent(typeof value.text === "string" && value.text.length > 0, `${message} doit avoir un texte`);
  if ("speaker" in value) assertContent(typeof value.speaker === "string" && value.speaker.length > 0, `${message} a un personnage invalide`);
  if ("translation" in value) assertContent(typeof value.translation === "string" && value.translation.length > 0, `${message} a une traduction invalide`);
}

function validateLessonExperience(lesson: LessonContent) {
  const scene = lesson.storyScene as unknown;
  assertContent(isRecord(scene), `${lesson.id} doit avoir une mini-scène`);
  assertContent(typeof scene.id === "string" && scene.id.length > 0, `${lesson.id} a une scène sans identifiant`);
  assertContent(typeof scene.situation === "string" && scene.situation.length > 0, `${lesson.id} doit décrire la situation de sa scène`);
  assertContent(Array.isArray(scene.setup) && scene.setup.length >= 1, `${lesson.id} doit avoir une entrée de scène`);
  scene.setup.forEach((line, index) => validateSceneLine(line, `${lesson.id} scène setup ${index + 1}`));
  const childAction = isRecord(scene.childAction) ? scene.childAction : null;
  assertContent(childAction, `${lesson.id} doit avoir une action pour l’enfant`);
  assertContent(typeof childAction.instruction === "string" && childAction.instruction.length > 0, `${lesson.id} doit expliquer l’action de l’enfant`);
  assertContent(typeof childAction.exerciseId === "string" && lesson.exercises.some((exercise) => exercise.id === childAction.exerciseId), `${lesson.id} référence un exercice de scène absent`);
  assertContent(["choose", "construct", "respond"].includes(childAction.purpose as string), `${lesson.id} a un but de scène invalide`);
  assertContent(Array.isArray(scene.resolution) && scene.resolution.length >= 1, `${lesson.id} doit avoir une résolution de scène`);
  scene.resolution.forEach((line, index) => validateSceneLine(line, `${lesson.id} scène résolution ${index + 1}`));
  if ("nextHook" in scene) assertContent(typeof scene.nextHook === "string" && scene.nextHook.length > 0, `${lesson.id} a une accroche invalide`);

  const reading = lesson.readingCheckpoint as unknown;
  assertContent(isRecord(reading), `${lesson.id} doit avoir un point lecture-écoute`);
  assertContent(readingModes.has(reading.mode as string), `${lesson.id} a un mode de lecture invalide`);
  assertContent(typeof reading.instruction === "string" && reading.instruction.length > 0, `${lesson.id} doit avoir une consigne de lecture`);
  assertContent(typeof reading.text === "string" && reading.text.length > 0, `${lesson.id} doit avoir un texte visible à lire`);
  assertContent(typeof reading.audioText === "string" && reading.audioText.length > 0, `${lesson.id} doit avoir un audio de lecture`);
  assertContent(phonologyFocuses.has(reading.phonologyFocus as string), `${lesson.id} a un focus phonologique invalide`);
}

function validateExercise(exercise: Exercise) {
  assertContent(typeof exercise.id === "string" && exercise.id.length > 0, "un exercice doit avoir un identifiant");
  assertContent(exerciseTypes.includes(exercise.type), `${exercise.id} utilise un type inconnu`);
  assertContent(typeof exercise.instruction === "string" && typeof exercise.prompt === "string", `${exercise.id} doit avoir une consigne et un prompt`);
  assertStringArray(exercise.conceptIds, `${exercise.id} doit référencer ses notions`);
  assertContent(typeof exercise.explanation === "string" && exercise.explanation.length > 0, `${exercise.id} doit avoir une correction`);
  if ("isRevisionActivity" in exercise) assertContent(typeof exercise.isRevisionActivity === "boolean", `${exercise.id} a un indicateur de révision invalide`);
  if ("responseMode" in exercise && exercise.responseMode !== undefined) assertContent(responseModes.has(exercise.responseMode), `${exercise.id} a un mode de réponse invalide`);
  if ("isUnitMission" in exercise && exercise.isUnitMission !== undefined) assertContent(typeof exercise.isUnitMission === "boolean", `${exercise.id} a un indicateur de mission invalide`);
  if (exercise.isUnitMission) {
    assertContent(exercise.responseMode === "guided-production", `${exercise.id} doit être une production guidée`);
    assertContent(["reorder", "sentence-completion", "guided-translation", "dialogue"].includes(exercise.type), `${exercise.id} utilise un type non productif pour une mission`);
  }

  if (["listening", "listening-choice"].includes(exercise.type)) {
    assertContent(typeof exercise.audioText === "string" && exercise.audioText.length > 0, `${exercise.id} doit avoir un texte vocal`);
  }

  if (hasOptions(exercise)) {
    assertContent(Array.isArray(exercise.options) && exercise.options.length >= 2, `${exercise.id} doit avoir au moins deux propositions`);
    assertContent(exercise.options.every((option) => typeof option.id === "string" && typeof option.label === "string"), `${exercise.id} a une proposition invalide`);
    assertContent(new Set(exercise.options.map((option) => option.id)).size === exercise.options.length, `${exercise.id} contient des propositions dupliquées`);
    assertContent(typeof exercise.correctOptionId === "string" && exercise.correctOptionId.length > 0, `${exercise.id} doit référencer une bonne réponse`);
    assertContent(exercise.options.some((option) => option.id === exercise.correctOptionId), `${exercise.id} référence une bonne réponse absente`);
  }

  if (exercise.type === "english-french-matching" || exercise.type === "image-word-matching") {
    assertContent(Array.isArray(exercise.pairs) && exercise.pairs.length >= 2, `${exercise.id} doit avoir au moins deux paires`);
    assertContent(exercise.pairs.every((pair) => typeof pair.id === "string" && pair.id.length > 0 && typeof pair.left === "string" && pair.left.length > 0 && typeof pair.right === "string" && pair.right.length > 0), `${exercise.id} a une paire invalide`);
    assertContent(new Set(exercise.pairs.map((pair) => pair.id)).size === exercise.pairs.length, `${exercise.id} contient des paires dupliquées`);
  }

  if (exercise.type === "reorder") {
    assertContent(Array.isArray(exercise.tokens) && exercise.tokens.length >= 2, `${exercise.id} doit avoir des mots à remettre en ordre`);
    assertContent(Array.isArray(exercise.acceptedOrders) && exercise.acceptedOrders.length > 0, `${exercise.id} doit avoir un ordre attendu`);
    assertContent(exercise.tokens.every((token) => typeof token === "string" && token.length > 0), `${exercise.id} contient un mot invalide`);
    assertContent(exercise.acceptedOrders.every((order) => Array.isArray(order) && order.length === exercise.tokens.length && order.every((token) => typeof token === "string" && token.length > 0)), `${exercise.id} contient un ordre invalide`);
  }

  if (exercise.type === "sentence-completion") {
    assertContent(typeof exercise.sentence === "string" && exercise.sentence.includes("___"), `${exercise.id} doit indiquer le mot manquant`);
  }

  if (exercise.type === "listening") {
    assertContent(typeof exercise.answerLabel === "string" && exercise.answerLabel.length > 0, `${exercise.id} doit avoir un bouton de validation`);
  }

  if (exercise.type === "dialogue") {
    assertContent(Array.isArray(exercise.lines) && exercise.lines.length >= 2, `${exercise.id} doit avoir un dialogue`);
    assertContent(exercise.lines.every((line) => typeof line.speaker === "string" && line.speaker.length > 0 && typeof line.text === "string" && line.text.length > 0), `${exercise.id} contient une réplique invalide`);
  }

  if (exercise.type === "memory") {
    assertContent(Array.isArray(exercise.cards) && exercise.cards.length >= 4 && exercise.cards.length % 2 === 0, `${exercise.id} doit avoir un nombre pair de cartes`);
    assertContent(exercise.cards.every((card) => typeof card.id === "string" && card.id.length > 0 && typeof card.label === "string" && card.label.length > 0 && typeof card.matchId === "string" && card.matchId.length > 0), `${exercise.id} contient une carte invalide`);
    assertContent(new Set(exercise.cards.map((card) => card.id)).size === exercise.cards.length, `${exercise.id} contient des cartes dupliquées`);
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
  assertUniqueIds(bundle.units, "les unités");
  assertUniqueIds(bundle.lessons, "les leçons");
  assertUniqueIds(bundle.vocabulary, "le vocabulaire");
  assertUniqueIds(bundle.badges, "les badges");
  assertUniqueIds(bundle.themes, "les thèmes");
  const unitIds = new Set(bundle.units.map((unit) => unit.id));
  const lessonIds = new Set(bundle.lessons.map((lesson) => lesson.id));
  const vocabularyIds = new Set(bundle.vocabulary.map((item) => item.id));
  const badgeIds = new Set(bundle.badges.map((badge) => badge.id));
  const themeIds = new Set(bundle.themes.map((theme) => theme.id));

  assertContent(new Set(bundle.course.unitIds).size === bundle.course.unitIds.length, "le parcours contient des unités dupliquées");
  assertContent(new Set(bundle.course.badgeIds).size === bundle.course.badgeIds.length, "le parcours contient des badges dupliqués");
  assertContent(bundle.course.unitIds.every((id) => unitIds.has(id)), "le parcours référence une unité absente");
  assertContent(bundle.course.badgeIds.every((id) => badgeIds.has(id)), "le parcours référence un badge absent");
  assertContent(bundle.units.every((unit) => bundle.course.unitIds.includes(unit.id)), "une unité n’est pas publiée dans le parcours");
  assertContent(themeIds.has("gabriel") && themeIds.has("luca"), "les thèmes initiaux sont obligatoires");
  assertContent(bundle.themes.every((theme) => theme.profileId === theme.id && theme.name.length > 0 && theme.universe.length > 0 && theme.encouragements.length > 0), "un thème est incomplet");

  bundle.vocabulary.forEach((item) => {
    assertContent(item.english.length > 0 && item.french.length > 0 && item.example.length > 0 && item.audioText.length > 0, `${item.id} est un mot incomplet`);
  });

  const exerciseIds = new Set<string>();
  bundle.units.forEach((unit) => {
    assertContent(unit.courseId === bundle.course.id, `${unit.id} n’appartient pas au parcours`);
    assertContent(unit.lessonIds.every((id) => lessonIds.has(id)), `${unit.id} référence une leçon absente`);
    assertContent(unit.vocabularyIds.every((id) => vocabularyIds.has(id)), `${unit.id} référence un mot absent`);
    assertContent(new Set(unit.lessonIds).size === unit.lessonIds.length, `${unit.id} contient une leçon dupliquée`);
  });

  bundle.lessons.forEach((lesson) => {
    assertContent(lesson.courseId === bundle.course.id, `${lesson.id} n’appartient pas au parcours`);
    assertContent(unitIds.has(lesson.unitId), `${lesson.id} référence une unité absente`);
    assertContent(bundle.units.find((unit) => unit.id === lesson.unitId)?.lessonIds.includes(lesson.id), `${lesson.id} n’est pas publiée dans son unité`);
    assertContent(lesson.exercises.length >= 5 && lesson.exercises.length <= 8, `${lesson.id} doit contenir entre 5 et 8 exercices`);
    assertContent(lesson.newConceptIds.length <= 3, `${lesson.id} introduit trop de notions nouvelles`);
    assertContent([...lesson.newConceptIds, ...lesson.reviewConceptIds].every((id) => vocabularyIds.has(id)), `${lesson.id} référence une notion absente`);
    validateLessonExperience(lesson);
    lesson.exercises.forEach((exercise) => {
      assertContent(!exerciseIds.has(exercise.id), `identifiant d’exercice dupliqué : ${exercise.id}`);
      exerciseIds.add(exercise.id);
      validateExercise(exercise);
      assertContent(exercise.conceptIds.every((id) => vocabularyIds.has(id)), `${exercise.id} référence une notion absente`);
    });
  });

  bundle.units.forEach((unit) => {
    const unitLessons = bundle.lessons.filter((lesson) => lesson.unitId === unit.id);
    const missions = unitLessons.flatMap((lesson) => lesson.exercises.filter((exercise) => exercise.isUnitMission).map((exercise) => ({ lessonId: lesson.id, exercise })));
    assertContent(missions.length === 1, `${unit.id} doit avoir exactement une mission d’unité`);
    assertContent(unit.lessonIds[unit.lessonIds.length - 1] === missions[0]?.lessonId, `${unit.id} doit terminer par sa mission d’unité`);
  });

  bundle.badges.forEach((badge) => {
    assertContent(typeof badge.title === "string" && badge.title.length > 0 && typeof badge.description === "string" && badge.description.length > 0 && typeof badge.emoji === "string" && badge.emoji.length > 0 && badge.condition.type, `${badge.id} est incomplet`);
    if (badge.condition.type === "lesson-completed") assertContent(lessonIds.has(badge.condition.lessonId), `${badge.id} référence une leçon absente`);
    if (badge.condition.type === "unit-completed") assertContent(unitIds.has(badge.condition.unitId), `${badge.id} référence une unité absente`);
    if (badge.condition.type === "lessons-completed-count" || badge.condition.type === "audio-listens-count" || badge.condition.type === "revision-completed-count") assertContent(Number.isInteger(badge.condition.count) && badge.condition.count > 0, `${badge.id} a un seuil invalide`);
  });
  validateNoCycles(bundle.units, (unit) => unit.prerequisiteUnitIds);
  validateNoCycles(bundle.lessons, (lesson) => lesson.prerequisiteLessonIds);
}

export const content: ContentBundle = {
  course: rawCourse as ContentBundle["course"],
  units: [rawHello, rawFamily, rawHome, rawSchoolPlay, rawFood, rawLikes, rawDay, rawNumbersColours] as unknown as UnitContent[],
  lessons: [rawHello01, rawHello02, rawFamily01, rawFamily02, rawFamily03, rawHome01, rawHome02, rawHome03, rawSchoolPlay01, rawSchoolPlay02, rawSchoolPlay03, rawFood01, rawFood02, rawFood03, rawLikes01, rawLikes02, rawLikes03, rawDay01, rawDay02, rawDay03, rawNumbersColours01, rawNumbersColours02, rawNumbersColours03] as unknown as LessonContent[],
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
