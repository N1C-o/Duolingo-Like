"use client";

import { useEffect, useRef, useState } from "react";
import type { ComponentType } from "react";
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
  KeyIcon,
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
import { CapybaraMascot, GhostMascot, SceneIllustration } from "@/components/mascots";

type ThemeId = "gabriel" | "luca";
type ScreenId = "home" | "map" | "lesson";
type IconComponent = ComponentType<{ size?: number; className?: string; title?: string }>;

type ProfileConfig = {
  name: string;
  universe: string;
  greeting: string;
  subtitle: string;
  unitLead: string;
  lessonTitle: string;
  lessonCopy: string;
  progress: number;
  progressLabel: string;
  currency: string;
  currencyIcon: IconComponent;
  accentIcon: IconComponent;
};

const profiles: Record<ThemeId, ProfileConfig> = {
  gabriel: {
    name: "Gabriel",
    universe: "Capybaras",
    greeting: "Prêt pour une nouvelle aventure ?",
    subtitle: "Un petit pas en anglais, et la journée devient encore plus chouette.",
    unitLead: "Les mots de la famille",
    lessonTitle: "Se présenter 2",
    lessonCopy: "On continue à faire connaissance, tout doucement.",
    progress: 73,
    progressLabel: "660 / 900 XP",
    currency: "1 250",
    currencyIcon: LeafIcon,
    accentIcon: LeafIcon
  },
  luca: {
    name: "Luca",
    universe: "Manoir mystérieux",
    greeting: "Une nouvelle énigme t’attend.",
    subtitle: "Écoute bien… le manoir adore les petits explorateurs curieux.",
    unitLead: "Les mots de la table",
    lessonTitle: "Se présenter 2",
    lessonCopy: "Le fantôme a une question pour toi.",
    progress: 73,
    progressLabel: "660 / 900 XP",
    currency: "1 250",
    currencyIcon: KeyIcon,
    accentIcon: KeyIcon
  }
};

const answerOptions = [
  { id: "name", label: "Quel est ton prénom ?", detail: "What’s your name?", correct: true },
  { id: "age", label: "Quel âge as-tu ?", detail: "How old are you?", correct: false },
  { id: "feeling", label: "Comment vas-tu ?", detail: "How are you?", correct: false }
];

function Companion({ theme, size = 120, className }: { theme: ThemeId; size?: number; className?: string }) {
  return theme === "gabriel" ? <CapybaraMascot className={className} size={size} /> : <GhostMascot className={className} size={size} />;
}

function ThemeHeader({ theme, onToggle, onToast }: { theme: ThemeId; onToggle: () => void; onToast: (message: string) => void }) {
  const profile = profiles[theme];
  const CurrencyIcon = profile.currencyIcon;

  return (
    <header className="app-header">
      <div className="topbar">
        <div className="profile-switcher">
          <button aria-label={`Ouvrir le profil de ${profile.name}`} className="profile-avatar-button" onClick={() => onToast(`Aperçu du profil de ${profile.name}.`)} type="button">
            <span className="avatar avatar--top">
              <Companion size={48} theme={theme} />
            </span>
          </button>
          <button aria-label={`Changer de thème, thème ${profile.universe}`} className="profile-theme-button" onClick={onToggle} type="button">
            <span className="profile-switcher__copy">
              <span className="profile-switcher__name">{profile.name}</span>
              <span className="profile-switcher__universe">{profile.universe}</span>
            </span>
            <ChevronDownIcon aria-hidden="true" className="profile-switcher__chevron" size={16} />
          </button>
        </div>
        <div className="header-progress">
          <div className="header-progress__body">
            <div className="header-progress__meta">
              <strong>Niveau 7</strong>
              <span>{profile.progressLabel}</span>
            </div>
            <div aria-label={`${profile.progressLabel} vers le prochain niveau`} className="progress-track">
              <span className="progress-track__fill" style={{ width: `${profile.progress}%` }} />
            </div>
          </div>
          <div className="currency-pill">
            <CurrencyIcon aria-hidden="true" size={17} />
            <strong>{profile.currency}</strong>
          </div>
        </div>
      </div>
    </header>
  );
}

