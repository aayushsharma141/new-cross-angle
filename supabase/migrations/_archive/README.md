# Migration Archive

This directory holds SQL files that are **no longer part of the active migration chain**.
Files here are kept for historical reference only and **must never be run against Supabase** —
doing so would cause duplicate-table / duplicate-policy errors because their DDL has already
been applied and subsequently superseded by later migrations.

---

## Un-timestamped setup scripts (archived 2026-04-11)

| File | Why archived | Superseded by |
|---|---|---|
| `complete_setup.sql` | Original hand-run "bootstrap" script (tables + naive RLS). Never ran through `supabase db push`. | `20260103223827_remix_migration_from_pg_dump.sql` + `20260222000000_fix_db_lints.sql` |
| `fix_rls_policies.sql` | Manual RLS fix script run via SQL editor after initial setup. | `20260226120300_rls_leads.sql`, `20260317000002_enable_rls_unprotected_tables.sql`, `20260317000003_security_advisor_remediation.sql` |
| `storage_setup.sql` | Manual storage bucket + policy script. | `20260220_update_storage_metadata.sql`, `20260404000002_rls_cms_rbac_tighten.sql` |

---

## `.bak` files (archived 2026-04-11)

These were experimental or rolled-back migrations. Their changes were either:
- Already merged into a succeeding migration
- Deliberately abandoned and rolled back
- Replaced by a cleaner implementation

| File | Summary |
|---|---|
| `20260208000001_fix_blogs_schema.sql.bak` | Blog schema fix — absorbed into `cms_upgrade` |
| `20260208000002_add_lead_scoring.sql.bak` | First-pass lead scoring columns — superseded by `init_leads_system` |
| `20260209134418_add_viewer_role.sql.bak` | Viewer role attempt — replaced by `admin_user_roles_v1` |
| `20260209135325_update_rls_viewer.sql.bak` | Viewer RLS rules — replaced by `security_advisor_remediation` |
| `20260209135459_restrict_write_access.sql.bak` | Write-access restrictions — replaced by `rls_cms_rbac_tighten` |
| `20260209140411_create_audit_logs.sql.bak` | Audit log table — replaced by `audit_gin_indexes` |
| `20260209141651_audit_log_triggers.sql.bak` | Audit triggers — replaced by `audit_gin_indexes` |
| `20260209175326_add_lead_status.sql.bak` | Lead status enum — absorbed into `init_leads_system` |
| `20260209180158_backfill_profiles.sql.bak` | One-time data backfill — data already applied |
| `20260209180419_lead_activity_triggers.sql.bak` | Activity triggers — replaced by `crm_automation` |
| `20260209181014_ensure_site_content_rls.sql.bak` | Site content RLS — replaced by `rls_public_tables` |
| `20260209183144_add_blog_analytics.sql.bak` | Blog analytics v1 — replaced by `blog_analytics` |
| `20260209185500_track_view_func.sql.bak` | View tracking function — replaced by `blog_analytics` |
| `20260209190000_create_admin_users_view.sql.bak` | Admin users view — replaced by `admin_user_roles_v1` |
| `20260218_content_architecture.sql.bak` | Content architecture draft — superseded by `blueprint_schema` |
| `20260219_fix_schema_part2.sql.bak` | Schema fix part 2 — merged into `fix_schema` |
| `20260220_ai_features.sql.bak` | AI features scaffold — never promoted |
| `20260221110000_seed_content.sql.bak` | Seed content — superseded by `gallery_seed` + `site_settings_seed` |
| `20260407000001_harden_lead_estimator_rls.sql.bak` | Lead estimator RLS hardening — replaced by `harden_lead_estimator_rls` proper migration |

---

> **Rule:** If you need to resurface any logic from these files, create a **new timestamped migration**
> with `supabase migration new <name>` and paste only the relevant DDL.
