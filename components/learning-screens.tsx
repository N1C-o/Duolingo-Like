"use client";

import { useEffect, useRef, useState } from "react";
import type { ComponentType } from "react";
import type { RefObject } from "react";
import {
  ArrowLeftIcon,
  BadgeIcon,
  BookIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ClockIcon,
  CloseIcon,
  CompassIcon,
  HeartIcon,
  HomeIcon,
  LeafIcon,
  LockIcon,
  MapIcon,
  PlayIcon,
  SettingsIcon,
  SparkleBurstIcon,
  SparkleIcon,
  StarIcon,
  TargetIcon,
  TrophyIcon,
  VolumeIcon
} from "@/components/icons";
import { ExerciseRenderer, type ExerciseResult } from "@/components/exercise-renderer";
import { CapybaraMascot, CatMascot, SceneIllustration } from "@/components/mascots";
import { content, getLesson, getLessonsForUnit, getTheme, getUnit, getVocabularyForUnit } from "@/content";
import type { Exercise, LessonContent, ProfileId, ReadingCheckpoint, StoryScene, ThemeContent, ThemeId } from "@/lib/content/types";
import { getLessonResumeIndex, getLessonStatus, getLevelProgress, getTopConsolidationConcepts, getUnitStatus } from "@/lib/progression/engine";
import type { AppState, LocalProfile, ProfilePreferences, RewardSummary } from "@/lib/progression/types";

export type ScreenId = "access" | "home" | "map" | "unit" | "lesson" | "summary" | "badges" | "settings" | "parent";
export type IconComponent = ComponentType<{ size?: number; className?: string; title?: string }>;

export type FeedbackState = {
  correct: boolean;
  explanation: string;
  answerLabel?: string;
  xpGained: number;
};

export type ScreenContext = {
  state: AppState;
  profile: LocalProfile;
  theme: ThemeContent;
};

type CommonScreenProps = {
  context: ScreenContext;
  onNavigate: (screen: ScreenId) => void;
  onToast: (message: string) => void;
};

function Companion({ theme, size = 120, className }: { theme: "gabriel" | "luca"; size?: number; className?: string }) {
  return theme === "gabriel" ? <CapybaraMascot className={className} size={size} /> : <CatMascot className={className} size={size} />;
}

function ThemeRewardIcon({ theme, size }: { theme: ThemeContent; size: number }) {
  return theme.id === "gabriel" ? <LeafIcon aria-hidden="true" size={size} /> : <StarIcon aria-hidden="true" size={size} />;
}

function lessonPercent(progress: ScreenContext["profile"]["progress"], lesson: LessonContent) {
  if (progress.completedLessonIds.includes(lesson.id)) return 100;
  const session = progress.lessonSessions[lesson.id];
  if (!session) return 0;
  return Math.round((session.completedExerciseIds.length / lesson.exercises.length) * 100);
}

function getExerciseLabel(exercise: Exercise) {
  if (exercise.isUnitMission) return "MISSION";
  if (exercise.responseMode === "guided-production") return "À CONSTRUIRE";
  if (exercise.type === "listening" || exercise.type === "listening-choice") return "ÉCOUTE";
  if (exercise.type === "dialogue") return "DIALOGUE";
  if (exercise.type === "memory") return "MEMORY";
  if (exercise.type === "reorder") return "PHRASE";
  if (exercise.type === "true-false") return "VRAI OU FAUX";
  return "À TOI DE JOUER";
}

function getStatusLabel(status: ReturnType<typeof getLessonStatus>) {
  if (status === "completed") return "Terminée";
  if (status === "in-progress") return "En cours";
  if (status === "available") return "Disponible";
  return "Verrouillée";
}

function ThemeHeader({ context, onChangeProfile }: { context: ScreenContext; onChangeProfile: () => void }) {
  const { profile, theme } = context;
  const level = getLevelProgress(profile.progress.xpTotal);
  const count = profile.progress.badgeIds.length;

  return (
    <header className="app-header">
      <div className="topbar">
        <div className="profile-switcher">
          <button aria-label={`Changer de profil, profil ${profile.id}`} className="profile-avatar-button" onClick={onChangeProfile} type="button">
            <span className="avatar avatar--top"><Companion size={48} theme={theme.id} /></span>
          </button>
          <button aria-label={`Changer de profil, ${theme.universe}`} className="profile-theme-button" onClick={onChangeProfile} type="button">
            <span className="profile-switcher__copy"><span className="profile-switcher__name">{theme.name}</span><span className="profile-switcher__universe">{theme.universe}</span></span>
            <ChevronDownIcon aria-hidden="true" className="profile-switcher__chevron" size={16} />
          </button>
        </div>
        <div className="header-progress">
          <div className="header-progress__body">
            <div className="header-progress__meta"><strong>Niveau {level.level}</strong><span>{level.current} / {level.next} XP</span></div>
            <div aria-label={`${level.current} sur ${level.next} XP vers le prochain niveau`} className="progress-track"><span className="progress-track__fill" style={{ width: `${level.percentage}%` }} /></div>
          </div>
          <div aria-label={`${count} badge${count === 1 ? "" : "s"} obtenu${count === 1 ? "" : "s"}`} className="currency-pill"><ThemeRewardIcon size={17} theme={theme} /><strong>{count}</strong></div>
        </div>
      </div>
    </header>
  );
}

function SectionHeading({ eyebrow, title, action, onAction }: { eyebrow: string; title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="section-heading">
      <div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div>
      {action && onAction ? <button className="text-button" onClick={onAction} type="button">{action}<ChevronRightIcon aria-hidden="true" size={16} /></button> : null}
    </div>
  );
}

