# 0003. Production is the schema source of truth, not the migration history

- **Date:** 2026-09-10
- **Status:** Accepted

## Context

An attempt to regenerate `apps/web/src/integrations/supabase/types_utf8.ts` from
a local database — `supabase start`, which applies every migration to an empty
Postgres — established that the migration history in this repo cannot build a
working database, and never could.

Three migrations aborted the replay outright and were repaired (see the commit
"fix(db): make three migrations survive a fresh replay"). Each fix only exposed
the next failure, so the whole chain was measured instead:

```
production tables (per the generated types): 67
created by some migration:                   37
NEVER created by any migration:              30   (45%)
```

The 30 are not peripheral:

```
analytics_events, analytics_events_default, awards, blog_posts, comments,
gallery_categories, gallery_items, hero_media, media_assets, page_sections,
projects, project_views, project_views_2026_02 … project_views_2027_01,
service_faqs, service_steps, services, site_settings, team_members, testimonials
```

That is most of the CMS: projects, services, testimonials, blog posts, gallery,
site settings, team members, hero media, plus the twelve `project_views_*`
partitions. They exist in production but were created outside migrations —
dashboard UI or manual SQL.

There is separate evidence of the same divergence:

- `blogs` is renamed to `_blogs_deprecated` by
  `20260529180300_consolidate_duplicate_tables`, guarded only by
  `IF EXISTS (blogs)`. Production has `blogs` and no `_blogs_deprecated`, so
  that rename never fired there — yet it always fires on a fresh database.
- `budget_value_inr` (`20260408000001`) and `timeline` (`20260221120000`) exist
  in the database but are missing from the checked-in generated types.
- `decision_events` (`20260625110000`) and `system_logs` (`20260313000000`)
  likewise exist as migrations but are absent from those types.

## Decision

**The live Supabase project is the authority on schema. The migration directory
is a partial changelog, not a reproducible build.**

Concretely:

- Generate types only from the live project:
  `supabase gen types typescript --linked`. Never from `--local`; a local
  database is missing 45% of the schema and would bake a larger drift into the
  types than the one being fixed.
- Do not expect `supabase start`, `supabase db reset`, or a fresh staging
  project to produce a usable database from this repo today.
- When a column or table appears absent from the generated types, check the
  migrations before assuming it does not exist — the types are stale in at least
  four known places.

## Consequences

- No fresh environment can be provisioned from the repo: not local development,
  not CI with a real database, not a new staging project.
- Migrations cannot be trusted as documentation of the schema. Read the
  generated types, or the live database, instead.
- Regenerating types requires a `SUPABASE_ACCESS_TOKEN` and therefore a human;
  it cannot be automated from a clean checkout.
- Three workarounds in application code exist solely because the checked-in
  types are stale, and should be removed once they are regenerated:
  - `engines/lead-signals.ts` — local declarations for `budget_value_inr` and
    `timeline`
  - `pages/admin/workspace/LearningHealthDashboard.tsx` — an untyped handle for
    `decision_events` and `system_logs`
  - `types/blog.ts` — `scheduled_at` treated as absent

## Reversing this

Recovering a reproducible chain means capturing the real schema as a baseline —
`supabase db pull` against the live project, committed as a squashed initial
migration, with the existing history archived behind it. That is a deliberate
piece of work, not a side effect of another task. Until it happens, this ADR
stands.
