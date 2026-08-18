import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { v } from "convex/values";
import { assertSupportedVersions, assertValidProgressSnapshot } from "./progress_validation";

const MAX_PROFILES = 20;
const themeId = v.union(v.literal("gabriel"), v.literal("luca"));

const profileImportValidator = v.object({
  profileKey: v.string(),
  displayName: v.string(),
  accessCode: v.string(),
  themeId,
  sortOrder: v.number(),
  snapshot: v.any(),
  schemaVersion: v.number(),
  contentVersion: v.string()
});

const profileBundleValidator = v.object({
  profileKey: v.string(),
  displayName: v.string(),
  accessCode: v.string(),
  themeId,
  sortOrder: v.number(),
  schemaVersion: v.number(),
  contentVersion: v.string(),
  revision: v.number(),
  snapshot: v.any(),
  updatedAt: v.number()
});

const familyBundleValidator = v.object({
  familyId: v.id("families"),
  schemaVersion: v.number(),
  contentVersion: v.string(),
  migrationVersion: v.number(),
  profiles: v.array(profileBundleValidator)
});

const snapshotResultValidator = v.union(
  v.object({ status: v.literal("saved"), revision: v.number(), snapshot: v.any() }),
  v.object({ status: v.literal("conflict"), revision: v.number(), snapshot: v.any() })
);

function assertProfileKey(value: string) {
  if (!/^[a-z0-9][a-z0-9_-]{0,63}$/i.test(value)) throw new Error("Invalid profile key");
}

function assertSnapshot(value: unknown) {
  assertValidProgressSnapshot(value);
}

type FamilyReadCtx = QueryCtx | MutationCtx;

async function getOwnerTokenIdentifier(ctx: FamilyReadCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthenticated family request");
  return identity.tokenIdentifier;
}

async function findFamily(ctx: FamilyReadCtx, ownerTokenIdentifier: string) {
  return ctx.db
    .query("families")
    .withIndex("by_owner_token_identifier", (q) => q.eq("ownerTokenIdentifier", ownerTokenIdentifier))
    .unique();
}

async function readBundle(ctx: FamilyReadCtx, family: Doc<"families">) {
  const profiles = await ctx.db.query("profiles").withIndex("by_family", (q) => q.eq("familyId", family._id)).take(MAX_PROFILES + 1);
  if (profiles.length > MAX_PROFILES) throw new Error("Family profile limit exceeded");

  const bundleProfiles = [];
  for (const profile of profiles.sort((left, right) => left.sortOrder - right.sortOrder)) {
    const progress = await ctx.db
      .query("profileProgress")
      .withIndex("by_profile", (q) => q.eq("profileId", profile._id))
      .unique();
    if (!progress) throw new Error(`Missing progress for ${profile.profileKey}`);
    bundleProfiles.push({
      profileKey: profile.profileKey,
      displayName: profile.displayName,
      accessCode: profile.accessCode,
      themeId: profile.themeId,
      sortOrder: profile.sortOrder,
      schemaVersion: progress.schemaVersion,
      contentVersion: progress.contentVersion,
      revision: progress.revision,
      snapshot: progress.snapshot,
      updatedAt: progress.updatedAt
    });
  }
  return {
    familyId: family._id,
    schemaVersion: family.schemaVersion,
    contentVersion: family.contentVersion,
    migrationVersion: family.migrationVersion,
    profiles: bundleProfiles
  };
}

