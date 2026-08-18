import { describe, expect, it } from "vitest";
import { createEmptyProgress } from "@/lib/progression/engine";
import {
  chooseSnapshotConflict,
  getConflictProfileIds,
  getPendingSnapshotDecision,
  getSnapshotSyncStatus,
  pruneReplayXpByDay,
  shouldUploadSnapshot
} from "@/lib/sync/snapshot";
import type { LocalSyncState } from "@/lib/sync/sync-types";

describe("synchronisation des snapshots", () => {
  it("borne les compteurs journaliers de rejeu", () => {
    const progress = createEmptyProgress();
    progress.replayXpByDay = {
      "2026-06-01:hello-01": 5,
      "2026-07-01:hello-01": 5,
      "2026-08-01:hello-01": 5,
      "2026-08-08:hello-01": 5
    };

    const pruned = pruneReplayXpByDay(progress.replayXpByDay, new Date("2026-08-08T12:00:00.000Z"), 31);

    expect(pruned).toEqual({
      "2026-08-01:hello-01": 5,
      "2026-08-08:hello-01": 5
    });
  });

  it("n’envoie un snapshot que si la révision distante n’a pas changé", () => {
    expect(shouldUploadSnapshot(4, 4)).toBe(true);
    expect(shouldUploadSnapshot(4, 5)).toBe(false);
  });

  it("reprend automatiquement un pending après redémarrage si la base distante est inchangée", () => {
    expect(getPendingSnapshotDecision(4, 4)).toBe("upload");
    expect(getPendingSnapshotDecision(4, 5)).toBe("conflict");
  });

  it("retourne tous les profils en conflit dans un ordre stable", () => {
    const sync: LocalSyncState = {
      profiles: {
        luca: { baseRevision: 2, status: "conflict", conflict: { localSnapshot: createEmptyProgress(), remoteSnapshot: createEmptyProgress(), remoteRevision: 3 } },
        gabriel: { baseRevision: 1, status: "synced" },
        zoe: { baseRevision: 4, status: "conflict", conflict: { localSnapshot: createEmptyProgress(), remoteSnapshot: createEmptyProgress(), remoteRevision: 5 } }
      }
    };

    expect(getConflictProfileIds(sync)).toEqual(["luca", "zoe"]);
  });

  it("distingue un état synchronisé d’un conflit", () => {
    expect(getSnapshotSyncStatus(4, 4)).toBe("synced");
    expect(getSnapshotSyncStatus(4, 5)).toBe("conflict");
  });

  it("conserve la version choisie sans fusion implicite", () => {
    const local = { xpTotal: 10 };
    const remote = { xpTotal: 20 };

    expect(chooseSnapshotConflict("local", local, remote)).toEqual(local);
    expect(chooseSnapshotConflict("remote", local, remote)).toEqual(remote);
  });
});
