"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthActions, useConvexAuth } from "@convex-dev/auth/react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { FamilyConflictScreen, FamilySetupScreen } from "@/components/auth-screen";
import { SparkleIcon } from "@/components/icons";
import { AccessScreen, AppChrome, BadgesScreen, HomeScreen, LessonScreen, MapScreen, ParentScreen, SettingsScreen, SummaryScreen, UnitScreen, type FeedbackState, type ScreenContext, type ScreenId } from "@/components/learning-screens";
import { getLesson, getTheme, getUnit } from "@/content";
import type { ProfileId } from "@/lib/content/types";
import { advanceLesson, activateProfile, createInitialAppState, deactivateProfile, getLessonStatus, getUnitStatus, recordAudioListen, recordExerciseAnswer, recordExerciseError, resetProfile, startLesson, unlockUnitForParent, updatePreferences } from "@/lib/progression/engine";
import type { ExerciseResult } from "@/components/exercise-renderer";
import type { AppState, ProfileProgress } from "@/lib/progression/types";
import { clearLocalData, createLocalSyncState, loadAppState, loadSyncState, saveAppState, saveSyncState, type PersistenceMode } from "@/lib/storage/local-store";
import { familyExportToAppState, hasMeaningfulLocalData, hasMeaningfulProfileData, hydrateFamilyBundle, hydrateRemoteProfile, localSourceHash, syncStateFromBundle, toFamilyExport, toImportProfiles, toSnapshot, validateFamilyExport } from "@/lib/storage/convex-store";
import { normalizeRemoteProgress } from "@/lib/sync/remote-payload";
import type { LocalSyncState, RemoteFamilyBundle } from "@/lib/sync/sync-types";
import { getConflictProfileIds, getPendingSnapshotDecision } from "@/lib/sync/snapshot";
import { speakEnglish, stopSpeaking } from "@/lib/platform/speech";

function safeRemoteSnapshot(value: unknown, fallback: ProfileProgress) {
  try {
    return normalizeRemoteProgress(value);
  } catch {
    return fallback;
  }
}

type ImportedProfile = ReturnType<typeof toImportProfiles>[number];

type FamilyImportArgs = {
  schemaVersion: number;
  contentVersion: string;
  sourceHash: string;
  profiles: ImportedProfile[];
};

type FamilyBootstrapArgs = Omit<FamilyImportArgs, "sourceHash">;

type SnapshotMutationArgs = {
  profileKey: ProfileId;
  baseRevision: number;
  schemaVersion: number;
  contentVersion: string;
  snapshot: ReturnType<typeof toSnapshot>;
};

type SnapshotMutationResult = {
  status: "saved" | "conflict";
  revision: number;
  snapshot: unknown;
};

type RemoteFamilyActions = {
  isAuthenticated: boolean;
  familyBundle: RemoteFamilyBundle | null | undefined;
  bootstrapFamily: (args: FamilyBootstrapArgs) => Promise<RemoteFamilyBundle>;
  importLocalFamily: (args: FamilyImportArgs) => Promise<RemoteFamilyBundle>;
  restoreFamily: (args: FamilyImportArgs) => Promise<RemoteFamilyBundle>;
  saveRemoteSnapshot: (args: SnapshotMutationArgs) => Promise<SnapshotMutationResult>;
  removeFamilyData: (args: {}) => Promise<{ deletedProfiles: number }>;
  signOut: () => Promise<unknown>;
};

const LOCAL_ONLY_REMOTE_ACTIONS: RemoteFamilyActions = {
  isAuthenticated: false,
  familyBundle: null,
  bootstrapFamily: async () => {
    throw new Error("La synchronisation Convex n’est pas activée.");
  },
  importLocalFamily: async () => {
    throw new Error("La synchronisation Convex n’est pas activée.");
  },
  restoreFamily: async () => {
    throw new Error("La synchronisation Convex n’est pas activée.");
  },
  saveRemoteSnapshot: async () => {
    throw new Error("La synchronisation Convex n’est pas activée.");
  },
  removeFamilyData: async () => {
    throw new Error("La synchronisation Convex n’est pas activée.");
  },
  signOut: async () => undefined
};

