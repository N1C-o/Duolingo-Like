import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const themeId = v.union(v.literal("gabriel"), v.literal("luca"));

export default defineSchema({
  ...authTables,
  families: defineTable({
    ownerTokenIdentifier: v.string(),
    schemaVersion: v.number(),
    contentVersion: v.string(),
    migrationVersion: v.number(),
    sourceHash: v.optional(v.string()),
    lastImportAt: v.optional(v.number())
  }).index("by_owner_token_identifier", ["ownerTokenIdentifier"]),
  profiles: defineTable({
    familyId: v.id("families"),
    profileKey: v.string(),
    displayName: v.string(),
    accessCode: v.string(),
    themeId,
    sortOrder: v.number(),
    active: v.boolean()
  })
    .index("by_family", ["familyId"])
    .index("by_family_and_profile_key", ["familyId", "profileKey"]),
  profileProgress: defineTable({
    familyId: v.id("families"),
    profileId: v.id("profiles"),
    schemaVersion: v.number(),
    contentVersion: v.string(),
    revision: v.number(),
    snapshot: v.any(),
    updatedAt: v.number()
  })
    .index("by_family", ["familyId"])
    .index("by_profile", ["profileId"])
});