function SectionHeading({ eyebrow, title, action, onAction }: { eyebrow: string; title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="section-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
      </div>
      {action && onAction ? (
        <button className="text-button" onClick={onAction} type="button">
          {action}
          <ChevronRightIcon aria-hidden="true" size={16} />
        </button>
      ) : null}
    </div>
  );
}

function HomeScreen({ theme, onNavigate, onToast }: { theme: ThemeId; onNavigate: (screen: ScreenId) => void; onToast: (message: string) => void }) {
  const profile = profiles[theme];
  const AccentIcon = profile.accentIcon;

  return (
    <div className="screen-content home-screen">
      <section className="hero-card">
        <SceneIllustration theme={theme} />
        <div className="hero-card__wash" />
        <div className="hero-card__content">
          <span className="hero-card__eyebrow">TON AVENTURE EN ANGLAIS</span>
          <h1>{profile.greeting}</h1>
          <p>{profile.subtitle}</p>
          <div className="hero-card__stamp">
            <SparkleIcon aria-hidden="true" size={14} />
            <span>Une leçon • 5 min</span>
          </div>
        </div>
        <div className="hero-card__mascot">
          <Companion size={148} theme={theme} />
        </div>
      </section>

      <SectionHeading action="Voir tout" eyebrow="TON PARCOURS" onAction={() => onNavigate("map")} title="Encore un petit pas" />
      <section className="journey-preview" aria-label="Aperçu du parcours">
        <div className="journey-preview__path" />
        <PreviewNode state="complete" title="Se présenter" number="1" />
        <PreviewNode state="current" title="La famille" number="2" />
        <PreviewNode state="locked" title="À table !" number="3" />
      </section>

      <section className="current-lesson-card">
        <div className="current-lesson-card__topline">
          <div className="lesson-badge">
            <BookIcon aria-hidden="true" size={21} />
          </div>
          <div>
            <span className="eyebrow">LEÇON EN COURS</span>
            <h3>{profile.lessonTitle}</h3>
          </div>
          <span className="lesson-percent">80%</span>
        </div>
        <p>{profile.lessonCopy}</p>
        <div className="lesson-progress-row">
          <span>4 exercices sur 7</span>
          <div className="progress-track progress-track--small"><span className="progress-track__fill" style={{ width: "80%" }} /></div>
        </div>
        <button className="primary-button primary-button--wide" onClick={() => onNavigate("lesson")} type="button">
          Continuer
          <ChevronRightIcon aria-hidden="true" size={19} />
        </button>
      </section>

      <div className="feature-grid">
        <FeatureChip icon={ClockIcon} label="5 min" detail="par leçon" />
        <FeatureChip icon={HeartIcon} label="Sans pression" detail="pas de vies" />
        <FeatureChip icon={BookIcon} label="Apprendre" detail="en s’amusant" />
        <FeatureChip icon={TrophyIcon} label="Toujours" detail="plus fort !" />
      </div>

      <section className="gentle-note">
        <div className="gentle-note__icon"><AccentIcon aria-hidden="true" size={18} /></div>
        <div>
          <strong>Ta prochaine petite victoire</strong>
          <p>Réécoute la phrase, puis choisis la réponse qui te semble juste.</p>
        </div>
        <button aria-label="En savoir plus" className="round-arrow" onClick={() => onToast("Chaque erreur devient une nouvelle piste pour apprendre.")} type="button">
          <ChevronRightIcon aria-hidden="true" size={17} />
        </button>
      </section>
    </div>
  );
}

