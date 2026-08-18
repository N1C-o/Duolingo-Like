import { describe, expect, it } from "vitest";
import { createInitialAppState, createProfile } from "@/lib/progression/engine";
import { familyExportToAppState, hasMeaningfulProfileData, hydrateFamilyBundle, hydrateRemoteProfile, toFamilyExport, validateFamilyExport } from "@/lib/storage/convex-store";

describe("contrat de stockage Convex côté client", () => {
  it("conserve un profil dynamique dans un export et une restauration locale", () => {
    const profile = createProfile("profile-03", "luca", "Zoé", "zoe");
    const state = createInitialAppState([profile]);
    state.profiles[profile.id].progress.xpTotal = 42;

    const restored = familyExportToAppState(validateFamilyExport(toFamilyExport(state)));

    expect(restored.profiles["profile-03"].displayName).toBe("Zoé");
    expect(restored.profiles["profile-03"].accessCode).toBe("zoe");
    expect(restored.profiles["profile-03"].progress.xpTotal).toBe(42);
  });

  it("hydrate les métadonnées distantes sans perdre les préférences locales", () => {
    const local = createInitialAppState();
    local.profiles.gabriel.preferences.soundsEnabled = false;
    const remote = {
      familyId: "family-1",
      schemaVersion: 1,
      contentVersion: local.contentVersion,
      migrationVersion: 1,
      profiles: [{
        profileKey: "gabriel",
        displayName: "Gabriel",
        accessCode: "gabriel",
        themeId: "gabriel" as const,
        sortOrder: 0,
        schemaVersion: 1,
        contentVersion: local.contentVersion,
        revision: 3,
        snapshot: local.profiles.gabriel.progress,
        updatedAt: Date.now()
      }]
    };

    const hydrated = hydrateFamilyBundle(remote, local);

    expect(hydrated.profiles.gabriel.preferences.soundsEnabled).toBe(false);
    expect(hydrated.profiles.gabriel.progress.xpTotal).toBe(0);
  });

  it("refuse un export d’un autre curriculum", () => {
    const payload = toFamilyExport(createInitialAppState());
    expect(() => validateFamilyExport({ ...payload, contentVersion: "other-content" })).toThrow(/autre version/);
  });

  it("réhydrate un seul profil sans écraser les progrès des autres", () => {
    const local = createInitialAppState();
    local.profiles.gabriel.progress.xpTotal = 12;
    local.profiles.luca.progress.xpTotal = 34;

    const next = hydrateRemoteProfile(local, {
      profileKey: "gabriel",
      displayName: "Gabriel",
      accessCode: "gabriel",
      themeId: "gabriel",
      sortOrder: 0,
      schemaVersion: 1,
      contentVersion: local.contentVersion,
      revision: 2,
      snapshot: { ...local.profiles.gabriel.progress, xpTotal: 99 },
      updatedAt: Date.now()
    });

    expect(next.profiles.gabriel.progress.xpTotal).toBe(99);
    expect(next.profiles.luca.progress.xpTotal).toBe(34);
  });

  it("considère une progression remise à zéro comme une donnée locale significative si elle a une activité", () => {
    const state = createInitialAppState();
    expect(hasMeaningfulProfileData(state.profiles.gabriel)).toBe(false);
    state.profiles.gabriel.progress.lastActivityAt = "2026-08-08T12:00:00.000Z";
    expect(hasMeaningfulProfileData(state.profiles.gabriel)).toBe(true);
  });
});