export function AccessScreen({ profiles, onLogin }: { profiles: LocalProfile[]; onLogin: (profileId: ProfileId, code: string) => boolean }) {
  const [selectedProfileId, setSelectedProfileId] = useState<ProfileId | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSelect = (profileId: ProfileId) => {
    setSelectedProfileId(profileId);
    setCode("");
    setError(null);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedProfileId) return;
    if (!onLogin(selectedProfileId, code.trim().toLowerCase())) {
      setError("Ce code ne correspond pas à ce profil. Essaie encore tranquillement.");
      return;
    }
    setError(null);
  };

  const selectedProfile = profiles.find((profile) => profile.id === selectedProfileId) ?? null;
  return (
    <div className="access-screen screen-content">
      <div className="access-brand"><span className="access-brand__spark"><SparkleIcon aria-hidden="true" size={18} /></span><span className="eyebrow">ENGLISH ADVENTURE</span><h1>Qui part à l’aventure ?</h1><p>Choisis ton espace, puis entre ton petit code pour retrouver ta progression.</p></div>
      <div className="access-profiles">
        {profiles.map((profile) => {
          const theme = getTheme(profile.themeId);
          const selected = selectedProfileId === profile.id;
          return <button aria-pressed={selected} className={`access-profile-card ${selected ? "access-profile-card--selected" : ""} theme-card--${theme.id}`} key={profile.id} onClick={() => handleSelect(profile.id)} type="button"><span className="access-profile-card__scene"><SceneIllustration theme={theme.id} /></span><span className="access-profile-card__mascot"><Companion size={125} theme={theme.id} /></span><span className="access-profile-card__copy"><strong>{profile.displayName}</strong><small>{theme.universe}</small></span><span className="access-profile-card__check">{selected ? <CheckIcon aria-hidden="true" size={16} /> : <ChevronRightIcon aria-hidden="true" size={16} />}</span></button>;
        })}
      </div>
      {selectedProfile ? <form className="access-code-card" onSubmit={handleSubmit}><label htmlFor="profile-code">Le petit code de {selectedProfile.displayName}</label><p>Il sert seulement à éviter d’entrer dans le mauvais espace.</p><div className="access-code-row"><input autoComplete="off" id="profile-code" onChange={(event) => { setCode(event.target.value); setError(null); }} placeholder="Écris le code" value={code} /><button className="primary-button" type="submit">Entrer<ChevronRightIcon aria-hidden="true" size={18} /></button></div>{error ? <p aria-live="polite" className="access-error"><CloseIcon aria-hidden="true" size={15} /> {error}</p> : null}</form> : <div className="access-hint"><LockIcon aria-hidden="true" size={16} /><span>{profiles.length ? "Les progrès de chaque profil restent séparés." : "Aucun profil n’est encore configuré pour cette famille."}</span></div>}
      <p className="access-disclaimer">Accès familial privé · les profils sont partagés par le compte familial</p>
    </div>
  );
}

export function HomeScreen({ context, onNavigate, onToast, onOpenLesson }: CommonScreenProps & { onOpenLesson: (lessonId: string) => void }) {
  const { profile, theme } = context;
  const recommended = content.lessons.find((lesson) => {
    const status = getLessonStatus(profile.progress, lesson);
    return status === "available" || status === "in-progress";
  }) ?? content.lessons.find((lesson) => profile.progress.completedLessonIds.includes(lesson.id)) ?? content.lessons[0];
  const recommendedUnit = getUnit(recommended.unitId);
  const recommendedStatus = getLessonStatus(profile.progress, recommended);
  const previewLessons = content.lessons.slice(0, 3);

  return (
    <div className="screen-content home-screen">
      <section className="hero-card"><SceneIllustration theme={theme.id} /><div className="hero-card__wash" /><div className="hero-card__content"><span className="hero-card__eyebrow">TON AVENTURE EN ANGLAIS</span><h1>{theme.greeting}</h1><p>{theme.subtitle}</p><div className="hero-card__stamp"><SparkleIcon aria-hidden="true" size={14} /><span>Une leçon · {recommended.durationMinutes} min</span></div></div><div className="hero-card__mascot"><Companion size={148} theme={theme.id} /></div></section>
      <SectionHeading action="Voir le parcours" eyebrow="TON PROCHAIN PAS" onAction={() => onNavigate("map")} title={recommended.title} />
      <section aria-label="Aperçu du parcours" className="journey-preview"><div className="journey-preview__path" />{previewLessons.map((lesson, index) => <PreviewNode key={lesson.id} lesson={lesson} progress={profile.progress} number={String(index + 1)} onClick={() => onOpenLesson(lesson.id)} />)}</section>
      <section className="current-lesson-card"><div className="current-lesson-card__topline"><div className="lesson-badge"><BookIcon aria-hidden="true" size={21} /></div><div><span className="eyebrow">{recommendedStatus === "in-progress" ? "LEÇON EN COURS" : "À DÉCOUVRIR"}</span><h3>{recommended.title}</h3></div><span className="lesson-percent">{lessonPercent(profile.progress, recommended)}%</span></div><p>{recommended.objective}</p><div className="lesson-progress-row"><span>{recommendedUnit.shortTitle} · {recommended.exercises.length} exercices</span><div className="progress-track progress-track--small"><span className="progress-track__fill" style={{ width: `${lessonPercent(profile.progress, recommended)}%` }} /></div></div><button className="primary-button primary-button--wide" onClick={() => onOpenLesson(recommended.id)} type="button">{recommendedStatus === "in-progress" ? "Continuer" : recommendedStatus === "completed" ? "Rejouer" : "Commencer"}<ChevronRightIcon aria-hidden="true" size={19} /></button></section>
      <div className="feature-grid"><FeatureChip icon={ClockIcon} label="5 min" detail="par leçon" /><FeatureChip icon={HeartIcon} label="Sans pression" detail="pas de vies" /><FeatureChip icon={BookIcon} label={`${profile.progress.completedLessonIds.length}`} detail="leçon(s) terminée(s)" /><FeatureChip icon={TrophyIcon} label={`${profile.progress.badgeIds.length}`} detail="badge(s) gagné(s)" /></div>
      <section className="gentle-note"><div className="gentle-note__icon"><ThemeRewardIcon size={18} theme={theme} /></div><div><strong>Ta prochaine petite victoire</strong><p>{theme.encouragements[profile.progress.completedLessonIds.length % theme.encouragements.length]}</p></div><button aria-label="En savoir plus" className="round-arrow" onClick={() => onToast("Tu peux réécouter, réessayer et continuer sans perdre de progression.")} type="button"><ChevronRightIcon aria-hidden="true" size={17} /></button></section>
    </div>
  );
}