function PreviewNode({ state, title, number }: { state: "complete" | "current" | "locked"; title: string; number: string }) {
  return (
    <div className={`preview-node preview-node--${state}`}>
      <div className="preview-node__medallion">
        {state === "complete" ? <CheckIcon aria-hidden="true" size={18} /> : state === "locked" ? <LockIcon aria-hidden="true" size={16} /> : number}
      </div>
      <div className="preview-node__copy">
        <strong>{title}</strong>
        <span>{state === "complete" ? "6 / 6 leçons" : state === "current" ? "3 / 6 leçons" : "Bientôt"}</span>
      </div>
      {state !== "locked" ? <StarIcon aria-hidden="true" className="preview-node__star" size={17} /> : null}
    </div>
  );
}

function FeatureChip({ icon: Icon, label, detail }: { icon: IconComponent; label: string; detail: string }) {
  return (
    <div className="feature-chip">
      <span className="feature-chip__icon"><Icon aria-hidden="true" size={19} /></span>
      <span><strong>{label}</strong><small>{detail}</small></span>
    </div>
  );
}

function MapScreen({ theme, onNavigate, onToast }: { theme: ThemeId; onNavigate: (screen: ScreenId) => void; onToast: (message: string) => void }) {
  const profile = profiles[theme];

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
        <SceneIllustration theme={theme} />
        <div className="map-banner__content">
          <span className="map-banner__tag"><SparkleIcon aria-hidden="true" size={13} /> {profile.universe}</span>
          <strong>Ton chemin est déjà bien commencé.</strong>
          <span>2 unités terminées sur 8</span>
        </div>
        <div className="map-banner__mascot"><Companion size={88} theme={theme} /></div>
      </section>

      <section className="path-map" aria-label="Carte du parcours">
        <div className="path-map__line" />
        <MapUnitCard number="1" title="Se présenter" detail="6 / 6 leçons" status="complete" position="left" onClick={() => onToast("Cette unité est déjà terminée. Tu peux la rejouer quand tu veux.")} />
        <MapUnitCard number="2" title="La famille" detail="3 / 6 leçons" status="current" position="right" onClick={() => onNavigate("lesson")} />
        <MapUnitCard number="3" title="À table !" detail="6 leçons" status="locked" position="left" onClick={() => onToast("Cette unité se débloquera bientôt.")} />
        <MapUnitCard number="4" title="Ma journée" detail="6 leçons" status="locked" position="right" onClick={() => onToast("Encore quelques découvertes avant d’ouvrir cette porte.")} />
        <div className="path-map__start"><span>Début</span><SparkleBurstIcon aria-hidden="true" size={18} /></div>
      </section>

      <section className="map-resume-card">
        <div className="map-resume-card__icon"><BookIcon aria-hidden="true" size={22} /></div>
        <div>
          <span className="eyebrow">À REPRENDRE</span>
          <strong>{profile.lessonTitle}</strong>
          <span>5 min • 80% terminé</span>
        </div>
        <button aria-label="Reprendre la leçon" className="round-arrow" onClick={() => onNavigate("lesson")} type="button"><PlayIcon aria-hidden="true" size={16} /></button>
      </section>
    </div>
  );
}

function MapUnitCard({ number, title, detail, status, position, onClick }: { number: string; title: string; detail: string; status: "complete" | "current" | "locked"; position: "left" | "right"; onClick: () => void }) {
  return (
    <div className={`map-unit map-unit--${position} map-unit--${status}`}>
      <button aria-label={`${title}, ${detail}`} className="map-unit__node" onClick={onClick} type="button">
        {status === "complete" ? <CheckIcon aria-hidden="true" size={21} /> : status === "locked" ? <LockIcon aria-hidden="true" size={18} /> : number}
      </button>
      <button className="map-unit__card" onClick={onClick} type="button">
        <span className="map-unit__number">UNITÉ {number}</span>
        <strong>{title}</strong>
        <span>{detail}</span>
        <span className="map-unit__badge">{status === "complete" ? <CheckIcon aria-hidden="true" size={13} /> : status === "current" ? <StarIcon aria-hidden="true" size={13} /> : <LockIcon aria-hidden="true" size={12} />}</span>
      </button>
    </div>
  );
}

