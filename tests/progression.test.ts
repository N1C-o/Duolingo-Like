import { describe, expect, it } from "vitest";
import { content, getLesson, validateContent } from "@/content";
import type { ContentBundle, Exercise, ExerciseAnswer, ProfileId } from "@/lib/content/types";
import {
  activateProfile,
  advanceLesson,
  createInitialAppState,
  deactivateProfile,
  evaluateExerciseAnswer,
  getLessonStatus,
  getUnitStatus,
  recordExerciseAnswer,
  recordExerciseError,
  startLesson
} from "@/lib/progression/engine";
import type { AppState } from "@/lib/progression/types";

function answerFor(exercise: Exercise): ExerciseAnswer {
  if (exercise.type === "multiple-choice" || exercise.type === "guided-translation" || exercise.type === "listening-choice" || exercise.type === "sentence-completion" || exercise.type === "dialogue") {
    return { type: "choice", optionId: exercise.correctOptionId };
  }
  if (exercise.type === "true-false") return { type: "boolean", value: exercise.correct };
  if (exercise.type === "listening") return { type: "listening", listened: true };
  if (exercise.type === "reorder") return { type: "reorder", tokens: exercise.acceptedOrders[0] };
  if (exercise.type === "english-french-matching" || exercise.type === "image-word-matching") {
    return { type: "matching", pairs: exercise.pairs.map((pair) => ({ leftId: pair.id, rightId: pair.id })) };
  }
  if (exercise.type === "memory") {
    const pairs = new Map<string, string[]>();
    exercise.cards.forEach((card) => pairs.set(card.matchId, [...(pairs.get(card.matchId) ?? []), card.id]));
    return { type: "memory", pairs: Array.from(pairs.values()).map(([firstId, secondId]) => ({ firstId, secondId })) };
  }
  return { type: "boolean", value: false };
}

function completeLesson(state: AppState, profileId: ProfileId, lessonId: string) {
  let next = startLesson(state, profileId, lessonId);
  const lesson = getLesson(lessonId);
  let lastReward;
  for (const exercise of lesson.exercises) {
    next = recordExerciseAnswer(next, profileId, lessonId, exercise.id, answerFor(exercise)).state;
    const advanced = advanceLesson(next, profileId, lessonId);
    next = advanced.state;
    lastReward = advanced.reward;
  }
  return { state: next, reward: lastReward };
}

describe("contenu et évaluation des exercices", () => {
  it("valide le bundle publié et accepte la réponse correcte de chaque type présent", () => {
    expect(() => validateContent(content)).not.toThrow();
    content.lessons.flatMap((lesson) => lesson.exercises).forEach((exercise) => {
      expect(evaluateExerciseAnswer(exercise, answerFor(exercise))).toBe(true);
    });
  });

  it("bloque une référence de contenu incohérente", () => {
    const invalid = JSON.parse(JSON.stringify(content)) as ContentBundle;
    invalid.units[0].vocabularyIds.push("missing-word");
    expect(() => validateContent(invalid)).toThrow(/mot absent/);
  });

  it("prépare une mini-scène, un checkpoint lecture-son et une mission par unité", () => {
    expect(content.units).toHaveLength(20);
    expect(content.lessons).toHaveLength(60);

    content.lessons.forEach((lesson) => {
      expect(lesson.storyScene.setup.length).toBeGreaterThan(0);
      expect(lesson.storyScene.resolution.length).toBeGreaterThan(0);
      expect(lesson.exercises.some((exercise) => exercise.id === lesson.storyScene.childAction.exerciseId)).toBe(true);
      expect(lesson.readingCheckpoint.text.length).toBeGreaterThan(0);
      expect(lesson.readingCheckpoint.audioText.length).toBeGreaterThan(0);
    });

    content.units.forEach((unit) => {
      const lessons = content.lessons.filter((lesson) => lesson.unitId === unit.id).sort((left, right) => left.order - right.order);
      expect(lessons, unit.id).toHaveLength(3);
      const missions = lessons.flatMap((lesson) => lesson.exercises.filter((exercise) => exercise.isUnitMission));
      expect(missions).toHaveLength(1);
      expect(missions[0].responseMode).toBe("guided-production");
      expect(missions[0].id).toBe(lessons[lessons.length - 1].storyScene.childAction.exerciseId);
    });
  });

  it("réactive les acquis et diversifie chaque nouvelle leçon sans introduire de notions futures", () => {
    const introduced = new Set<string>();
    for (const lesson of content.lessons) {
      lesson.newConceptIds.forEach((id) => introduced.add(id));
      if (content.units.find((unit) => unit.id === lesson.unitId)!.order < 9) continue;
      expect(lesson.reviewConceptIds.length, lesson.id).toBeGreaterThanOrEqual(2);
      expect(new Set(lesson.exercises.map((exercise) => exercise.type)).size, lesson.id).toBeGreaterThanOrEqual(3);
      for (const id of [...lesson.reviewConceptIds, ...lesson.exercises.flatMap((exercise) => exercise.conceptIds)]) {
        expect(introduced.has(id), `${lesson.id}: ${id} doit être appris avant sa réutilisation`).toBe(true);
      }
    }
    expect(getLesson("big-adventure-03").newConceptIds).toEqual([]);
  });
});

