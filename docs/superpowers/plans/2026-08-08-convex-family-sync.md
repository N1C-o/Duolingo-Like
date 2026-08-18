# Convex Family Sync Implementation Plan

> **Status:** Implemented and validated on 2026-08-08. The remaining unchecked items are intentionally retained as the original execution checklist; the automated and browser validations are recorded in the task handoff.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect English Adventure to the `Duolingo-like` Convex project with one authenticated family account, dynamic profiles, local-first snapshot synchronization, and a safe local import path.

**Architecture:** Convex Auth owns the family session. Convex stores one family document, one profile document per child, and one progression snapshot per profile. The client keeps the pure progression engine and stores a local replica with a base revision; compare-and-swap mutations reject stale snapshots instead of overwriting them.

**Tech Stack:** Next.js static export, React client components, TypeScript, Convex, Convex Auth Password provider, IndexedDB/localStorage fallback, Vitest.

## Global Constraints

- No child account, roles, analytics, content database, or anti-cheat in v1.
- Do not store `activeProfileId` or navigation state in Convex.
- Every Convex function uses object-form validators, explicit return validators, authenticated ownership checks, and indexes for family/profile lookups.
- `replayXpByDay` must be bounded before snapshots are persisted remotely.
- Do not silently overwrite a remote revision or discard a pending local snapshot.
- Run `npm test`, `npm run lint`, `npm run typecheck`, `npm run build`, `npm audit --audit-level=high`, and a Convex type/deploy check before delivery.

## File map

- Create `convex/schema.ts`: Convex Auth tables plus family, profiles, progress snapshots, and indexes.
- Create `convex/auth.ts` and `convex/auth.config.ts`: Convex Auth Password provider and issuer configuration.
- Create `convex/family.ts`: authenticated family bootstrap, profile listing, snapshot read/write, import, export, reset, and deletion functions.
- Create `lib/sync/sync-types.ts`: local/remote snapshot and conflict types.
- Create `lib/sync/snapshot.ts`: serialization, revision comparison, bounded daily replay data, and conflict decisions.
- Modify `lib/content/types.ts` and `lib/progression/types.ts`: dynamic profile IDs and separation of local app state from persisted profile data.
- Modify `lib/progression/engine.ts`: operate on dynamic profiles and preserve existing progression behavior.
- Modify `lib/storage/local-store.ts`: persist local replica metadata and preserve fallback behavior.
- Create `lib/storage/convex-store.ts`: map Convex family/profile data to local snapshots and call sync operations.
- Create `components/convex-provider.tsx` and auth UI: initialize `ConvexAuthProvider` and render sign-in/bootstrap states.
- Modify `components/prototype-app.tsx` and `components/learning-screens.tsx`: consume dynamic profiles, handle online/offline sync, import, conflicts, export, and auth state.
- Add tests under `tests/sync.test.ts`, `tests/profile-model.test.ts`, and extend `tests/storage.test.ts`.
- Update `docs/ARCHITECTURE.md`, `docs/PROJECT_MAP.md`, `docs/TECHNICAL_DEBT.md`, and `docs/CHANGELOG.md` after the implementation is verified.

### Task 1: Define the snapshot contract and dynamic profile model

**Files:**
- Test: `tests/profile-model.test.ts`, `tests/sync.test.ts`
- Modify: `lib/content/types.ts`, `lib/progression/types.ts`, `lib/progression/engine.ts`
- Create: `lib/sync/sync-types.ts`, `lib/sync/snapshot.ts`

- [ ] Write failing tests for profiles with arbitrary stable IDs, active profile remaining local, replay data pruning, revision equality, stale revision rejection, and explicit conflict choice.
- [ ] Run `npm test tests/profile-model.test.ts tests/sync.test.ts` and confirm failures come from missing dynamic/sync behavior.
- [ ] Implement the smallest model change that replaces the persisted literal profile union with a stable profile identifier while keeping theme IDs finite.
- [ ] Implement snapshot normalization and prune replay entries older than 31 local days.
- [ ] Run the focused tests, then the full `npm test` suite.

### Task 2: Add the Convex backend and authenticated ownership

