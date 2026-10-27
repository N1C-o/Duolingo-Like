import { content } from "@/content";
import { createInitialAppState, createProfile } from "@/lib/progression/engine";
import type { ProfileId } from "@/lib/content/types";
import type { AppState, LocalProfile, ProfileProgress } from "@/lib/progression/types";
import { normalizeRemoteProgress } from "@/lib/sync/remote-payload";
import { pruneReplayXpByDay } from "@/lib/sync/snapshot";
import type { LocalSyncState, RemoteFamilyBundle, RemoteProfileBundle } from "@/lib/sync/sync-types";

export const FAMILY_EXPORT_KIND = "english-adventure-family-export" as const;
export const FAMILY_EXPORT_VERSION = 1 as const;

export type FamilyExport = {
  kind: typeof FAMILY_EXPORT_KIND;
  exportVersion: typeof FAMILY_EXPORT_VERSION;
  exportedAt: string;
  schemaVersion: number;
  contentVersion: string;
  profiles: Array<{
    profileKey: ProfileId;
    displayName: string;
    accessCode: string;
    themeId: "gabriel" | "luca";
    sortOrder: number;
    snapshot: ProfileProgress;
  }>;
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function safeProgress(value: unknown, fallback: ProfileProgress) {
  try {
    return normalizeRemoteProgress(value);
  } catch {
    return clone(fallback);
  }
}

function sortedProfiles(profiles: RemoteProfileBundle[]) {
  return [...profiles].sort((left, right) => left.sortOrder - right.sortOrder);
}

export function hydrateRemoteProfile(localState: AppState, remoteProfile: RemoteProfileBundle): AppState {
  const localProfile = localState.profiles[remoteProfile.profileKey];
  const fallback = localProfile ?? createProfile(remoteProfile.profileKey, remoteProfile.themeId, remoteProfile.displayName, remoteProfile.accessCode);
  return {
    ...localState,
    profiles: {
      ...localState.profiles,
      [remoteProfile.profileKey]: {
        ...fallback,
        id: remoteProfile.profileKey,
        displayName: remoteProfile.displayName,
        accessCode: remoteProfile.accessCode,
        themeId: remoteProfile.themeId,
        progress: safeProgress(remoteProfile.snapshot, fallback.progress)
      }
    }
  };
}

export function hydrateFamilyBundle(bundle: RemoteFamilyBundle, localState?: AppState): AppState {
  const initial = createInitialAppState();
  const profiles = sortedProfiles(bundle.profiles).reduce<AppState["profiles"]>((result, remoteProfile) => {
    const localProfile = localState?.profiles[remoteProfile.profileKey];
    const fallback = localProfile ?? createProfile(remoteProfile.profileKey, remoteProfile.themeId, remoteProfile.displayName, remoteProfile.accessCode);
    result[remoteProfile.profileKey] = {
      ...fallback,
      id: remoteProfile.profileKey,
      displayName: remoteProfile.displayName,
      accessCode: remoteProfile.accessCode,
      themeId: remoteProfile.themeId,
      progress: safeProgress(remoteProfile.snapshot, fallback.progress)
    };
    return result;
  }, {});
  return {
    ...initial,
    schemaVersion: bundle.schemaVersion,
    contentVersion: bundle.contentVersion || content.course.contentVersion,
    activeProfileId: localState?.activeProfileId && profiles[localState.activeProfileId] ? localState.activeProfileId : null,
    introSeen: localState?.introSeen ?? false,
    profiles
  };
}

export function toImportProfiles(state: AppState) {
  return Object.values(state.profiles).map((profile, sortOrder) => {
    const snapshot = clone(profile.progress);
    snapshot.replayXpByDay = pruneReplayXpByDay(snapshot.replayXpByDay);
    return {
      profileKey: profile.id,
      displayName: profile.displayName,
      accessCode: profile.accessCode,
      themeId: profile.themeId,
      sortOrder,
      snapshot,
      schemaVersion: state.schemaVersion,
      contentVersion: state.contentVersion
    };
  });
}

export function toSnapshot(state: AppState, profileId: ProfileId) {
  const profile = state.profiles[profileId];
  if (!profile) throw new Error(`Profil introuvable : ${profileId}`);
  const snapshot = clone(profile.progress);
  snapshot.replayXpByDay = pruneReplayXpByDay(snapshot.replayXpByDay);
  return snapshot;
}

export function hasMeaningfulProfileData(profile: LocalProfile | undefined) {
  if (!profile) return false;
  const progress = profile.progress;
  return progress.xpTotal > 0 || progress.completedLessonIds.length > 0 || progress.startedLessonIds.length > 0 || progress.completedExerciseIds.length > 0 || progress.parentUnlockedUnitIds.length > 0 || Object.keys(progress.lessonSessions).length > 0 || Object.keys(progress.exerciseStats).length > 0 || Object.keys(progress.conceptStats).length > 0 || progress.badgeIds.length > 0 || Object.keys(progress.replayXpByDay).length > 0 || progress.audioListenCount > 0 || progress.revisionCompletedCount > 0 || progress.consolidatedConceptIds.length > 0 || progress.lastActivityAt !== null;
}

export function hasMeaningfulLocalData(state: AppState) {
  return Object.values(state.profiles).some((profile) => hasMeaningfulProfileData(profile));
}

export function localSourceHash(state: AppState) {
  const serialized = JSON.stringify(toImportProfiles(state));
  let hash = 2166136261;
  for (let index = 0; index < serialized.length; index += 1) {
    hash ^= serialized.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `local-${(hash >>> 0).toString(16)}`;
}

export function syncStateFromBundle(bundle: RemoteFamilyBundle): LocalSyncState {
  return {
    profiles: sortedProfiles(bundle.profiles).reduce<LocalSyncState["profiles"]>((result, profile) => {
      result[profile.profileKey] = { baseRevision: profile.revision, status: "synced" };
      return result;
    }, {})
  };
}

export function toFamilyExport(state: AppState): FamilyExport {
  return {
    kind: FAMILY_EXPORT_KIND,
    exportVersion: FAMILY_EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    schemaVersion: state.schemaVersion,
    contentVersion: state.contentVersion,
    profiles: toImportProfiles(state).map(({ schemaVersion: _schemaVersion, contentVersion: _contentVersion, ...profile }) => profile)
  };
}

export function familyExportToAppState(value: FamilyExport): AppState {
  const profiles = value.profiles.map((profile) => {
    const localProfile = createProfile(profile.profileKey, profile.themeId, profile.displayName, profile.accessCode);
    return { ...localProfile, progress: clone(profile.snapshot) };
  });
  const state = createInitialAppState(profiles);
  return { ...state, schemaVersion: value.schemaVersion, contentVersion: value.contentVersion };
}

export function validateFamilyExport(value: unknown): FamilyExport {
  if (typeof value !== "object" || value === null || Array.isArray(value)) throw new Error("Format d’export invalide");
  const candidate = value as Partial<FamilyExport>;
  if (candidate.kind !== FAMILY_EXPORT_KIND || candidate.exportVersion !== FAMILY_EXPORT_VERSION) throw new Error("Version d’export non prise en charge");
  // The extension keeps all existing lesson and exercise identifiers. Old backups
  // remain restorable; unknown curricula and incompatible schemas stay rejected.
  const compatibleContentVersions = ["1.2.1", content.course.contentVersion];
  if (candidate.schemaVersion !== 1 || !compatibleContentVersions.includes(candidate.contentVersion ?? "")) throw new Error("Cet export appartient à une autre version du parcours");
  if (!Array.isArray(candidate.profiles) || candidate.profiles.length === 0 || candidate.profiles.length > 20) throw new Error("Le nombre de profils exportés est invalide");
  const profiles = candidate.profiles.map((profile) => {
    if (typeof profile !== "object" || profile === null || typeof profile.profileKey !== "string" || !profile.profileKey || typeof profile.displayName !== "string" || typeof profile.accessCode !== "string" || (profile.themeId !== "gabriel" && profile.themeId !== "luca") || typeof profile.sortOrder !== "number") {
      throw new Error("Profil exporté invalide");
    }
    const snapshot = normalizeRemoteProgress(profile.snapshot);
    return { ...profile, snapshot };
  });
  if (new Set(profiles.map((profile) => profile.profileKey)).size !== profiles.length) throw new Error("Les profils exportés doivent être uniques");
  return {
    kind: FAMILY_EXPORT_KIND,
    exportVersion: FAMILY_EXPORT_VERSION,
    exportedAt: typeof candidate.exportedAt === "string" ? candidate.exportedAt : new Date().toISOString(),
    schemaVersion: 1,
    contentVersion: content.course.contentVersion,
    profiles
  };
}