function PreviewNode({ lesson, progress, number, onClick }: { lesson: LessonContent; progress: ScreenContext["profile"]["progress"]; number: string; onClick: () => void }) {
  const status = getLessonStatus(progress, lesson);
  return <button className={`preview-node preview-node--${status === "completed" ? "complete" : status === "locked" ? "locked" : status === "in-progress" ? "current" : "available"}`} onClick={onClick} type="button"><span className="preview-node__medallion">{status === "completed" ? <CheckIcon aria-hidden="true" size={18} /> : status === "locked" ? <LockIcon aria-hidden="true" size={16} /> : number}</span><span className="preview-node__copy"><strong>{lesson.title}</strong><span>{status === "completed" ? "Terminée" : status === "locked" ? "Bientôt" : getStatusLabel(status)}</span></span>{status !== "locked" ? <StarIcon aria-hidden="true" className="preview-node__star" size={17} /> : null}</button>;
}

function FeatureChip({ icon: Icon, label, detail }: { icon: IconComponent; label: string; detail: string }) {
  return <div className="feature-chip"><span className="feature-chip__icon"><Icon aria-hidden="true" size={19} /></span><span><strong>{label}</strong><small>{detail}</small></span></div>;
}

function readingModeLabel(mode: ReadingCheckpoint["mode"]) {
  if (mode === "word-recognition") return "Reconnaître le mot";
  if (mode === "phrase-recognition") return "Repérer la phrase";
  if (mode === "audio-to-text") return "Relier le son et l’écrit";
  return "Remettre les mots en ordre";
}

function phonologyLabel(focus: ReadingCheckpoint["phonologyFocus"]) {
  if (focus === "greeting-rhythm") return "Rythme de la salutation";
  if (focus === "question-intonation") return "La voix qui monte dans une question";
  if (focus === "word-stress") return "Écouter le mot important";
  return "Le rythme de la phrase";
}

type SceneSpeakerTone = "gabriel" | "luca" | "sam" | "object" | "narrator";

function getSceneSpeakerTone(speaker?: string): SceneSpeakerTone {
  const normalizedSpeaker = speaker?.trim().toLowerCase();
  if (!normalizedSpeaker) return "narrator";
  if (normalizedSpeaker === "gabriel") return "gabriel";
  if (normalizedSpeaker === "luca") return "luca";
  if (normalizedSpeaker === "sam") return "sam";
  return "object";
}

function SceneLine({ line, kind, onSpeak }: { line: StoryScene["setup"][number]; kind: "setup" | "resolution"; onSpeak: (text: string) => boolean }) {
  const speakerName = line.speaker?.trim() || "Narrator";
  const speakerTone = getSceneSpeakerTone(line.speaker);
  const speakerInitial = speakerName.charAt(0).toUpperCase();

  return (
    <div className={`story-scene__line story-scene__line--${kind} story-scene__line--${speakerTone}`}>
      <div className="story-scene__speaker">
        <span aria-hidden="true" className="story-scene__speaker-initial">{speakerInitial}</span>
        <span>{speakerName}</span>
      </div>
      <div className="story-scene__bubble">
        <strong>{line.text}</strong>
        {line.translation ? <small>{line.translation}</small> : null}
        <button aria-label={`Écouter la réplique de ${speakerName}`} className="story-scene__audio" onClick={() => onSpeak(line.text)} type="button"><VolumeIcon aria-hidden="true" size={16} /></button>
      </div>
    </div>
  );
}

function StoryScenePanel({ context, lesson, onSpeak }: { context: ScreenContext; lesson: LessonContent; onSpeak: (text: string) => boolean }) {
  const scene = lesson.storyScene;
  const actionStat = context.profile.progress.exerciseStats[scene.childAction.exerciseId];
  const resolved = context.profile.progress.completedLessonIds.includes(lesson.id) || Boolean(actionStat?.successes);

  return (
    <section aria-label={`Mini-scène : ${scene.situation}`} className="story-scene-card">
      <div className="story-scene__topline"><span className="story-scene__tag"><SparkleIcon aria-hidden="true" size={13} /> MINI-SCÈNE</span><span className="story-scene__state">{resolved ? "Scène résolue" : "À toi d’agir"}</span></div>
      <p className="story-scene__situation">{scene.situation}</p>
      <div className="story-scene__lines">{scene.setup.map((line, index) => <SceneLine key={`${line.speaker ?? "narrator"}-${index}`} kind="setup" line={line} onSpeak={onSpeak} />)}</div>
      {resolved ? <div className="story-scene__resolution"><span className="story-scene__action-label">RÉSOLUTION</span>{scene.resolution.map((line, index) => <SceneLine key={`${line.speaker ?? "narrator"}-${index}`} kind="resolution" line={line} onSpeak={onSpeak} />)}</div> : null}
    </section>
  );
}

