import { describe, expect, it } from "vitest";
import { activateProfile, createInitialAppState, createProfile, resetProfile } from "@/lib/progression/engine";

describe("modèle de profils", () => {
  it("crée un profil avec un identifiant dynamique et un thème explicite", () => {
    const profile = createProfile("profile-03", "luca");

    expect(profile.id).toBe("profile-03");
    expect(profile.themeId).toBe("luca");
    expect(profile.displayName).toBe("Nouveau profil");
    expect(profile.accessCode).toBe("profile-03");
  });

  it("accepte une collection de profils au lieu de profils codés dans le type", () => {
    const state = createInitialAppState([
      createProfile("profile-03", "gabriel"),
      createProfile("profile-04", "luca")
    ]);

    expect(Object.keys(state.profiles)).toEqual(["profile-03", "profile-04"]);
    expect(state.activeProfileId).toBeNull();
  });

  it("conserve les opérations de progression pour un profil dynamique", () => {
    const initial = createInitialAppState([createProfile("profile-03", "gabriel")]);
    const active = activateProfile(initial, "profile-03");
    const reset = resetProfile(active, "profile-03");

    expect(active.activeProfileId).toBe("profile-03");
    expect(active.profiles["profile-03"].firstUsedAt).not.toBeNull();
    expect(reset.profiles["profile-03"].id).toBe("profile-03");
    expect(reset.activeProfileId).toBeNull();
  });
});
