import type { ProfileProgress } from "@/lib/progression/types";
import type { LocalSyncState } from "@/lib/sync/sync-types";

export type SnapshotSyncStatus = "synced" | "conflict";
export type ConflictChoice = "local" | "remote";

function localDateStart(date: Date) {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
}

function dateFromKey(key: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!match) return null;
  const [, year, month, day] = match;
  const timestamp = Date.UTC(Number(year), Number(month) - 1, Number(day));
  return Number.isNaN(timestamp) ? null : timestamp;
}

export function pruneReplayXpByDay(
  replayXpByDay: ProfileProgress["replayXpByDay"],
  referenceDate = new Date(),
  retentionDays = 31
): ProfileProgress["replayXpByDay"] {
  const referenceStart = localDateStart(referenceDate);
  const maxAge = Math.max(1, retentionDays);
  return Object.entries(replayXpByDay).reduce<ProfileProgress["replayXpByDay"]>((result, [key, value]) => {
    const datePart = key.split(":", 1)[0];
    const entryStart = dateFromKey(datePart);
    if (entryStart === null) return result;
    const age = Math.floor((referenceStart - entryStart) / 86_400_000);
    if (age >= 0 && age < maxAge) result[key] = value;
    return result;
  }, {});
}

export function shouldUploadSnapshot(baseRevision: number, remoteRevision: number) {
  return baseRevision === remoteRevision;
}

export function getPendingSnapshotDecision(baseRevision: number, remoteRevision: number): "upload" | "conflict" {
  return shouldUploadSnapshot(baseRevision, remoteRevision) ? "upload" : "conflict";
}

export function getConflictProfileIds(sync: LocalSyncState) {
  return Object.entries(sync.profiles)
    .filter(([, replica]) => replica.status === "conflict")
    .map(([profileId]) => profileId);
}

export function getSnapshotSyncStatus(baseRevision: number, remoteRevision: number): SnapshotSyncStatus {
  return shouldUploadSnapshot(baseRevision, remoteRevision) ? "synced" : "conflict";
}

export function chooseSnapshotConflict<T>(choice: ConflictChoice, local: T, remote: T) {
  return choice === "local" ? local : remote;
}