function ReadingCheckpointCard({ checkpoint, onSpeak }: { checkpoint: ReadingCheckpoint; onSpeak: (text: string) => boolean }) {
  const [available, setAvailable] = useState(true);
  const handleSpeak = () => setAvailable(onSpeak(checkpoint.audioText));

  return (
    <section aria-label="Checkpoint lecture et sons" className="reading-checkpoint">
      <div className="reading-checkpoint__topline"><span className="reading-checkpoint__tag"><VolumeIcon aria-hidden="true" size={13} /> LECTURE & SONS</span><span>{readingModeLabel(checkpoint.mode)}</span></div>
      <div className="reading-checkpoint__body"><div><strong>{checkpoint.text}</strong><small>{checkpoint.instruction}</small></div><button aria-label={`Écouter : ${checkpoint.audioText}`} className="reading-checkpoint__audio" onClick={handleSpeak} type="button"><VolumeIcon aria-hidden="true" size={18} /></button></div>
      <p className="reading-checkpoint__focus">{available ? "À l’oreille :" : "Audio indisponible :"} {phonologyLabel(checkpoint.phonologyFocus)}</p>
    </section>
  );
}

export function MapScreen({ context, onNavigate, onToast, onOpenUnit, onOpenLesson }: CommonScreenProps & { onOpenUnit: (unitId: string) => void; onOpenLesson: (lessonId: string) => void }) {
  const { profile, theme } = context;
  const completedUnits = content.units.filter((unit) => getUnitStatus(profile.progress, unit) === "completed").length;
  const recommended = content.lessons.find((lesson) => ["available", "in-progress"].includes(getLessonStatus(profile.progress, lesson)));
  const recommendedIsInProgress = recommended ? getLessonStatus(profile.progress, recommended) === "in-progress" : false;
  return (
    <div className="screen-content map-screen">
      <div className="screen-title-row">
        <div>
          <span className="eyebrow">LE GRAND PARCOURS</span>
          <h1>Chaque étape compte</h1>
          <p>Avance à ton rythme, une petite leçon après l’autre.</p>
        </div>
        <div className="map-title-mark"><CompassIcon aria-hidden="true" size={26} /></div>
      </div>

      <section className="map-banner">
        <SceneIllustration theme={theme.id} />
        <div className="map-banner__content">
          <span className="map-banner__tag"><SparkleIcon aria-hidden="true" size={13} /> {theme.universe}</span>
          <strong>{completedUnits} unité{completedUnits > 1 ? "s" : ""} terminée{completedUnits > 1 ? "s" : ""} sur {content.units.length}</strong>
          <span>{profile.progress.completedLessonIds.length} leçon{profile.progress.completedLessonIds.length > 1 ? "s" : ""} parcourue{profile.progress.completedLessonIds.length > 1 ? "s" : ""}</span>
        </div>
        <div className="map-banner__mascot"><Companion size={88} theme={theme.id} /></div>
      </section>

      {recommended ? (
        <section className="map-resume-card map-resume-card--next">
          <div className="map-resume-card__icon"><BookIcon aria-hidden="true" size={22} /></div>
          <div>
            <span className="eyebrow">{recommendedIsInProgress ? "À REPRENDRE" : "PROCHAINE LEÇON"}</span>
            <strong>{recommended.title}</strong>
            <span>{recommended.durationMinutes} min · {lessonPercent(profile.progress, recommended)}% terminé</span>
          </div>
          <button aria-label={recommendedIsInProgress ? "Reprendre la leçon" : "Commencer la leçon"} className="round-arrow" onClick={() => onOpenLesson(recommended.id)} type="button">
            <PlayIcon aria-hidden="true" size={16} />
          </button>
        </section>
      ) : null}

      <section aria-label="Carte du parcours" className="path-map">
        <div className="path-map__line" />
        <div aria-hidden="true" className="path-map__decorations">
          <span className="path-map__decoration path-map__decoration--upper-left" />
          <span className="path-map__decoration path-map__decoration--middle-right" />
          <span className="path-map__decoration path-map__decoration--lower-left" />
          <span className="path-map__decoration path-map__decoration--lower-right" />
        </div>
        <div className="path-map__start"><span>Début</span><SparkleBurstIcon aria-hidden="true" size={18} /></div>
        {content.units.map((unit, index) => {
          const status = getUnitStatus(profile.progress, unit);
          return <MapUnitCard key={unit.id} number={String(index + 1)} onClick={() => status === "locked" ? onToast("Cette unité se débloquera quand l’étape précédente sera terminée.") : onOpenUnit(unit.id)} position={index % 2 === 0 ? "left" : "right"} status={status} title={unit.title} detail={`${unit.lessonIds.filter((id) => profile.progress.completedLessonIds.includes(id)).length} / ${unit.lessonIds.length} leçons`} />;
        })}
      </section>

      <button className="prototype-back-link" onClick={() => onNavigate("home")} type="button"><HomeIcon aria-hidden="true" size={16} /> Revenir à l’accueil</button>
    </div>
  );
}