**Files:**
- Modify: `package.json`, `package-lock.json`
- Create: `convex/schema.ts`, `convex/auth.ts`, `convex/auth.config.ts`, `convex/family.ts`
- Test: `tests/convex-contract.test.ts` if pure validators/helpers can be tested without deployment

- [ ] Add `convex`, `@convex-dev/auth`, and the documented `@auth/core` version.
- [ ] Add Convex Auth tables and the family/profile/progress schema with indexes for owner and profile lookups.
- [ ] Implement authenticated family bootstrap that is idempotent and creates Gabriel/Luca only when the family has no profiles.
- [ ] Implement profile list and single-snapshot queries with bounded reads.
- [ ] Implement compare-and-swap snapshot mutation using `baseRevision`; return a conflict result without modifying data when stale.
- [ ] Implement idempotent local import, export payload, profile reset, and family data deletion with ownership checks.
- [ ] Run `npx tsc --noEmit` and `CONVEX_AGENT_MODE=anonymous npx convex dev --once`; fix every schema/codegen error before continuing.

### Task 3: Connect the client to Convex Auth and the family query

**Files:**
- Create: `components/convex-provider.tsx`, `components/auth-screen.tsx`
- Modify: `app/layout.tsx`, `app/page.tsx`, `.gitignore`, `next-env.d.ts` if generated types require it

- [ ] Write failing component/integration tests for unauthenticated, auth-loading, authenticated, and missing-family states where the current test setup supports them.
- [ ] Add `ConvexAuthProvider` around the client application using `NEXT_PUBLIC_CONVEX_URL`.
- [ ] Add a minimal family sign-in/sign-up form with localized labels and explicit error/loading states.
- [ ] Gate family queries behind authenticated state and keep the existing child profile code screen after authentication.
- [ ] Run lint, typecheck, and focused tests.

### Task 4: Replace root AppState persistence with a local replica and migration

**Files:**
- Test: `tests/storage.test.ts`, `tests/sync.test.ts`
- Modify: `lib/storage/local-store.ts`, `lib/storage/convex-store.ts`, `components/prototype-app.tsx`

- [ ] Write failing tests for clean bootstrap, normalized local import, interrupted/repeated import, pending local state, successful reconnect, stale remote conflict, and preserving the local candidate.
- [ ] Add local metadata for `baseRevision`, `syncStatus`, and a pending snapshot without breaking IndexedDB/localStorage fallback.
- [ ] Implement explicit parent-triggered import; do not auto-merge local data into an existing remote family.
- [ ] Hydrate Convex snapshots into the current client state while keeping active profile/navigation local.
- [ ] Queue the latest profile snapshot while offline and upload only when the remote revision still matches.
- [ ] Run focused and full tests after each behavior.

### Task 5: Add export, restore, conflict, and parent data controls

**Files:**
- Test: `tests/sync.test.ts`
- Modify: `components/learning-screens.tsx`, `components/prototype-app.tsx`, `content` locale-visible copy if introduced

- [ ] Add a parent-only export action that downloads a versioned family JSON payload.
- [ ] Add restore validation for schema/content versions and explicit replacement confirmation.
- [ ] Add conflict UI with “conserver sur cet appareil” and “utiliser la version distante”; never auto-select silently.
- [ ] Keep reset and family deletion confirmation separate from ordinary child profile switching.
- [ ] Update all user-visible copy through the existing localization strategy if one is introduced; otherwise preserve the project’s current French copy conventions.

### Task 6: Verify, review, document, and commit

**Files:**
- Modify: `docs/ARCHITECTURE.md`, `docs/PROJECT_MAP.md`, `docs/TECHNICAL_DEBT.md`, `docs/CHANGELOG.md`
- Review: all changed files

- [ ] Run `npm test`, `npm run lint`, `npm run typecheck`, `npm run build`, and `npm audit --audit-level=high`.
- [ ] Run the Convex deployment/type check and one realistic bootstrap/snapshot invocation against the `Duolingo-like` deployment when credentials are available.
- [ ] Run the `code-reviewer` skill and fix all actionable P0/P1/P2 findings.
- [ ] Review `git diff` and ensure no secrets, generated deployment credentials, unrelated changes, or temporary files are included.
- [ ] Commit the coherent implementation with a scoped Conventional Commit message; do not push.
