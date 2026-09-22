---
title: "Snapshot the live Postgres catalogue before any database security audit"
trigger_condition: "The next audit, finding, or migration that cites a database function, policy, grant, or constraint — or the second time ADR 0004's status-table rule is applied by hand"
planted_date: 2026-09-12
---

## Idea

Make the live catalogue the first artifact of any database-security work, not
the last. Before reading a single migration, snapshot from the linked project:

- `pg_proc`: `proname`, identity arguments, `prosecdef`, `proconfig`,
  `proowner`, `proacl`, `pg_get_functiondef(oid)` for every function in
  `public`
- `pg_policies` for every table in scope
- check constraints (`pg_constraint` where `contype = 'c'`) on tables whose
  columns feed authorization (`profiles.role`, `user_roles.role`)

Then diff against what the migrations would produce. **The diff is a finding
list**, produced before anyone forms an opinion from the SQL files.

## Why this exists

PL-009: during S2 the live `rpc_register_dam_asset` had no authorization guard
although its migration defines one; `update_media_metadata(text, jsonb)` was
callable in production with no migration; `is_admin`,
`is_platform_admin_by_id`, `increment_project_view` had no migration at all.
The auth review initially judged two correct claims wrong because it read
migrations. ADR 0003 already said tables can't be trusted from migrations;
this extends it to everything in the catalogue.

## Shape when it grows

1. `scripts/checks/db-catalogue-snapshot.mjs` — runs the queries above via
   `supabase db query --linked` (needs `SUPABASE_ACCESS_TOKEN` or `supabase
   login`; the preflight SQL from the S3 session is the starting point) and
   writes `supabase/catalogue/<date>.json`.
2. `scripts/checks/db-catalogue-drift.mjs` — diffs the latest snapshot against
   migration-derived definitions and prints per-object drift.
3. Later, the mechanical gate ADR 0004 defers: refuse a status row whose label
   is `Verified` or `Closed` for a DB object with no snapshot entry newer than
   the fix commit.

## Not yet

Don't build this until the trigger fires. The S2/S3 sessions did the manual
version successfully; the cost of the script is only justified when the
manual version has to be repeated.