function MapUnitCard({ number, title, detail, status, position, onClick }: { number: string; title: string; detail: string; status: ReturnType<typeof getUnitStatus>; position: "left" | "right"; onClick: () => void }) {
  return (
    <div className={`map-unit map-unit--${position} map-unit--${status}`}>
      <button aria-label={`${title}, ${status === "locked" ? "verrouillée" : detail}`} className="map-unit__action" onClick={onClick} type="button">
        <span aria-hidden="true" className="map-unit__node">{status === "completed" ? <CheckIcon aria-hidden="true" size={21} /> : status === "locked" ? <LockIcon aria-hidden="true" size={18} /> : number}</span>
        <span aria-hidden="true" className="map-unit__card">
          <span className="map-unit__number">UNITÉ {number}</span>
          <strong>{title}</strong>
          <span>{detail}</span>
          <span className="map-unit__badge">{status === "completed" ? <CheckIcon aria-hidden="true" size={13} /> : status === "locked" ? <LockIcon aria-hidden="true" size={12} /> : <StarIcon aria-hidden="true" size={13} />}</span>
        </span>
      </button>
    </div>
  );
}

export function UnitScreen({ context, unitId, onNavigate, onToast, onOpenLesson }: CommonScreenProps & { unitId: string; onOpenLesson: (lessonId: string) => void }) {
  const { profile, theme } = context;
  const unit = getUnit(unitId);
  const vocabulary = getVocabularyForUnit(unit.id);
  const lessons = getLessonsForUnit(unit.id);
  const status = getUnitStatus(profile.progress, unit);
  return <div className="screen-content unit-screen"><button className="screen-back-button" onClick={() => onNavigate("map")} type="button"><ArrowLeftIcon aria-hidden="true" size={17} /> Parcours</button><section className="unit-intro"><div className="unit-intro__icon"><ThemeRewardIcon size={24} theme={theme} /></div><span className="eyebrow">UNITÉ {unit.order} · {status === "completed" ? "TERMINÉE" : "EN ROUTE"}</span><h1>{unit.title}</h1><p>{unit.objective}</p><span className="unit-intro__reward"><SparkleIcon aria-hidden="true" size={14} /> Récompense : {unit.rewardTitle}</span></section><section className="unit-vocabulary"><SectionHeading eyebrow="LES MOTS DE L’UNITÉ" title={unit.topic} /><div className="vocabulary-pills">{vocabulary.map((item) => <span key={item.id}><strong>{item.english}</strong><small>{item.french}</small></span>)}</div></section><section className="unit-lessons"><SectionHeading eyebrow="LES PETITES ÉTAPES" title="Les leçons" />{lessons.map((lesson) => { const lessonStatus = getLessonStatus(profile.progress, lesson); return <button className={`unit-lesson-row unit-lesson-row--${lessonStatus}`} disabled={lessonStatus === "locked"} key={lesson.id} onClick={() => lessonStatus === "locked" ? onToast("Termine l’étape précédente pour ouvrir cette leçon.") : onOpenLesson(lesson.id)} type="button"><span className="unit-lesson-row__node">{lessonStatus === "completed" ? <CheckIcon aria-hidden="true" size={17} /> : lessonStatus === "locked" ? <LockIcon aria-hidden="true" size={15} /> : lesson.order}</span><span className="unit-lesson-row__copy"><strong>{lesson.title}</strong><small>{lesson.objective}</small></span><span className="unit-lesson-row__meta"><span>{lesson.durationMinutes} min</span><span>{lessonPercent(profile.progress, lesson)}%</span></span><ChevronRightIcon aria-hidden="true" size={17} /></button>; })}</section></div>;
}