describe("moteur de progression", () => {
  it("isole les profils et verrouille les soumissions hors ordre", () => {
    const initial = activateProfile(createInitialAppState(), "gabriel");
    const started = startLesson(initial, "gabriel", "hello-01");
    const secondExercise = getLesson("hello-01").exercises[1];
    const outOfOrder = recordExerciseAnswer(started, "gabriel", "hello-01", secondExercise.id, answerFor(secondExercise));

    expect(outOfOrder.state).toBe(started);
    expect(started.profiles.gabriel.progress.xpTotal).toBe(0);
    expect(getLessonStatus(started.profiles.gabriel.progress, getLesson("hello-01"))).toBe("in-progress");
    expect(started.profiles.luca.progress.xpTotal).toBe(0);
    expect(deactivateProfile(started).activeProfileId).toBeNull();
  });

  it("gagne le bonus de première bonne réponse et enregistre une erreur partielle", () => {
    const initial = activateProfile(createInitialAppState(), "gabriel");
    const lesson = getLesson("hello-01");
    const started = startLesson(initial, "gabriel", lesson.id);
    const first = lesson.exercises[0];
    const correct = recordExerciseAnswer(started, "gabriel", lesson.id, first.id, answerFor(first));

    expect(correct.reward.xpGained).toBe(7);
    expect(correct.correct).toBe(true);

    let matchingState = startLesson(initial, "gabriel", lesson.id);
    for (const exercise of lesson.exercises.slice(0, 2)) {
      matchingState = recordExerciseAnswer(matchingState, "gabriel", lesson.id, exercise.id, answerFor(exercise)).state;
      matchingState = advanceLesson(matchingState, "gabriel", lesson.id).state;
    }
    const matching = lesson.exercises[2];
    const partial = recordExerciseError(matchingState, "gabriel", lesson.id, matching.id, { type: "matching", pairs: [{ leftId: "hello-pair", rightId: "hi-pair" }] });
    const progress = partial.state.profiles.gabriel.progress;

    expect(partial.correct).toBe(false);
    expect(progress.lessonSessions[lesson.id].completedExerciseIds).not.toContain(matching.id);
    expect(progress.exerciseStats[matching.id].errors).toBe(1);
    expect(progress.conceptStats.hello.errors).toBeGreaterThan(0);
  });

  it("termine une leçon, déverrouille la suivante et ne récompense le rejeu que dans la limite quotidienne", () => {
    const initial = activateProfile(createInitialAppState(), "gabriel");
    const firstCompletion = completeLesson(initial, "gabriel", "hello-01");
    let state = firstCompletion.state;
    const profile = state.profiles.gabriel;

    expect(profile.progress.completedLessonIds).toContain("hello-01");
    expect(firstCompletion.reward?.completedLesson).toBe(true);
    expect(getLessonStatus(profile.progress, getLesson("hello-02"))).toBe("available");
    expect(getUnitStatus(profile.progress, content.units[1])).toBe("locked");

    const beforeReplayXp = profile.progress.xpTotal;
    state = startLesson(state, "gabriel", "hello-01");
    const lesson = getLesson("hello-01");
    for (const exercise of lesson.exercises) {
      state = recordExerciseAnswer(state, "gabriel", lesson.id, exercise.id, answerFor(exercise)).state;
      state = advanceLesson(state, "gabriel", lesson.id).state;
    }

    expect(state.profiles.gabriel.progress.xpTotal).toBe(beforeReplayXp + 5);
    expect(state.profiles.gabriel.progress.completedLessonIds).toHaveLength(1);
  });

  it("ne récompense pas deux fois une ancienne unité et exige la nouvelle leçon pour les nouveaux profils", () => {
    let state = activateProfile(createInitialAppState(), "gabriel");
    for (const id of ["hello-01", "hello-02"]) state = completeLesson(state, "gabriel", id).state;
    expect(getUnitStatus(state.profiles.gabriel.progress, content.units[1])).toBe("locked");

    // The legacy curriculum awarded this completion after hello-02.
    state.profiles.gabriel.progress.completedUnitIds = ["hello"];
    state = activateProfile(state, "gabriel");
    expect(getUnitStatus(state.profiles.gabriel.progress, content.units[1])).toBe("available");
    const beforeXp = state.profiles.gabriel.progress.xpTotal;
    const result = completeLesson(state, "gabriel", "hello-03");
    expect(result.state.profiles.gabriel.progress.completedUnitIds).toEqual(["hello"]);
    expect(result.reward?.completedUnit).toBe(false);
    expect(result.state.profiles.gabriel.progress.xpTotal - beforeXp).toBe(62);
    expect(result.state.profiles.luca.progress.xpTotal).toBe(0);
  });

  it("termine les deux premières unités et attribue le badge de cinq étapes", () => {
    let state = activateProfile(createInitialAppState(), "gabriel");
    ["hello-01", "hello-02", "hello-03", "family-01", "family-02", "family-03"].forEach((lessonId) => {
      state = completeLesson(state, "gabriel", lessonId).state;
    });

    const progress = state.profiles.gabriel.progress;
    expect(progress.completedLessonIds).toHaveLength(6);
    expect(progress.completedUnitIds).toContain("hello");
    expect(progress.completedUnitIds).toContain("family");
    expect(progress.badgeIds).toContain("five-steps");
    expect(progress.badgeIds).toContain("on-the-way");
    expect(getUnitStatus(progress, content.units[1])).toBe("completed");
  });

  it("parcourt les 60 leçons dans l’ordre sans déverrouillage parental et sans toucher à Luca", () => {
    let state = activateProfile(createInitialAppState(), "gabriel");
    for (const unit of content.units) {
      expect(getUnitStatus(state.profiles.gabriel.progress, unit), unit.id).toBe("available");
      for (const lessonId of unit.lessonIds) {
        expect(getLessonStatus(state.profiles.gabriel.progress, getLesson(lessonId)), lessonId).toBe("available");
        state = completeLesson(state, "gabriel", lessonId).state;
        expect(getLessonStatus(state.profiles.gabriel.progress, getLesson(lessonId)), lessonId).toBe("completed");
      }
      expect(getUnitStatus(state.profiles.gabriel.progress, unit), unit.id).toBe("completed");
    }
    expect(state.profiles.gabriel.progress.completedLessonIds).toHaveLength(60);
    expect(state.profiles.gabriel.progress.completedUnitIds).toHaveLength(20);
    expect(state.profiles.luca.progress.completedLessonIds).toEqual([]);
    expect(state.profiles.luca.progress.xpTotal).toBe(0);
  });

  it("donne un contexte explicite aux réponses autrefois ambiguës", () => {
    const greeting = getLesson("hello-01").exercises.find((exercise) => exercise.id === "hello-01-completion")!;
    expect(greeting.audioText).toBe("Hello!");
    expect(evaluateExerciseAnswer(greeting, { type: "choice", optionId: "hello" })).toBe(true);
    expect(evaluateExerciseAnswer(greeting, { type: "choice", optionId: "hi" })).toBe(false);
    const apple = getLesson("likes-01").exercises.find((exercise) => exercise.id === "likes-01-choice")!;
    expect(apple.prompt).toContain("J’aime les pommes");
    expect(evaluateExerciseAnswer(apple, { type: "choice", optionId: "like" })).toBe(true);
    const milk = getLesson("likes-02").exercises.find((exercise) => exercise.id === "likes-02-choice")!;
    expect(milk.prompt).toContain("n’aime pas le lait");
  });
});
