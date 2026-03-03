# Agent Instructions — Discovery Engine Architecture Sprint

You are a senior TypeScript/React engineer working on the CrossAngle Interior codebase. Your job is to execute one task per iteration from task.md, mark it complete in progress.txt, and commit the changes. Read both files carefully at the start of every iteration.

---

## Your Workflow Per Iteration

1. Read task.md — understand all tasks and their success signals
2. Read progress.txt — identify which tasks are already completed
3. Find the first task that is NOT yet marked Completed in progress.txt
4. Execute that task completely and correctly
5. Verify the success signal for that task before marking it done
6. Append to progress.txt — never delete or modify existing entries
7. Commit all changes with a clear message referencing the task number
8. Stop — do not begin the next task in this iteration

---

## Critical Rules

**One task per iteration.** Do not combine tasks. Do not start Task 3 if Task 2 is not yet marked Completed.

**Build must pass after every task.** Run `npm run build` or `npx tsc --noEmit` after making changes. If the build fails, fix the error before appending the Completed entry to progress.txt.

**Never delete progress.txt entries.** Only append. The file is the source of truth for what is done.

**Core files have zero React imports.** Any file created inside `addons/discovery/core/` or `addons/discovery/flow/` must not import from React, from any UI library, or from any component file. If you find yourself needing a React import in a core file, the logic needs to be separated differently.

**Analytics must never block the engine.** All calls to `track()` must be fire-and-forget. Never await a track call on the rendering path. Never let a failed analytics write prevent a stage transition.

**No PII in analytics events.** Event payloads must never contain names, email addresses, or phone numbers. Session IDs are random UUIDs — never derived from user data.

**No new features.** This sprint is architecture only. If a task does not explicitly ask for a new feature, do not add one. No UI changes beyond what is specified in Task 9 (MiniResult stage).

**Preserve behavior.** The scoring model must produce identical archetype outputs for the same inputs before and after extraction. Before extracting weight maps in Task 3, document the exact values. After extraction, verify the same test inputs produce the same archetype.

---

## Codebase Context

The discovery engine lives at `addons/discovery/` (or `discovery/` depending on your project structure — check the actual path before writing file paths).

Key files you will work with:
- `DiscoveryEngine.tsx` — main orchestrator, currently does too much
- `components/ui/` — the 49 duplicated files to delete in Task 1
- `constants/discovery` — contains visualImages and getArchetype — getArchetype moves to core/ in Task 4
- `pages/DiscoveryPage.tsx` — page wrapper, router-dependent
- `pages/BlueprintPage.tsx` — 1,074 lines, lazy loaded in Task 10
- `components/ResultsReveal.tsx` — 1,112 lines, lazy loaded in Task 10
- `components/LeadGatePhase.tsx` — contact form, heading updated in Task 9
- `components/AnalysisPhase.tsx` — calls aesthetic-ai Supabase edge function
- `types/discovery` — Stage enum updated in Task 9

The shared UI system is at `@/components/ui/` — this is where all shadcn imports must point after Task 1.

The Supabase client is at `@/integrations/supabase/client`.

---

## Progress Entry Format

Use this exact format when appending to progress.txt:

[YYYY-MM-DD HH:MM] Started: Task N - Task Name
[YYYY-MM-DD HH:MM] [brief note of what was done]
[YYYY-MM-DD HH:MM] Completed: Task N - Task Name

For the final task, after all 8 test scenarios pass, append:

[YYYY-MM-DD HH:MM] Completed: Task 11 - Stabilization Testing
ralph-done-discovery-arch-sprint

---

## Commit Message Format

feat(discovery): Task N — [task name]

- [what was created or changed]
- [what was removed]
- Build: passing

---

## If Something Is Unclear

If the task references a file that does not exist at the expected path, search the codebase for the correct location before proceeding. If a weight map value is ambiguous, read the source component carefully — do not guess values.

If a build error appears that is not related to the current task, note it in progress.txt and continue only if the error was pre-existing and the current task's changes do not make it worse.

Do not ask for clarification in a comment. Make a reasonable decision, document it in progress.txt, and proceed.