function LessonScreen({ theme, onNavigate, onToast }: { theme: ThemeId; onNavigate: (screen: ScreenId) => void; onToast: (message: string) => void }) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const profile = profiles[theme];
  const isCorrect = selectedAnswer === "name";

  const handlePrimary = () => {
    if (!selectedAnswer) {
      onToast("Choisis une réponse pour continuer.");
      return;
    }
    setFeedbackVisible(true);
  };

  return (
    <div className="screen-content lesson-screen">
      <div className="lesson-toolbar">
        <button aria-label="Retourner à l’accueil" className="round-icon-button" onClick={() => onNavigate("home")} type="button"><ArrowLeftIcon aria-hidden="true" size={19} /></button>
        <div className="lesson-toolbar__center"><span className="eyebrow">SE PRÉSENTER 2</span><strong>2 sur 7</strong></div>
        <button aria-label="Fermer la leçon" className="round-icon-button" onClick={() => onNavigate("home")} type="button"><span aria-hidden="true">×</span></button>
      </div>
      <div className="lesson-progress-line"><span style={{ width: "29%" }} /></div>

      <div className="lesson-heading">
        <span className="lesson-heading__tag"><VolumeIcon aria-hidden="true" size={14} /> ÉCOUTE</span>
        <h1>Écoute puis choisis</h1>
        <p>Comprends la question avant de répondre.</p>
      </div>

      <section className="exercise-card">
        <div className="exercise-card__topline">
          <span>Une question pour faire connaissance</span>
          <span className="exercise-card__time"><ClockIcon aria-hidden="true" size={14} /> 1 min</span>
        </div>
        <div className="exercise-stage">
          <div className="speech-bubble">
            <span className="speech-bubble__tiny">ÉCOUTE</span>
            <strong>What’s your name?</strong>
            <span className="speech-bubble__tail" />
          </div>
          <div className="exercise-stage__mascot"><Companion size={151} theme={theme} /></div>
          <div className="exercise-stage__sparkle exercise-stage__sparkle--one"><SparkleIcon aria-hidden="true" size={16} /></div>
          <div className="exercise-stage__sparkle exercise-stage__sparkle--two"><SparkleIcon aria-hidden="true" size={11} /></div>
        </div>
        <button className="audio-player" onClick={() => onToast("Lecture audio simulée — la phrase est prononcée doucement.")} type="button">
          <span className="audio-player__play"><PlayIcon aria-hidden="true" size={15} /></span>
          <span className="audio-player__copy"><strong>Écouter la phrase</strong><small>Tu peux réécouter autant de fois que tu veux</small></span>
          <span className="audio-player__wave" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /><i /></span>
          <VolumeIcon aria-hidden="true" size={18} />
        </button>

        <div className="answer-block">
          <div className="answer-block__label"><span>Que veut dire cette phrase ?</span><span>Choisis une réponse</span></div>
          <div className="answer-list">
            {answerOptions.map((option) => {
              const selected = selectedAnswer === option.id;
              return (
                <button className={`answer-option ${selected ? "answer-option--selected" : ""} ${feedbackVisible && option.correct ? "answer-option--correct" : ""}`} key={option.id} onClick={() => { setSelectedAnswer(option.id); setFeedbackVisible(false); }} type="button">
                  <span className="answer-option__radio">{selected ? <span /> : null}</span>
                  <span className="answer-option__copy"><strong>{option.label}</strong><small>{option.detail}</small></span>
                  {feedbackVisible && option.correct ? <CheckIcon aria-hidden="true" className="answer-option__check" size={19} /> : null}
                </button>
              );
            })}
          </div>
        </div>

        {feedbackVisible ? (
          <div className={`feedback-panel ${isCorrect ? "feedback-panel--success" : "feedback-panel--gentle"}`}>
            <span className="feedback-panel__icon">{isCorrect ? <CheckIcon aria-hidden="true" size={18} /> : <CloseIcon aria-hidden="true" size={18} />}</span>
            <div><strong>{isCorrect ? "Bravo, c’est ça !" : "Pas tout à fait"}</strong><p>{isCorrect ? "What’s your name? signifie « Quel est ton prénom ? »." : "La bonne réponse est « Quel est ton prénom ? ». Réécoute-la et continue tranquillement."}</p></div>
          </div>
        ) : null}

        <button className="primary-button primary-button--wide exercise-submit" disabled={!selectedAnswer} onClick={handlePrimary} type="button">
          {feedbackVisible ? "Continuer" : "Vérifier"}
          <ChevronRightIcon aria-hidden="true" size={19} />
        </button>
      </section>

      <div className="lesson-footer-note"><TargetIcon aria-hidden="true" size={17} /><span>Une erreur est une nouvelle piste pour apprendre.</span></div>
      <button className="prototype-back-link" onClick={() => onNavigate("map")} type="button"><MapIcon aria-hidden="true" size={16} /> Revenir au parcours</button>
      <span className="lesson-theme-note">Thème actif : {profile.universe}</span>
    </div>
  );
}