function PrototypeAppCore({ remote }: { remote: RemoteFamilyActions }) {
  const { isAuthenticated, familyBundle, bootstrapFamily, importLocalFamily, restoreFamily, saveRemoteSnapshot, removeFamilyData, signOut } = remote;
  const [appState, setAppState] = useState<AppState | null>(null);
  const stateRef = useRef<AppState | null>(null);
  const [syncState, setSyncState] = useState<LocalSyncState | null>(null);
  const syncRef = useRef<LocalSyncState | null>(null);
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
  const [familySetup, setFamilySetup] = useState<"empty" | "remote-conflict" | null>(null);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [setupWorking, setSetupWorking] = useState(false);
  const [conflictProfileId, setConflictProfileId] = useState<ProfileId | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncWorking, setSyncWorking] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);
  const toastTimerRef = useRef<number | null>(null);
  const initializedFamilyRef = useRef<string | "empty" | null>(null);
  const uploadInFlightRef = useRef(new Set<ProfileId>());

  useEffect(() => {
    let mounted = true;
    void loadAppState().then(({ state, mode, recovered }) => {
      if (!mounted) return;
      stateRef.current = state;
      setAppState(state);
      setPersistenceMode(mode);
      setStorageRecovered(recovered);
      setScreen(state.activeProfileId ? "home" : "access");

      void loadSyncState(state).then(({ sync, recovered: syncRecovered }) => {
        if (!mounted) return;
        syncRef.current = sync;
        setSyncState(sync);
        setStorageRecovered((current) => current || syncRecovered);
      }).catch(() => {
        if (!mounted) return;
        const fallbackSync = createLocalSyncState(state);
        syncRef.current = fallbackSync;
        setSyncState(fallbackSync);
      });
    }).catch(() => {
      if (!mounted) return;
      const state = createInitialAppState();
      const initialSync = createLocalSyncState(state);
      stateRef.current = state;
      syncRef.current = initialSync;
      setAppState(state);
      setSyncState(initialSync);
      setScreen("access");
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !appState || !syncState || familyBundle === undefined) return;
    if (familyBundle === null) {
      if (initializedFamilyRef.current === "empty") return;
      initializedFamilyRef.current = "empty";
      const setupTimer = window.setTimeout(() => setFamilySetup("empty"), 0);
      return () => window.clearTimeout(setupTimer);
    }
    if (initializedFamilyRef.current === familyBundle.familyId) return;
    initializedFamilyRef.current = familyBundle.familyId;
    const hasPendingLocalCopy = Object.entries(syncState.profiles).some(([profileId, replica]) => replica.status === "conflict" || (replica.status === "pending" && Boolean(replica.pendingSnapshot) && (replica.baseRevision > 0 || hasMeaningfulProfileData(appState.profiles[profileId]))));
    if (hasPendingLocalCopy) {
      const remoteByProfileId = new Map(familyBundle.profiles.map((profile) => [profile.profileKey, profile]));
      const conflictIds: ProfileId[] = [];
      const reconciledSync: LocalSyncState = {
        profiles: Object.entries(syncState.profiles).reduce<LocalSyncState["profiles"]>((result, [profileId, replica]) => {
          const remoteProfile = remoteByProfileId.get(profileId);
          const isPendingLocalCopy = replica.status === "pending" && Boolean(replica.pendingSnapshot) && (replica.baseRevision > 0 || hasMeaningfulProfileData(appState.profiles[profileId]));
          if (replica.status === "conflict" && replica.conflict) {
            conflictIds.push(profileId);
            result[profileId] = remoteProfile ? {
              ...replica,
              conflict: {
                ...replica.conflict,
                remoteSnapshot: safeRemoteSnapshot(remoteProfile.snapshot, replica.conflict.remoteSnapshot),
                remoteRevision: remoteProfile.revision
              }
            } : replica;
          } else if (isPendingLocalCopy && replica.pendingSnapshot && remoteProfile && getPendingSnapshotDecision(replica.baseRevision, remoteProfile.revision) === "conflict") {
            const localSnapshot = replica.pendingSnapshot;
            conflictIds.push(profileId);
            result[profileId] = { baseRevision: replica.baseRevision, status: "conflict", conflict: { localSnapshot, remoteSnapshot: safeRemoteSnapshot(remoteProfile.snapshot, localSnapshot), remoteRevision: remoteProfile.revision } };
          } else if (isPendingLocalCopy && replica.pendingSnapshot && remoteProfile) {
            result[profileId] = { baseRevision: remoteProfile.revision, status: "pending", pendingSnapshot: replica.pendingSnapshot };
          } else if (isPendingLocalCopy && replica.pendingSnapshot) {
            conflictIds.push(profileId);
            result[profileId] = { baseRevision: replica.baseRevision, status: "conflict", conflict: { localSnapshot: replica.pendingSnapshot, remoteSnapshot: replica.pendingSnapshot, remoteRevision: 0 } };
          } else if (remoteProfile) {
            result[profileId] = { baseRevision: remoteProfile.revision, status: "synced" };
          } else {
            result[profileId] = replica;
          }
          return result;
        }, {})
      };
      familyBundle.profiles.forEach((remoteProfile) => {
        if (!reconciledSync.profiles[remoteProfile.profileKey]) reconciledSync.profiles[remoteProfile.profileKey] = { baseRevision: remoteProfile.revision, status: "synced" };
      });
      syncRef.current = reconciledSync;
      if (conflictIds.length > 0) {
        const conflictTimer = window.setTimeout(() => {
          setSyncState(reconciledSync);
          void saveSyncState(reconciledSync);
          setSyncError(null);
          setFamilySetup("remote-conflict");
          setConflictProfileId(conflictIds[0] ?? null);
        }, 0);
        return () => window.clearTimeout(conflictTimer);
      }
      let hydrated = hydrateFamilyBundle(familyBundle, appState);
      Object.entries(reconciledSync.profiles).forEach(([profileId, replica]) => {
        if (replica.status !== "pending" || !replica.pendingSnapshot || !hydrated.profiles[profileId]) return;
        hydrated = {
          ...hydrated,
          profiles: {
            ...hydrated.profiles,
            [profileId]: { ...hydrated.profiles[profileId], progress: replica.pendingSnapshot }
          }
        };
      });
      const hydratePendingTimer = window.setTimeout(() => {
        stateRef.current = hydrated;
        setAppState(hydrated);
        setSyncState(reconciledSync);
        void saveAppState(hydrated);
        void saveSyncState(reconciledSync);
        setFamilySetup(null);
        setConflictProfileId(null);
        setScreen(hydrated.activeProfileId ? "home" : "access");
      }, 0);
      return () => window.clearTimeout(hydratePendingTimer);
    }
    const hydrated = hydrateFamilyBundle(familyBundle, appState);
    const remoteSync = syncStateFromBundle(familyBundle);
    syncRef.current = remoteSync;
    const hydrateTimer = window.setTimeout(() => {
      stateRef.current = hydrated;
      setAppState(hydrated);
      setSyncState(remoteSync);
      void saveSyncState(remoteSync);
      setFamilySetup(null);
      setScreen(hydrated.activeProfileId ? "home" : "access");
    }, 0);
    return () => window.clearTimeout(hydrateTimer);
  }, [appState, familyBundle, isAuthenticated, syncState]);

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

  const persistSync = useCallback((nextSync: LocalSyncState) => {
    syncRef.current = nextSync;
    setSyncState(nextSync);
    void saveSyncState(nextSync).then((mode) => setPersistenceMode(mode));
  }, []);

  const advanceConflict = useCallback((nextSync: LocalSyncState) => {
    const nextConflictId = getConflictProfileIds(nextSync)[0] ?? null;
    setConflictProfileId(nextConflictId);
    setFamilySetup(nextConflictId ? "remote-conflict" : null);
  }, []);

  const uploadProfile = useCallback(async (profileId: ProfileId, snapshot: ReturnType<typeof toSnapshot>) => {
    if (!isAuthenticated || familyBundle === null || familyBundle === undefined || isOnline === false || uploadInFlightRef.current.has(profileId)) return;
    const replica = syncRef.current?.profiles[profileId];
    if (!replica || replica.status === "conflict") return;
    uploadInFlightRef.current.add(profileId);
    try {
      const result = await saveRemoteSnapshot({ profileKey: profileId, baseRevision: replica.baseRevision, schemaVersion: appState?.schemaVersion ?? 1, contentVersion: appState?.contentVersion ?? "", snapshot });
      const latestReplica = syncRef.current?.profiles[profileId];
      const latestPending = latestReplica?.pendingSnapshot;
      const localChangedDuringUpload = latestPending && JSON.stringify(latestPending) !== JSON.stringify(snapshot);
      if (result.status === "saved") {
        const nextSync: LocalSyncState = {
          ...(syncRef.current ?? { profiles: {} }),
          profiles: {
            ...(syncRef.current?.profiles ?? {}),
            [profileId]: localChangedDuringUpload ? { baseRevision: result.revision, status: "pending", pendingSnapshot: latestPending } : { baseRevision: result.revision, status: "synced" }
          }
        };
        persistSync(nextSync);
        if (!localChangedDuringUpload) {
          setSyncError(null);
          advanceConflict(nextSync);
        }
      } else {
        const currentLocal = latestPending ?? snapshot;
        const fallback = stateRef.current?.profiles[profileId]?.progress ?? currentLocal;
        const remoteSnapshot = safeRemoteSnapshot(result.snapshot, fallback);
        const nextSync: LocalSyncState = {
          ...(syncRef.current ?? { profiles: {} }),
          profiles: {
            ...(syncRef.current?.profiles ?? {}),
            [profileId]: { baseRevision: replica.baseRevision, status: "conflict", conflict: { localSnapshot: currentLocal, remoteSnapshot: remoteSnapshot ?? fallback, remoteRevision: result.revision } }
          }
        };
        persistSync(nextSync);
        setFamilySetup("remote-conflict");
        setConflictProfileId(profileId);
        setSyncError("Une autre version de ce profil a été enregistrée sur un autre appareil.");
      }
    } catch {
      setSyncError("La synchronisation est temporairement indisponible. La copie locale est conservée.");
    } finally {
      uploadInFlightRef.current.delete(profileId);
    }
  }, [advanceConflict, appState, familyBundle, isAuthenticated, isOnline, persistSync, saveRemoteSnapshot]);

  const commit = (nextState: AppState) => {
    const previousProfileId = stateRef.current?.activeProfileId;
    const profileId = nextState.activeProfileId ?? previousProfileId;
    stateRef.current = nextState;
    setAppState(nextState);
    void saveAppState(nextState).then((mode) => setPersistenceMode(mode));
    if (isAuthenticated && profileId && nextState.profiles[profileId] && syncRef.current?.profiles[profileId]) {
      const snapshot = toSnapshot(nextState, profileId);
      const currentReplica = syncRef.current.profiles[profileId];
      const nextSync: LocalSyncState = {
        ...syncRef.current,
        profiles: {
          ...syncRef.current.profiles,
          [profileId]: { baseRevision: currentReplica.baseRevision, status: "pending", pendingSnapshot: snapshot }
        }
      };
      persistSync(nextSync);
      void uploadProfile(profileId, snapshot);
    }
  };

  useEffect(() => {
    if (isOnline !== true || !isAuthenticated || !syncState || !familyBundle) return;
    Object.entries(syncState.profiles).forEach(([profileId, replica]) => {
      if (replica.status === "pending" && replica.pendingSnapshot) void uploadProfile(profileId, replica.pendingSnapshot);
    });
  }, [familyBundle, isAuthenticated, isOnline, syncState, uploadProfile]);

  const activeProfileId = appState?.activeProfileId ?? null;
  const context: ScreenContext | null = appState && activeProfileId ? {
    state: appState,
    profile: appState.profiles[activeProfileId],
    theme: getTheme(appState.profiles[activeProfileId].themeId)
  } : null;

  const handleLogin = (profileId: ProfileId, code: string) => {
    const profile = stateRef.current?.profiles[profileId];
    if (!profile || code !== profile.accessCode.toLowerCase() || !stateRef.current) return false;
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
    const currentState = stateRef.current;
    if (currentState?.activeProfileId) commit(deactivateProfile(currentState));
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

  const applyRemoteFamily = (remote: RemoteFamilyBundle, localState = stateRef.current ?? createInitialAppState()) => {
    const hydrated = hydrateFamilyBundle(remote, localState);
    const remoteSync = syncStateFromBundle(remote);
    initializedFamilyRef.current = remote.familyId;
    stateRef.current = hydrated;
    syncRef.current = remoteSync;
    setAppState(hydrated);
    setSyncState(remoteSync);
    void saveAppState(hydrated);
    void saveSyncState(remoteSync);
    setFamilySetup(null);
    setConflictProfileId(null);
    setSetupError(null);
    setSyncError(null);
    setScreen(hydrated.activeProfileId ? "home" : "access");
  };

  const resetInMemoryState = (nextState: AppState) => {
    const nextSync = createLocalSyncState(nextState);
    initializedFamilyRef.current = null;
    stateRef.current = nextState;
    syncRef.current = nextSync;
    setAppState(nextState);
    setSyncState(nextSync);
    setFamilySetup(null);
    setConflictProfileId(null);
    setSetupError(null);
    setSyncError(null);
    setFeedback(null);
    setActiveLessonId(null);
    setActiveUnitId(null);
    setScreen(nextState.activeProfileId ? "home" : "access");
  };

  const applyLocalState = (nextState: AppState) => {
    const nextSync = createLocalSyncState(nextState);
    resetInMemoryState(nextState);
    void saveAppState(nextState).then((mode) => setPersistenceMode(mode));
    void saveSyncState(nextSync).then((mode) => setPersistenceMode(mode));
  };

  const handleImportLocal = async () => {
    const localState = stateRef.current;
    if (!localState) return;
    setSetupWorking(true);
    setSetupError(null);
    try {
      const remote = await importLocalFamily({ schemaVersion: localState.schemaVersion, contentVersion: localState.contentVersion, sourceHash: localSourceHash(localState), profiles: toImportProfiles(localState) });
      applyRemoteFamily(remote as RemoteFamilyBundle, localState);
    } catch (reason) {
      setSetupError(reason instanceof Error ? reason.message : "L’import local n’a pas pu aboutir.");
    } finally {
      setSetupWorking(false);
    }
  };

  const handleStartFresh = async () => {
    if (hasMeaningfulLocalData(stateRef.current ?? createInitialAppState()) && !window.confirm("Repartir de zéro remplacera les progrès locaux par les profils de départ. Une copie locale peut être téléchargée avant de continuer.")) return;
    const freshState = createInitialAppState();
    setSetupWorking(true);
    setSetupError(null);
    try {
      const remote = await bootstrapFamily({ schemaVersion: freshState.schemaVersion, contentVersion: freshState.contentVersion, profiles: toImportProfiles(freshState) });
      applyRemoteFamily(remote as RemoteFamilyBundle, freshState);
    } catch (reason) {
      setSetupError(reason instanceof Error ? reason.message : "La création de l’espace familial a échoué.");
    } finally {
      setSetupWorking(false);
    }
  };

  const handleKeepLocalConflict = () => {
    if (!conflictProfileId || !syncRef.current?.profiles[conflictProfileId]) return;
    const replica = syncRef.current.profiles[conflictProfileId];
    if (!replica.conflict) return;
    if (replica.conflict.remoteRevision === 0) {
      setSyncError("Ce profil n’existe plus dans la copie distante. Utilise la version distante pour le retirer de cet appareil.");
      return;
    }
    const nextSync: LocalSyncState = {
      ...syncRef.current,
      profiles: {
        ...syncRef.current.profiles,
        [conflictProfileId]: { baseRevision: replica.conflict.remoteRevision, status: "pending", pendingSnapshot: replica.conflict.localSnapshot }
      }
    };
    persistSync(nextSync);
    setSyncWorking(true);
    void uploadProfile(conflictProfileId, replica.conflict.localSnapshot).finally(() => setSyncWorking(false));
  };

  const handleUseRemoteConflict = () => {
    if (!familyBundle || !conflictProfileId || !syncRef.current?.profiles[conflictProfileId]) return;
    const replica = syncRef.current.profiles[conflictProfileId];
    if (!replica.conflict) return;
    const remoteProfile = familyBundle.profiles.find((profile) => profile.profileKey === conflictProfileId);
    const currentState = stateRef.current;
    if (!currentState) return;
    let nextState = currentState;
    if (remoteProfile) {
      nextState = hydrateRemoteProfile(currentState, remoteProfile);
    } else {
      const { [conflictProfileId]: _discarded, ...remainingProfiles } = currentState.profiles;
      nextState = {
        ...currentState,
        activeProfileId: currentState.activeProfileId === conflictProfileId ? null : currentState.activeProfileId,
        profiles: remainingProfiles
      };
    }
    stateRef.current = nextState;
    setAppState(nextState);
    void saveAppState(nextState);
    const nextSync: LocalSyncState = {
      ...syncRef.current,
      profiles: {
        ...syncRef.current.profiles,
        [conflictProfileId]: { baseRevision: remoteProfile?.revision ?? 0, status: "synced" }
      }
    };
    persistSync(nextSync);
    setSyncError(null);
    advanceConflict(nextSync);
    setScreen(nextState.activeProfileId ? "home" : "access");
  };

  const handleExportFamily = () => {
    const state = stateRef.current;
    if (!state) return;
    const payload = toFamilyExport(state);
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `english-adventure-famille-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("L’export familial est prêt.");
  };

  const handleRestoreFamily = async (file: File) => {
    setSyncError(null);
    try {
      const parsed = JSON.parse(await file.text()) as unknown;
      const restored = validateFamilyExport(parsed);
      const restoredState = familyExportToAppState(restored);
      if (!isAuthenticated) {
        applyLocalState(restoredState);
        showToast("La famille locale a été restaurée.");
        return;
      }
      const remote = await restoreFamily({ schemaVersion: restoredState.schemaVersion, contentVersion: restoredState.contentVersion, sourceHash: localSourceHash(restoredState), profiles: toImportProfiles(restoredState) });
      applyRemoteFamily(remote as RemoteFamilyBundle, restoredState);
      showToast("La famille a été restaurée.");
    } catch (reason) {
      setSyncError(reason instanceof Error ? reason.message : "La restauration a échoué. Aucune donnée n’a été remplacée.");
    }
  };

  const handleDeleteFamily = async () => {
    const confirmation = isAuthenticated
      ? "Supprimer les données familiales Convex et la copie locale de cet appareil ? Cette action est irréversible."
      : "Supprimer les données familiales enregistrées sur cet appareil ? Cette action est irréversible.";
    if (!window.confirm(confirmation)) return;
    setSyncWorking(true);
    try {
      if (isAuthenticated) {
        await removeFamilyData({});
        await clearLocalData();
        const freshState = createInitialAppState();
        try {
          await signOut();
        } finally {
          resetInMemoryState(freshState);
        }
        showToast("Les données familiales ont été supprimées.");
      } else {
        await clearLocalData();
        resetInMemoryState(createInitialAppState());
        showToast("Les données locales ont été supprimées.");
      }
    } catch (reason) {
      setSyncError(reason instanceof Error ? reason.message : "La suppression n’a pas pu aboutir.");
    } finally {
      setSyncWorking(false);
    }
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
    if (screen === "parent") return <ParentScreen context={context} onDeleteFamily={handleDeleteFamily} onExportFamily={handleExportFamily} onNavigate={handleNavigate} onPreferences={handlePreferences} onResetProfile={handleResetProfile} onRestoreFamily={handleRestoreFamily} onToast={showToast} onUnlockUnit={handleUnlockUnit} remoteSyncEnabled={isAuthenticated} />;
    return <HomeScreen context={context} onNavigate={handleNavigate} onOpenLesson={handleOpenLesson} onToast={showToast} />;
  };

  const conflictReplica = conflictProfileId ? syncState?.profiles[conflictProfileId] : undefined;
  const conflictProfile = conflictProfileId ? appState?.profiles[conflictProfileId] : undefined;
  const appContent = !appState ? <div className="loading-screen"><span className="loading-screen__icon"><SparkleIcon aria-hidden="true" size={24} /></span><strong>Préparation de ton aventure…</strong><span>On retrouve tes progrès sur cet appareil.</span></div> : familySetup === "empty" ? <FamilySetupScreen hasLocalData={hasMeaningfulLocalData(appState)} isWorking={setupWorking} onExportLocal={handleExportFamily} onImportLocal={handleImportLocal} onStartFresh={handleStartFresh} error={setupError} /> : familySetup === "remote-conflict" && conflictProfile && conflictReplica?.conflict ? <FamilyConflictScreen error={syncError} isWorking={syncWorking} onKeepLocal={handleKeepLocalConflict} onUseRemote={handleUseRemoteConflict} profileName={conflictProfile.displayName} /> : familySetup === "remote-conflict" ? <div className="loading-screen"><span className="loading-screen__icon"><SparkleIcon aria-hidden="true" size={24} /></span><strong>Préparation du choix de synchronisation…</strong><span>Aucune version n’est supprimée automatiquement.</span></div> : screen === "access" || !context ? <AccessScreen profiles={Object.values(appState.profiles)} onLogin={handleLogin} /> : <AppChrome context={context} mainRef={mainRef} onChangeProfile={handleChangeProfile} onNavigate={handleNavigate} screen={screen}>{isOnline === false ? <div className="offline-banner" role="status"><span className="offline-banner__dot" /> Mode hors ligne · tes progrès continuent d’être enregistrés.</div> : null}{syncError ? <div className="recovery-banner" role="status">{syncError}</div> : null}{storageRecovered ? <div className="recovery-banner" role="status">Une ancienne donnée locale a été réparée. Ton parcours peut continuer.</div> : null}{renderScreen()}</AppChrome>;
  return <main className={`prototype-canvas theme-${themeId}`}><div className="prototype-canvas__halo prototype-canvas__halo--one" /><div className="prototype-canvas__halo prototype-canvas__halo--two" /><div className="prototype-caption"><span>Application familiale</span><strong>English Adventure</strong></div><div className="app-shell">{appContent}{toast ? <div aria-live="polite" className="prototype-toast">{toast}</div> : null}{persistenceMode === "memory" && appState ? <div className="storage-warning" role="status">Stockage local indisponible · cette session ne survivra pas à la fermeture.</div> : null}</div><p className="prototype-footnote">{isAuthenticated ? "Progression locale · synchronisation Convex quand la connexion est disponible" : "Progression locale · tes données restent sur cet appareil"}</p></main>;
}

function ConvexPrototypeApp() {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();
  const familyBundle = useQuery(api.family.get, isAuthenticated ? {} : "skip") as RemoteFamilyBundle | null | undefined;
  const bootstrapFamily = useMutation(api.family.bootstrap);
  const importLocalFamily = useMutation(api.family.importLocal);
  const restoreFamily = useMutation(api.family.restore);
  const saveRemoteSnapshot = useMutation(api.family.saveSnapshot);
  const removeFamilyData = useMutation(api.family.removeFamilyData);

  return <PrototypeAppCore remote={{
    isAuthenticated,
    familyBundle,
    bootstrapFamily: (args) => bootstrapFamily(args) as Promise<RemoteFamilyBundle>,
    importLocalFamily: (args) => importLocalFamily(args) as Promise<RemoteFamilyBundle>,
    restoreFamily: (args) => restoreFamily(args) as Promise<RemoteFamilyBundle>,
    saveRemoteSnapshot: (args) => saveRemoteSnapshot(args) as Promise<SnapshotMutationResult>,
    removeFamilyData: (args) => removeFamilyData(args),
    signOut: () => signOut()
  }} />;
}

export default function PrototypeApp() {
  return process.env.NEXT_PUBLIC_CONVEX_URL ? <ConvexPrototypeApp /> : <PrototypeAppCore remote={LOCAL_ONLY_REMOTE_ACTIONS} />;
}