async function insertProfiles(ctx: MutationCtx, familyId: Id<"families">, profiles: Array<{
  profileKey: string;
  displayName: string;
  accessCode: string;
  themeId: "gabriel" | "luca";
  sortOrder: number;
  snapshot: unknown;
  schemaVersion: number;
  contentVersion: string;
}>) {
  const seenKeys = new Set<string>();
  for (const profile of profiles) {
    if (!profile.profileKey || seenKeys.has(profile.profileKey)) throw new Error("Duplicate profile key");
    assertProfileKey(profile.profileKey);
    seenKeys.add(profile.profileKey);
    assertSupportedVersions(profile.schemaVersion, profile.contentVersion);
    assertSnapshot(profile.snapshot);
    const profileId = await ctx.db.insert("profiles", {
      familyId,
      profileKey: profile.profileKey,
      displayName: profile.displayName,
      accessCode: profile.accessCode,
      themeId: profile.themeId,
      sortOrder: profile.sortOrder,
      active: true
    });
    await ctx.db.insert("profileProgress", {
      familyId,
      profileId,
      schemaVersion: profile.schemaVersion,
      contentVersion: profile.contentVersion,
      revision: 1,
      snapshot: profile.snapshot,
      updatedAt: Date.now()
    });
  }
}

export const get = query({
  args: {},
  returns: v.union(v.null(), familyBundleValidator),
  handler: async (ctx) => {
    const ownerTokenIdentifier = await getOwnerTokenIdentifier(ctx);
    const family = await findFamily(ctx, ownerTokenIdentifier);
    return family ? await readBundle(ctx, family) : null;
  }
});

export const bootstrap = mutation({
  args: {
    schemaVersion: v.number(),
    contentVersion: v.string(),
    profiles: v.array(profileImportValidator)
  },
  returns: familyBundleValidator,
  handler: async (ctx, args) => {
    assertSupportedVersions(args.schemaVersion, args.contentVersion);
    const ownerTokenIdentifier = await getOwnerTokenIdentifier(ctx);
    const existing = await findFamily(ctx, ownerTokenIdentifier);
    if (existing) return readBundle(ctx, existing);
    if (args.profiles.length > MAX_PROFILES) throw new Error("Family profile limit exceeded");
    const familyId = await ctx.db.insert("families", {
      ownerTokenIdentifier,
      schemaVersion: args.schemaVersion,
      contentVersion: args.contentVersion,
      migrationVersion: 1
    });
    await insertProfiles(ctx, familyId, args.profiles);
    const family = await ctx.db.get(familyId);
    if (!family) throw new Error("Family bootstrap failed");
    return readBundle(ctx, family);
  }
});

export const importLocal = mutation({
  args: {
    schemaVersion: v.number(),
    contentVersion: v.string(),
    sourceHash: v.string(),
    profiles: v.array(profileImportValidator)
  },
  returns: familyBundleValidator,
  handler: async (ctx, args) => {
    assertSupportedVersions(args.schemaVersion, args.contentVersion);
    const ownerTokenIdentifier = await getOwnerTokenIdentifier(ctx);
    const existing = await findFamily(ctx, ownerTokenIdentifier);
    if (existing) {
      const existingProfiles = await ctx.db.query("profiles").withIndex("by_family", (q) => q.eq("familyId", existing._id)).take(1);
      if (existing.sourceHash === args.sourceHash) return readBundle(ctx, existing);
      if (existingProfiles.length > 0) throw new Error("Family already contains profiles");
      await ctx.db.patch(existing._id, { sourceHash: args.sourceHash, lastImportAt: Date.now() });
      await insertProfiles(ctx, existing._id, args.profiles);
      return readBundle(ctx, existing);
    }
    if (args.profiles.length > MAX_PROFILES) throw new Error("Family profile limit exceeded");
    const familyId = await ctx.db.insert("families", {
      ownerTokenIdentifier,
      schemaVersion: args.schemaVersion,
      contentVersion: args.contentVersion,
      migrationVersion: 1,
      sourceHash: args.sourceHash,
      lastImportAt: Date.now()
    });
    await insertProfiles(ctx, familyId, args.profiles);
    const family = await ctx.db.get(familyId);
    if (!family) throw new Error("Family import failed");
    return readBundle(ctx, family);
  }
});