export function LessonScreen({ context, lessonId, feedback, resetToken, onNavigate, onToast, onSubmit, onError, onSpeak, onRetry, onContinue }: CommonScreenProps & { lessonId: string; feedback: FeedbackState | null; resetToken: number; onSubmit: (result: ExerciseResult) => void; onError: (result: ExerciseResult) => void; onSpeak: (text: string) => boolean; onRetry: () => void; onContinue: () => void }) {
  const { profile, theme } = context;
  const autoPlayedExerciseRef = useRef<string | null>(null);
  const lesson = getLesson(lessonId);
  const session = profile.progress.lessonSessions[lessonId];
  const index = Math.min(getLessonResumeIndex(profile.progress, lesson), lesson.exercises.length - 1);
  const exercise = lesson.exercises[index];
  const progressPercent = Math.round((index / lesson.exercises.length) * 100);

  useEffect(() => {
    if (!profile.preferences.autoPlay || !profile.preferences.soundsEnabled || !exercise.audioText || autoPlayedExerciseRef.current === exercise.id) return;
    autoPlayedExerciseRef.current = exercise.id;
    onSpeak(exercise.audioText);
  }, [exercise.audioText, exercise.id, onSpeak, profile.preferences.autoPlay, profile.preferences.soundsEnabled]);

  return (
    <div className="screen-content lesson-screen">
      <div className="lesson-toolbar"><button aria-label="Retourner à l’unité" className="round-icon-button" onClick={() => onNavigate("unit")} type="button"><ArrowLeftIcon aria-hidden="true" size={19} /></button><div className="lesson-toolbar__center"><span className="eyebrow">{lesson.title}</span><strong>{index + 1} sur {lesson.exercises.length}</strong></div><button aria-label="Quitter la leçon" className="round-icon-button" onClick={() => onNavigate("home")} type="button"><span aria-hidden="true">×</span></button></div>
      <div className="lesson-progress-line"><span style={{ width: `${progressPercent}%` }} /></div>
      <StoryScenePanel context={context} lesson={lesson} onSpeak={onSpeak} />
      <ReadingCheckpointCard checkpoint={lesson.readingCheckpoint} onSpeak={onSpeak} />
      <div className="lesson-heading"><span className="lesson-heading__tag"><VolumeIcon aria-hidden="true" size={14} /> {getExerciseLabel(exercise)}</span><h1>{exercise.instruction}</h1><p>{exercise.prompt}</p></div>
      <section className="exercise-card">
        <div className="exercise-card__topline"><span>{lesson.objective}</span><span className="exercise-card__time"><ClockIcon aria-hidden="true" size={14} /> {lesson.durationMinutes} min</span></div>
        <div className="exercise-stage"><div className="speech-bubble"><span className="speech-bubble__tiny">{getExerciseLabel(exercise)}</span><strong>{exercise.audioText ?? exercise.prompt}</strong><span className="speech-bubble__tail" /></div><div className="exercise-stage__mascot"><Companion size={151} theme={theme.id} /></div><div className="exercise-stage__sparkle exercise-stage__sparkle--one"><SparkleIcon aria-hidden="true" size={16} /></div><div className="exercise-stage__sparkle exercise-stage__sparkle--two"><SparkleIcon aria-hidden="true" size={11} /></div></div>
        <ExerciseRenderer key={`${exercise.id}-${resetToken}`} exercise={exercise} feedbackVisible={Boolean(feedback)} onError={onError} onSpeak={onSpeak} onSubmit={onSubmit} />
        {feedback ? <div className={`feedback-panel ${feedback.correct ? "feedback-panel--success" : "feedback-panel--gentle"}`}><span className="feedback-panel__icon">{feedback.correct ? <CheckIcon aria-hidden="true" size={18} /> : <CloseIcon aria-hidden="true" size={18} />}</span><div><strong>{feedback.correct ? "Bravo, c’est ça !" : "Pas tout à fait"}</strong><p>{feedback.explanation}{feedback.xpGained > 0 ? ` · +${feedback.xpGained} XP` : ""}</p></div></div> : null}
        {feedback ? <div className="lesson-feedback-actions">{!feedback.correct ? <button className="secondary-button" onClick={onRetry} type="button">Réessayer</button> : null}<button className="primary-button primary-button--wide exercise-submit" onClick={onContinue} type="button">{index === lesson.exercises.length - 1 ? "Voir ma récompense" : feedback.correct ? "Continuer" : "Continuer quand même"}<ChevronRightIcon aria-hidden="true" size={19} /></button></div> : null}
      </section>
      <div className="lesson-footer-note"><TargetIcon aria-hidden="true" size={17} /><span>Une erreur est une nouvelle piste pour apprendre.</span></div><button className="prototype-back-link" onClick={() => onNavigate("unit")} type="button"><MapIcon aria-hidden="true" size={16} /> Revenir à l’unité</button><span className="lesson-theme-note">Thème actif : {theme.universe}{session?.isReplay ? " · rejeu" : ""}</span>
    </div>
  );
}

export function SummaryScreen({ context, reward, lessonId, onNavigate, onOpenLesson }: CommonScreenProps & { reward: RewardSummary | null; lessonId: string; onOpenLesson: (lessonId: string) => void }) {
  const { profile, theme } = context;
  const lesson = getLesson(lessonId);
  const unit = getUnit(lesson.unitId);
  const earnedBadges = reward?.newlyAwardedBadgeIds.map((id) => content.badges.find((badge) => badge.id === id)).filter(Boolean) ?? [];
  return <div className="screen-content summary-screen"><div className="summary-hero"><div className="summary-hero__sparkles"><SparkleIcon aria-hidden="true" size={18} /><SparkleIcon aria-hidden="true" size={12} /></div><Companion size={142} theme={theme.id} /><span className="eyebrow">LEÇON TERMINÉE</span><h1>Petite victoire, grand pas !</h1><p>{lesson.title} est dans ton sac à outils.</p></div><section className="summary-reward-card"><span className="summary-reward-card__label">RÉCOMPENSE DU JOUR</span><strong>+{reward?.xpGained ?? 0} XP</strong><span>Niveau {reward?.levelAfter ?? getLevelProgress(profile.progress.xpTotal).level}{reward && reward.levelAfter > reward.levelBefore ? " · Nouveau niveau !" : ""}</span>{reward?.completedUnit ? <p><CheckIcon aria-hidden="true" size={15} /> {unit.title} est maintenant terminée.</p> : null}</section>{earnedBadges.length ? <section className="summary-badges"><span className="eyebrow">NOUVEAU BADGE</span>{earnedBadges.map((badge) => <div className="summary-badge" key={badge?.id}><span>{badge?.emoji}</span><div><strong>{badge?.title}</strong><small>{badge?.description}</small></div></div>)}</section> : null}<div className="summary-actions"><button className="primary-button primary-button--wide" onClick={() => onNavigate("map")} type="button">Continuer le parcours<ChevronRightIcon aria-hidden="true" size={19} /></button><button className="secondary-button secondary-button--wide" onClick={() => onOpenLesson(lessonId)} type="button">Rejouer cette leçon</button><button className="prototype-back-link" onClick={() => onNavigate("home")} type="button"><HomeIcon aria-hidden="true" size={16} /> Accueil</button></div></div>;
}

