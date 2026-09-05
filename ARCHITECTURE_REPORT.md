# Architecture Governance Scorecard

**Overall Score:** `48 / 100`  
**Generated At:** `2026-08-08T09:20:56.392Z`

## Key Architecture Health Indicators

| Indicator | Value | Status |
| :--- | :--- | :--- |
| **Total Source Files** | 738 | ℹ️ |
| **Average File Size (LOC)** | 151 | ✅ Healthy |
| **God Files (>500 LOC)** | 24 | ⚠️ Refactoring Candidate |
| **Watch List (301-500 LOC)** | 58 | ⚠️ Review |
| **`console.log` in `src/`** | 7 | ⚠️ Remove |
| **TODO / FIXME Count** | 0 | ✅ Low |
| **Duplicate Export Names** | 19 | ⚠️ Review |

## Top 5 Largest Files (God File Watch)
- `3214 LOC` - [src/integrations/supabase/types_utf8.ts](file:///E:/main/apps/web/src/integrations/supabase/types_utf8.ts)
- `1510 LOC` - [src/addons/discovery/pages/BlueprintPage.tsx](file:///E:/main/apps/web/src/addons/discovery/pages/BlueprintPage.tsx)
- `1125 LOC` - [src/addons/discovery/components/ResultsReveal.tsx](file:///E:/main/apps/web/src/addons/discovery/components/ResultsReveal.tsx)
- `1112 LOC` - [src/addons/discovery/pages/BlueprintPage.v1-archive.tsx](file:///E:/main/apps/web/src/addons/discovery/pages/BlueprintPage.v1-archive.tsx)
- `1089 LOC` - [src/components/ReactBits/LiquidEther.tsx](file:///E:/main/apps/web/src/components/ReactBits/LiquidEther.tsx)

## Governance Controls Status
- **Dependency Cruiser Rules:** Enabled (Strict Layer Directionality)
- **ESLint Import Restrictions:** Enabled
- **Architecture Fitness Suite:** Executable Vitest assertions (6/6 passing)
- **Bundle Budgets:** Enforceable limits on JS chunks (< 350 KB Main / < 450 KB Routes)