function BottomNavigation({ screen, onNavigate, onToast }: { screen: ScreenId; onNavigate: (screen: ScreenId) => void; onToast: (message: string) => void }) {
  const items: Array<{ id: ScreenId | "badges" | "settings"; label: string; icon: IconComponent }> = [
    { id: "home", label: "Accueil", icon: HomeIcon },
    { id: "map", label: "Parcours", icon: MapIcon },
    { id: "badges", label: "Badges", icon: BadgeIcon },
    { id: "settings", label: "Paramètres", icon: SettingsIcon }
  ];

  return (
    <nav aria-label="Navigation principale" className="bottom-navigation">
      {items.map(({ id, label, icon: Icon }) => {
        const active = id === screen;
        return (
          <button className={`bottom-navigation__item ${active ? "bottom-navigation__item--active" : ""}`} key={id} onClick={() => {
            if (id === "home" || id === "map") onNavigate(id);
            else if (id === "badges") onToast("Les badges arrivent dans la prochaine étape du prototype.");
            else onToast("Les paramètres seront conçus dans la prochaine étape du prototype.");
          }} type="button">
            <span className="bottom-navigation__icon"><Icon aria-hidden="true" size={20} /></span>
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export default function PrototypeApp() {
  const [theme, setTheme] = useState<ThemeId>("gabriel");
  const [screen, setScreen] = useState<ScreenId>("home");
  const [toast, setToast] = useState<string | null>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const toastTimerRef = useRef<number | null>(null);

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [screen]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  const navigate = (nextScreen: ScreenId) => {
    setScreen(nextScreen);
    setToast(null);
  };

  const toggleTheme = () => {
    const nextTheme = theme === "gabriel" ? "luca" : "gabriel";
    setTheme(nextTheme);
    showToast(`Aperçu du thème ${profiles[nextTheme].universe}.`);
  };

  const showToast = (message: string) => {
    if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
    setToast(message);
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 2400);
  };

  return (
    <main className={`prototype-canvas theme-${theme}`}>
      <div className="prototype-canvas__halo prototype-canvas__halo--one" />
      <div className="prototype-canvas__halo prototype-canvas__halo--two" />
      <div className="prototype-caption"><span>Prototype haute fidélité</span><strong>English Adventure</strong></div>
      <div className="app-shell">
        <ThemeHeader onToast={showToast} onToggle={toggleTheme} theme={theme} />
        <div className="app-main" key={screen} ref={mainRef}>
          {screen === "home" ? <HomeScreen onNavigate={navigate} onToast={showToast} theme={theme} /> : null}
          {screen === "map" ? <MapScreen onNavigate={navigate} onToast={showToast} theme={theme} /> : null}
          {screen === "lesson" ? <LessonScreen onNavigate={navigate} onToast={showToast} theme={theme} /> : null}
        </div>
        <BottomNavigation onNavigate={navigate} onToast={showToast} screen={screen} />
        {toast ? <div aria-live="polite" className="prototype-toast">{toast}</div> : null}
      </div>
      <p className="prototype-footnote">Maquette interactive · données simulées · pas de persistance</p>
    </main>
  );
}