export function BadgesScreen({ context, onNavigate }: CommonScreenProps) {
  const { profile, theme } = context;
  return <div className="screen-content collection-screen"><div className="screen-title-row"><div><span className="eyebrow">TES RÉUSSITES</span><h1>Les badges</h1><p>Chaque badge raconte un petit moment où tu as avancé.</p></div><div className="map-title-mark"><BadgeIcon aria-hidden="true" size={26} /></div></div><div className="collection-count"><strong>{profile.progress.badgeIds.length}</strong><span>sur {content.badges.length} badges obtenus</span></div><div className="badge-grid">{content.badges.map((badge) => { const earned = profile.progress.badgeIds.includes(badge.id); return <article className={`badge-card ${earned ? "badge-card--earned" : "badge-card--locked"}`} key={badge.id}><span className="badge-card__emoji">{earned ? badge.emoji : "?"}</span><strong>{earned ? badge.title : "À découvrir"}</strong><p>{badge.description}</p><span className="badge-card__state">{earned ? "Obtenu" : "Encore un petit pas"}</span></article>; })}</div><button className="prototype-back-link" onClick={() => onNavigate("home")} type="button"><HomeIcon aria-hidden="true" size={16} /> Revenir à l’accueil</button><span className="lesson-theme-note">Collection du thème {theme.universe}</span></div>;
}

export function SettingsScreen({ context, onNavigate, onChangeProfile, onPreferences }: CommonScreenProps & { onChangeProfile: () => void; onPreferences: (preferences: Partial<ProfilePreferences>) => void }) {
  const { profile, theme } = context;
  return <div className="screen-content settings-screen"><div className="screen-title-row"><div><span className="eyebrow">TON ESPACE</span><h1>Paramètres</h1><p>Personnalise l’aventure sans changer tes progrès.</p></div><div className="map-title-mark"><SettingsIcon aria-hidden="true" size={26} /></div></div><section className="settings-profile-card"><span className="avatar avatar--settings"><Companion size={64} theme={theme.id} /></span><div><strong>{theme.name}</strong><span>{theme.universe}</span></div><button className="text-button" onClick={onChangeProfile} type="button">Changer<ChevronRightIcon aria-hidden="true" size={16} /></button></section><section className="settings-group"><span className="eyebrow">SONS ET CONFORT</span><SettingToggle label="Sons activés" detail="Écouter les mots et les encouragements" checked={profile.preferences.soundsEnabled} onChange={(checked) => onPreferences({ soundsEnabled: checked })} /><SettingToggle label="Lecture automatique" detail="Lancer un exemple au début d’un exercice" checked={profile.preferences.autoPlay} onChange={(checked) => onPreferences({ autoPlay: checked })} /><div className="setting-row setting-row--column"><div><strong>Vitesse de lecture</strong><span>Une voix légèrement ralentie aide à bien entendre.</span></div><div className="rate-options">{([0.75, 0.9, 1] as const).map((rate) => <button aria-pressed={profile.preferences.speechRate === rate} className={profile.preferences.speechRate === rate ? "rate-option rate-option--selected" : "rate-option"} key={rate} onClick={() => onPreferences({ speechRate: rate })} type="button">{rate === 0.75 ? "Lente" : rate === 0.9 ? "Douce" : "Normale"}</button>)}</div></div></section><section className="settings-group"><span className="eyebrow">ACCOMPAGNEMENT</span><button className="settings-link" onClick={() => onNavigate("parent")} type="button"><span><strong>Espace parental</strong><small>Progression, unités disponibles et réinitialisation</small></span><ChevronRightIcon aria-hidden="true" size={18} /></button></section><button className="prototype-back-link" onClick={() => onNavigate("home")} type="button"><HomeIcon aria-hidden="true" size={16} /> Revenir à l’accueil</button></div>;
}

