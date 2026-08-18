import type { ProfileId } from "@/lib/content/types";
import type { ProfileProgress } from "@/lib/progression/types";

export type SnapshotSyncStatus = "synced" | "pending" | "conflict";

export type LocalProfileReplica = {
  baseRevision: number;
  status: SnapshotSyncStatus;
  pendingSnapshot?: ProfileProgress;
  conflict?: {
    localSnapshot: ProfileProgress;
    remoteSnapshot: ProfileProgress;
    remoteRevision: number;
  };
};

export type LocalSyncState = {
  profiles: Record<ProfileId, LocalProfileReplica>;
};

export type RemoteProfileBundle = {
  profileKey: ProfileId;
  displayName: string;
  accessCode: string;
  themeId: "gabriel" | "luca";
  sortOrder: number;
  schemaVersion: number;
  contentVersion: string;
  revision: number;
  snapshot: unknown;
  updatedAt: number;
};

export type RemoteFamilyBundle = {
  familyId: string;
  schemaVersion: number;
  contentVersion: string;
  migrationVersion: number;
  profiles: RemoteProfileBundle[];
};
