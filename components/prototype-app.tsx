"use client";

import { useEffect, useRef, useState } from "react";
import { SparkleIcon } from "@/components/icons";
import { AccessScreen, AppChrome, BadgesScreen, HomeScreen, LessonScreen, MapScreen, ParentScreen, SettingsScreen, SummaryScreen, UnitScreen, type FeedbackState, type ScreenContext, type ScreenId } from "@/components/learning-screens";
import { getLesson, getTheme, getUnit } from "@/content";
import { advanceLesson, activateProfile, getLessonStatus, getUnitStatus, recordAudioListen, recordExerciseAnswer, recordExerciseError, resetProfile, startLesson, unlockUnitForParent, updatePreferences } from "@/lib/progression/engine";
import type { ExerciseResult } from "@/components/exercise-renderer";
import type { AppState } from "@/lib/progression/types";
import { loadAppState, saveAppState, type PersistenceMode } from "@/lib/storage/local-store";
import { speakEnglish, stopSpeaking } from "@/lib/platform/speech";

export default function PrototypeApp() {
  const [appState, setAppState] = useState<AppState | null>(null);
  const stateRef = useRef<AppState | null>(null);
  const [persistenceMode, setPersistenceMode] = useState<PersistenceMode>("memory");
  const [screen, setScreen] = useState<ScreenId>("access");
  const [activeUnitId, setActiveUnitId] = useState<string | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [lastReward, setLastReward] = useState<ReturnType<typeof advanceLesson>["reward"] | null>(null);
  const [resetToken, setResetToken] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [storageRecovered, setStorageRecovered] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);
  const toastTimerRef = useRef<number | null>(null);

  useEffect(() => {
    let mounted = true;
    void loadAppState().then(({ state, mode, recovered }) => {
      if (!mounted) return;
      stateRef.current = state;
      setAppState(state);
      setPersistenceMode(mode);
      setStorageRecovered(recovered);
      setScreen(state.activeProfileId ? "home" : "access");
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const initialStatusTimer = window.setTimeout(() => setIsOnline(window.navigator.onLine), 0);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    if ("serviceWorker" in navigator) void navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    return () => {
      window.clearTimeout(initialStatusTimer);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: "auto" });
    stopSpeaking();
  }, [screen, activeLessonId]);

  useEffect(() => () => {
    stopSpeaking();
    if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
  }, []);

  const showToast = (message: string) => {
    if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
    setToast(message);
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 2600);
  };

  const commit = (nextState: AppState) => {
    stateRef.current = nextState;
    setAppState(nextState);
    void saveAppState(nextState).then((mode) => setPersistenceMode(mode));
  };

  const activeProfileId = appState?.activeProfileId ?? null;
  const context: ScreenContext | null = appState && activeProfileId ? {
    state: appState,
    profile: appState.profiles[activeProfileId],
    theme: getTheme(appState.profiles[activeProfileId].themeId)
  } : null;

  const handleLogin = (profileId: "gabriel" | "luca", code: string) => {
    if (code !== profileId || !stateRef.current) return false;
    commit(activateProfile(stateRef.current, profileId));
    setScreen("home");
    return true;
  };

  const handleNavigate = (nextScreen: ScreenId) => {
    if (nextScreen === "lesson" || nextScreen === "summary" || nextScreen === "access") return;
    setFeedback(null);
    setScreen(nextScreen);
  };

  const handleChangeProfile = () => {
    setFeedback(null);
    setScreen("access");
  };

  const handleOpenUnit = (unitId: string) => {
    if (!context) return;
    const unit = getUnit(unitId);
    if (getUnitStatus(context.profile.progress, unit) === "locked") {
      showToast("Cette unité est encore verrouillée. Continue la précédente pour l’ouvrir.");
      return;
    }
    setActiveUnitId(unitId);
    setScreen("unit");
  };

  const handleOpenLesson = (lessonId: string) => {
    if (!context || !stateRef.current) return;
    const lesson = getLesson(lessonId);
    if (getLessonStatus(context.profile.progress, lesson) === "locked") {
      showToast("Termine l’étape précédente pour ouvrir cette leçon.");
      return;
    }
    commit(startLesson(stateRef.current, context.profile.id, lessonId));
    setActiveUnitId(lesson.unitId);
    setActiveLessonId(lessonId);
    setFeedback(null);
    setScreen("lesson");
  };

  const handleExerciseAttempt = (result: ExerciseResult, completesExercise: boolean) => {
    const currentState = stateRef.current;
    const profileId = currentState?.activeProfileId;
    if (!currentState || !profileId || !activeLessonId) return;
    const lesson = getLesson(activeLessonId);
    const session = currentState.profiles[profileId].progress.lessonSessions[activeLessonId];
    const index = session ? Math.min(session.currentExerciseIndex, lesson.exercises.length - 1) : 0;
    const exercise = lesson.exercises[index];
    const outcome = completesExercise
      ? recordExerciseAnswer(currentState, profileId, activeLessonId, exercise.id, result.answer)
      : recordExerciseError(currentState, profileId, activeLessonId, exercise.id, result.answer);
    commit(outcome.state);
    if (!completesExercise) return;
    setFeedback({ correct: outcome.correct, explanation: exercise.explanation, answerLabel: result.answerLabel, xpGained: outcome.reward.xpGained });
    if (outcome.reward.newlyAwardedBadgeIds.length) showToast("Un nouveau badge est prêt à découvrir !");
  };

  const handleSubmit = (result: ExerciseResult) => handleExerciseAttempt(result, true);

  const handleExerciseError = (result: ExerciseResult) => handleExerciseAttempt(result, false);

  const handleContinue = () => {
    const currentState = stateRef.current;
    if (!currentState || !context || !activeLessonId) return;
    const outcome = advanceLesson(currentState, context.profile.id, activeLessonId);
    commit(outcome.state);
    setFeedback(null);
    if (outcome.completed) {
      setLastReward(outcome.reward);
      setScreen("summary");
      if (outcome.reward.completedUnit) showToast("Une nouvelle unité est disponible !");
    } else {
      setResetToken((value) => value + 1);
    }
  };

  const handleRetry = () => {
    setFeedback(null);
    setResetToken((value) => value + 1);
  };

  const handleSpeak = (text: string) => {
    const currentContext = stateRef.current?.activeProfileId && stateRef.current ? {
      state: stateRef.current,
      profile: stateRef.current.profiles[stateRef.current.activeProfileId],
      theme: getTheme(stateRef.current.profiles[stateRef.current.activeProfileId].themeId)
    } : null;
    if (!currentContext || !currentContext.profile.preferences.soundsEnabled) {
      showToast("Les sons sont désactivés dans les paramètres.");
      return false;
    }
    const didSpeak = speakEnglish(text, currentContext.profile.preferences.speechRate);
    if (!didSpeak) {
      showToast("La voix anglaise n’est pas disponible. Tu peux continuer en mode silencieux.");
      return false;
    }
    const listened = recordAudioListen(currentContext.state, currentContext.profile.id);
    commit(listened.state);
    if (listened.newlyAwardedBadgeIds.length) showToast("Bravo, le badge Bonne oreille est obtenu !");
    return true;
  };

  const handlePreferences = (preferences: Parameters<typeof updatePreferences>[2]) => {
    const currentState = stateRef.current;
    if (!currentState || !activeProfileId) return;
    const next = updatePreferences(currentState, activeProfileId, preferences);
    commit(next);
    if (preferences.soundsEnabled === false) stopSpeaking();
  };

  const handleUnlockUnit = (unitId: string, unlocked: boolean) => {
    const currentState = stateRef.current;
    if (!currentState || !activeProfileId) return;
    commit(unlockUnitForParent(currentState, activeProfileId, unitId, unlocked));
  };

  const handleResetProfile = () => {
    const currentState = stateRef.current;
    if (!currentState || !activeProfileId) return;
    commit(resetProfile(currentState, activeProfileId));
    setScreen("access");
    setActiveLessonId(null);
    setActiveUnitId(null);
    showToast("Le profil a été remis à zéro.");
  };

  const themeId = context?.theme.id ?? "gabriel";
  const renderScreen = () => {
    if (!context) return null;
    if (screen === "home") return <HomeScreen context={context} onNavigate={handleNavigate} onOpenLesson={handleOpenLesson} onToast={showToast} />;
    if (screen === "map") return <MapScreen context={context} onNavigate={handleNavigate} onOpenLesson={handleOpenLesson} onOpenUnit={handleOpenUnit} onToast={showToast} />;
    if (screen === "unit" && activeUnitId) return <UnitScreen context={context} onNavigate={handleNavigate} onOpenLesson={handleOpenLesson} onToast={showToast} unitId={activeUnitId} />;
    if (screen === "lesson" && activeLessonId) return <LessonScreen context={context} feedback={feedback} lessonId={activeLessonId} onContinue={handleContinue} onError={handleExerciseError} onNavigate={handleNavigate} onRetry={handleRetry} onSpeak={handleSpeak} onSubmit={handleSubmit} onToast={showToast} resetToken={resetToken} />;
    if (screen === "summary" && activeLessonId) return <SummaryScreen context={context} lessonId={activeLessonId} onNavigate={handleNavigate} onOpenLesson={handleOpenLesson} onToast={showToast} reward={lastReward} />;
    if (screen === "badges") return <BadgesScreen context={context} onNavigate={handleNavigate} onToast={showToast} />;
    if (screen === "settings") return <SettingsScreen context={context} onChangeProfile={handleChangeProfile} onNavigate={handleNavigate} onPreferences={handlePreferences} onToast={showToast} />;
    if (screen === "parent") return <ParentScreen context={context} onNavigate={handleNavigate} onPreferences={handlePreferences} onResetProfile={handleResetProfile} onToast={showToast} onUnlockUnit={handleUnlockUnit} />;
    return <HomeScreen context={context} onNavigate={handleNavigate} onOpenLesson={handleOpenLesson} onToast={showToast} />;
  };

  return <main className={`prototype-canvas theme-${themeId}`}><div className="prototype-canvas__halo prototype-canvas__halo--one" /><div className="prototype-canvas__halo prototype-canvas__halo--two" /><div className="prototype-caption"><span>Application locale</span><strong>English Adventure</strong></div><div className="app-shell">{!appState ? <div className="loading-screen"><span className="loading-screen__icon"><SparkleIcon aria-hidden="true" size={24} /></span><strong>Préparation de ton aventure…</strong><span>Les progrès restent sur cet appareil.</span></div> : screen === "access" || !context ? <AccessScreen onLogin={handleLogin} /> : <AppChrome context={context} mainRef={mainRef} onChangeProfile={handleChangeProfile} onNavigate={handleNavigate} screen={screen}>{isOnline === false ? <div className="offline-banner" role="status"><span className="offline-banner__dot" /> Mode hors ligne · tes progrès continuent d’être enregistrés.</div> : null}{storageRecovered ? <div className="recovery-banner" role="status">Une ancienne donnée locale a été réparée. Ton parcours peut continuer.</div> : null}{renderScreen()}</AppChrome>}{toast ? <div aria-live="polite" className="prototype-toast">{toast}</div> : null}{persistenceMode === "memory" && appState ? <div className="storage-warning" role="status">Stockage local indisponible · cette session ne survivra pas à la fermeture.</div> : null}</div><p className="prototype-footnote">Progression locale · fonctionnement hors ligne après le premier chargement</p></main>;
}