function SettingToggle({ label, detail, checked, onChange }: { label: string; detail: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <label className="setting-row"><span><strong>{label}</strong><small>{detail}</small></span><input aria-label={label} checked={checked} onChange={(event) => onChange(event.target.checked)} type="checkbox" /><span aria-hidden="true" className="toggle-control" /></label>;
}

export function ParentScreen({ context, onNavigate, onPreferences, onUnlockUnit, onResetProfile, onExportFamily, onRestoreFamily, onDeleteFamily, remoteSyncEnabled }: CommonScreenProps & { onPreferences: (preferences: Partial<ProfilePreferences>) => void; onUnlockUnit: (unitId: string, unlocked: boolean) => void; onResetProfile: () => void; onExportFamily: () => void; onRestoreFamily: (file: File) => void; onDeleteFamily: () => void; remoteSyncEnabled: boolean }) {
  const { profile, theme } = context;
  const [showReset, setShowReset] = useState(false);
  const consolidation = getTopConsolidationConcepts(profile.progress);
  const vocabularyById = new Map(content.vocabulary.map((item) => [item.id, item]));
  return <div className="screen-content parent-screen"><button className="screen-back-button" onClick={() => onNavigate("settings")} type="button"><ArrowLeftIcon aria-hidden="true" size={17} /> Paramètres</button><div className="screen-title-row"><div><span className="eyebrow">ESPACE PARENTAL</span><h1>Suivre sans pression</h1><p>{remoteSyncEnabled ? "Les progrès sont synchronisés pour ce compte familial et restent utilisables hors ligne." : "Les progrès restent enregistrés sur cet appareil et restent utilisables hors ligne."}</p></div><div className="map-title-mark"><TargetIcon aria-hidden="true" size={26} /></div></div><section className="parent-summary"><span className="avatar avatar--settings"><Companion size={58} theme={theme.id} /></span><div><strong>{profile.displayName}</strong><span>Niveau {getLevelProgress(profile.progress.xpTotal).level} · {profile.progress.xpTotal} XP</span></div><div><strong>{profile.progress.completedLessonIds.length}</strong><span>leçons terminées</span></div><div><strong>{profile.progress.badgeIds.length}</strong><span>badges</span></div></section><section className="parent-section"><SectionHeading eyebrow="PARCOURS" title="Unités disponibles" />{content.units.map((unit) => { const status = getUnitStatus(profile.progress, unit); const forced = profile.progress.parentUnlockedUnitIds.includes(unit.id); return <div className="parent-unit-row" key={unit.id}><div><strong>{unit.title}</strong><span>{unit.lessonIds.filter((id) => profile.progress.completedLessonIds.includes(id)).length} / {unit.lessonIds.length} leçons · {status === "locked" ? "verrouillée" : status === "completed" ? "terminée" : "ouverte"}</span></div><label className="parent-check"><input aria-label={`Rendre ${unit.title} disponible`} checked={status !== "locked" || forced} disabled={status !== "locked" && !forced} onChange={(event) => onUnlockUnit(unit.id, event.target.checked)} type="checkbox" /><span>{status !== "locked" || forced ? "Disponible" : "Ouvrir"}</span></label></div>; })}</section><section className="parent-section"><SectionHeading eyebrow="À REVOIR" title="Les notions à consolider" />{consolidation.length ? <div className="consolidation-list">{consolidation.map(({ conceptId, stat }) => { const vocabulary = vocabularyById.get(conceptId); return <div className="consolidation-row" key={conceptId}><span className="consolidation-row__icon"><TargetIcon aria-hidden="true" size={15} /></span><div><strong>{vocabulary?.english ?? conceptId}</strong><span>{vocabulary?.french ?? "Notion du parcours"}</span></div><small>{stat.errors} erreur{stat.errors > 1 ? "s" : ""} · à revoir</small></div>; })}</div> : <div className="empty-state"><CheckIcon aria-hidden="true" size={18} /><span>Aucune notion prioritaire pour le moment. Continue comme ça !</span></div>}</section><section className="parent-section"><SectionHeading eyebrow="PRÉFÉRENCES" title="Sons du profil" /><SettingToggle label="Sons activés" detail="Ce réglage est propre à ce profil." checked={profile.preferences.soundsEnabled} onChange={(checked) => onPreferences({ soundsEnabled: checked })} /></section><section className="parent-section"><SectionHeading eyebrow={remoteSyncEnabled ? "DONNÉES FAMILIALES" : "DONNÉES LOCALES"} title="Sauvegarder et restaurer" /><button className="settings-link" onClick={onExportFamily} type="button"><span><strong>Exporter un fichier JSON</strong><small>{remoteSyncEnabled ? "Conserver une copie récupérable de la famille" : "Conserver une copie récupérable de cet appareil"}</small></span><ChevronRightIcon aria-hidden="true" size={18} /></button><label className="settings-link"><span><strong>Restaurer un export JSON</strong><small>{remoteSyncEnabled ? "Remplacer les profils après validation du fichier" : "Remplacer les profils de cet appareil après validation du fichier"}</small></span><ChevronRightIcon aria-hidden="true" size={18} /><input accept="application/json,.json" onChange={(event) => { const file = event.target.files?.[0]; const confirmation = remoteSyncEnabled ? "Restaurer cet export remplacera tous les profils familiaux ?" : "Restaurer cet export remplacera les profils enregistrés sur cet appareil ?"; if (file && window.confirm(confirmation)) onRestoreFamily(file); event.currentTarget.value = ""; }} type="file" /></label></section><section className="parent-danger"><span className="eyebrow">ACTIONS SENSIBLES</span><strong>Réinitialiser le profil {profile.displayName}</strong><p>Les XP, leçons, badges et erreurs de ce profil seront remis à zéro. L’autre profil ne sera pas touché.</p>{showReset ? <div className="confirm-actions"><button className="secondary-button" onClick={() => setShowReset(false)} type="button">Annuler</button><button className="danger-button" onClick={() => { setShowReset(false); onResetProfile(); }} type="button">Confirmer</button></div> : <button className="danger-button danger-button--outline" onClick={() => setShowReset(true)} type="button">Réinitialiser</button>}<button className="danger-button danger-button--outline" onClick={onDeleteFamily} type="button">{remoteSyncEnabled ? "Supprimer les données familiales" : "Supprimer les données locales"}</button></section></div>;
}

export function BottomNavigation({ screen, onNavigate }: { screen: ScreenId; onNavigate: (screen: ScreenId) => void }) {
  const items: Array<{ id: ScreenId; label: string; icon: IconComponent }> = [{ id: "home", label: "Accueil", icon: HomeIcon }, { id: "map", label: "Parcours", icon: MapIcon }, { id: "badges", label: "Badges", icon: BadgeIcon }, { id: "settings", label: "Paramètres", icon: SettingsIcon }];
  return <nav aria-label="Navigation principale" className="bottom-navigation">{items.map(({ id, label, icon: Icon }) => <button className={`bottom-navigation__item ${screen === id ? "bottom-navigation__item--active" : ""}`} key={id} onClick={() => onNavigate(id)} type="button"><span className="bottom-navigation__icon"><Icon aria-hidden="true" size={20} /></span><span>{label}</span></button>)}</nav>;
}

export function AppChrome({ context, screen, children, mainRef, onNavigate, onChangeProfile }: { context: ScreenContext; screen: ScreenId; children: React.ReactNode; mainRef: RefObject<HTMLDivElement>; onNavigate: (screen: ScreenId) => void; onChangeProfile: () => void }) {
  return <><ThemeHeader context={context} onChangeProfile={onChangeProfile} /><div className="app-main" ref={mainRef}>{children}</div><BottomNavigation onNavigate={onNavigate} screen={screen} /></>;
}