export const restore = mutation({
  args: {
    schemaVersion: v.number(),
    contentVersion: v.string(),
    sourceHash: v.string(),
    profiles: v.array(profileImportValidator)
  },
  returns: familyBundleValidator,
  handler: async (ctx, args) => {
    assertSupportedVersions(args.schemaVersion, args.contentVersion);
    const ownerTokenIdentifier = await getOwnerTokenIdentifier(ctx);
    if (args.profiles.length > MAX_PROFILES) throw new Error("Family profile limit exceeded");
    const existing = await findFamily(ctx, ownerTokenIdentifier);
    const familyId = existing?._id ?? await ctx.db.insert("families", {
      ownerTokenIdentifier,
      schemaVersion: args.schemaVersion,
      contentVersion: args.contentVersion,
      migrationVersion: 1,
      sourceHash: args.sourceHash,
      lastImportAt: Date.now()
    });
    if (existing) {
      const profiles = await ctx.db.query("profiles").withIndex("by_family", (q) => q.eq("familyId", existing._id)).take(MAX_PROFILES + 1);
      if (profiles.length > MAX_PROFILES) throw new Error("Family profile limit exceeded");
      for (const profile of profiles) {
        const progress = await ctx.db.query("profileProgress").withIndex("by_profile", (q) => q.eq("profileId", profile._id)).unique();
        if (progress) await ctx.db.delete(progress._id);
        await ctx.db.delete(profile._id);
      }
      await ctx.db.patch(existing._id, { schemaVersion: args.schemaVersion, contentVersion: args.contentVersion, sourceHash: args.sourceHash, lastImportAt: Date.now() });
    }
    await insertProfiles(ctx, familyId, args.profiles);
    const family = await ctx.db.get(familyId);
    if (!family) throw new Error("Family restore failed");
    return readBundle(ctx, family);
  }
});

export const saveSnapshot = mutation({
  args: {
    profileKey: v.string(),
    baseRevision: v.number(),
    schemaVersion: v.number(),
    contentVersion: v.string(),
    snapshot: v.any()
  },
  returns: snapshotResultValidator,
  handler: async (ctx, args) => {
    assertSupportedVersions(args.schemaVersion, args.contentVersion);
    const ownerTokenIdentifier = await getOwnerTokenIdentifier(ctx);
    const family = await findFamily(ctx, ownerTokenIdentifier);
    if (!family) throw new Error("Family is not initialized");
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_family_and_profile_key", (q) => q.eq("familyId", family._id).eq("profileKey", args.profileKey))
      .unique();
    if (!profile) throw new Error("Profile not found");
    const progress = await ctx.db
      .query("profileProgress")
      .withIndex("by_profile", (q) => q.eq("profileId", profile._id))
      .unique();
    if (!progress) throw new Error("Progress not found");
    assertSnapshot(args.snapshot);
    if (progress.revision !== args.baseRevision) {
      return { status: "conflict" as const, revision: progress.revision, snapshot: progress.snapshot };
    }
    const revision = progress.revision + 1;
    await ctx.db.patch(progress._id, {
      schemaVersion: args.schemaVersion,
      contentVersion: args.contentVersion,
      revision,
      snapshot: args.snapshot,
      updatedAt: Date.now()
    });
    return { status: "saved" as const, revision, snapshot: args.snapshot };
  }
});

export const removeFamilyData = mutation({
  args: {},
  returns: v.object({ deletedProfiles: v.number() }),
  handler: async (ctx) => {
    const ownerTokenIdentifier = await getOwnerTokenIdentifier(ctx);
    const family = await findFamily(ctx, ownerTokenIdentifier);
    if (!family) return { deletedProfiles: 0 };
    const profiles = await ctx.db.query("profiles").withIndex("by_family", (q) => q.eq("familyId", family._id)).take(MAX_PROFILES + 1);
    if (profiles.length > MAX_PROFILES) throw new Error("Family profile limit exceeded");
    for (const profile of profiles) {
      const progress = await ctx.db
        .query("profileProgress")
        .withIndex("by_profile", (q) => q.eq("profileId", profile._id))
        .unique();
      if (progress) await ctx.db.delete(progress._id);
      await ctx.db.delete(profile._id);
    }
    await ctx.db.delete(family._id);
    return { deletedProfiles: profiles.length };
  }
});
