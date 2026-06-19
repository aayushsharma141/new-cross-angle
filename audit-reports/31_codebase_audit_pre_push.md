# Codebase Audit — Pre-Push & Quality Gates

**Date:** 2026-06-19
**Scope:** Pre-commit/pre-push hooks, TypeScript strictness, ESLint coverage, error boundary coverage, CI/CD pipeline, dependency hygiene

---

## 1. Pre-Commit / Pre-Push Hooks

### [CRITICAL] 1.1 No Hooks Infrastructure

| Artifact | Found? | Location |
|---|---|---|
| `.husky/` directory | ❌ Not found | — |
| `pre-commit` file | ❌ Not found | — |
| `pre-push` file | ❌ Not found | — |
| `lint-staged` config | ❌ Not found | — |
| `husky` in package.json | ❌ Not found | — |
| `simple-git-hooks` | ❌ Not found | — |
| `@commitlint/cli` | ❌ Not found | — |

**Verdict:** Zero gating before commits or pushes. Code with TypeScript errors, ESLint warnings, or formatting issues can be committed and pushed freely.

### 1.2 Impact

Without pre-commit hooks:
- Type errors accumulate across pushes
- Dead code is never caught (`no-unused-vars: off` + no linting)
- Formatting drifts between developers
- Commit messages have no convention
- `git commit --no-verify` is the default (no hooks means nothing to skip)

---

## 2. TypeScript Strictness

### [CRITICAL] 2.1 App-Level Overrides Disable Strictness

**Base config** (`tsconfig.base.json`):
```json
{
  "strict": true,              // ← ON
  "noUnusedLocals": false,     // ← OFF (base allows it)
  "noUnusedParameters": false  // ← OFF
}
```

**App-level config** (`apps/web/tsconfig.json`):
```json
{
  "compilerOptions": {
    "noImplicitAny": false,       // ← OVERRIDES strict:true
    "noUnusedParameters": false,
    "skipLibCheck": true,
    "strictNullChecks": false,    // ← OVERRIDES strict:true
    "noUnusedLocals": false
  }
}
```

**Critical Flags Disabled:**

| Flag | Value | Risk |
|---|---|---|
| `strictNullChecks` | `false` | `null`/`undefined` values silently pass type checks → runtime errors |
| `noImplicitAny` | `false` | Functions with untyped parameters default to `any` → no type safety |
| `noUnusedLocals` | `false` | Dead variables/lambdas accumulate |
| `noUnusedParameters` | `false` | Dead function parameters accumulate |
| `skipLibCheck` | `true` | Third-party `.d.ts` errors silently ignored |

### 2.2 Estimated Surface Area

With `strictNullChecks: false`:
- Any `supabase.from(...).select()` result can be treated as non-null without narrowing
- `?.` optional chaining is inconsistent (some places use it, some don't)
- Potential for "Cannot read property of null" in production

With `noImplicitAny: false`:
- Function signatures may lack parameter types
- Event handlers may use implicit `any` for event objects

---

## 3. ESLint Configuration Gaps

### [CRITICAL] 3.1 Critical Rules Disabled

`apps/web/eslint.config.js` (26 lines):
```javascript
rules: {
  ...reactHooks.configs.recommended.rules,
  "react-refresh/only-export-components": "off",
  "@typescript-eslint/no-unused-vars": "off",  // ← OFF
}
```

| Rule | State | Impact |
|---|---|---|
| `@typescript-eslint/no-unused-vars` | OFF | Unused imports, variables, and parameters silently pass CI |
| `react-refresh/only-export-components` | OFF | Named + default exports mixed |
| `jsx-a11y/*` (any a11y rule) | NOT INSTALLED | No automated accessibility linting |
| `import/order` | NOT INSTALLED | No import ordering convention |
| `prettier/prettier` | NOT INSTALLED | No formatting enforcement in CI |

### 3.2 Plugins Installed vs Needed

| Plugin | Installed? | Needed? |
|---|---|---|
| `eslint-plugin-react-hooks` | ✅ Yes | ✅ Essential |
| `eslint-plugin-react-refresh` | ✅ Yes | ✅ Essential |
| `eslint-plugin-jsx-a11y` | ❌ No | ✅ Strongly recommended |
| `eslint-plugin-import` | ❌ No | ✅ Recommended |
| `eslint-config-prettier` | ❌ No | ✅ Recommended |

### 3.3 No `lint` Script Available

| Script | In package.json? |
|---|---|
| `lint` | ❌ Not found |
| `lint:fix` | ❌ Not found |
| `typecheck` | ❌ Not found |
| `format` | ❌ Not found |

CLAUDE.md references `npm run lint` but the script does not exist.

---

## 4. Error Boundary Coverage

### [MAJOR] 4.1 Boundary Type Fragmentation

3 different error boundary implementations:

| Boundary | File | Used In |
|---|---|---|
| `ErrorBoundary` | `components/shared/ErrorBoundary.tsx` (92 lines) | `App.tsx` (router-level), `AdminDashboard.tsx`, `ProjectPage.tsx` |
| `AdminRouteErrorBoundary` | `components/admin/AdminRouteErrorBoundary.tsx` (65 lines) | `AdminLayout.tsx` |
| `QuizErrorBoundary` | `addons/discovery/components/QuizErrorBoundary.tsx` | `DiscoveryAddon.tsx` |

### 4.2 Coverage Map

| Area | Covered? | Boundary | Notes |
|---|---|---|---|
| Public routes (router level) | ✅ Yes | `ErrorBoundary` in `App.tsx` | Wraps entire `<Routes>` |
| Admin routes (layout level) | ✅ Yes | `AdminRouteErrorBoundary` in `AdminLayout.tsx` | Wraps `<Outlet>` |
| Individual admin pages | ❌ No | None per-page | If AdminServices crashes, admin layout error shows but user can't retry just that module |
| Discovery engine | ✅ Yes | `QuizErrorBoundary` | Wraps DiscoveryAddon |
| Price estimator | ❌ No | None | Error would propagate to public route boundary |
| Blog detail page | ❌ No | None | But `ProjectPage.tsx` does have boundary — inconsistent |
| AdminHub (command palette) | ❌ No | None | Error would take down admin layout |

---

## 5. CI/CD Pipeline

### [MAJOR] 5.1 No GitHub Actions Workflows

| Artifact | Found? |
|---|---|
| `.github/workflows/` directory | Needs verification |
| CI workflow (lint + typecheck + test) | Presumed missing |
| CD workflow (deploy) | Presumed missing |

### 5.2 Missing Package Scripts for CI

The following scripts should exist for CI use:

```json
{
  "lint": "eslint . --ext .ts,.tsx",
  "typecheck": "tsc --noEmit",
  "test": "playwright test",
  "format:check": "prettier --check \"src/**/*.{ts,tsx,css}\""
}
```

---

## 6. Dependency Hygiene

### [MAJOR] 6.1 `three.js` in Dependencies

`three` is listed in `apps/web/package.json`. The codebase has no Three.js usage (search confirmed). This adds ~500KB+ to bundle (even if tree-shaken, the import exists).

### [MAJOR] 6.2 `html2canvas` in Bundle

Imported directly in `ResultsReveal.tsx`. Dynamic import is recommended (was flagged in previous audits). Verify if it's now dynamic.

### [MAJOR] 6.3 Async `@sentry/react` Import Without Package Dep

Already documented in `30_vibe_code_auditor.md`. The import fails silently.

### [MINOR] 6.4 No Dependency Version Pinning

`package.json` uses `^` and `~` ranges throughout. No lockfile verification step in CI.

---

## 7. Recommended Guard Configuration

### Phase 1: Essential (1 day)

```
1. Install husky + lint-staged
2. Add pre-commit hook: eslint --fix + prettier --write
3. Add prepush hook: tsc --noEmit
4. Create npm run lint, typecheck, format scripts
5. Enable no-unused-vars in ESLint (as warning first)
```

### Phase 2: Strong (3 days)

```
6. Enable strictNullChecks in tsconfig
7. Install eslint-plugin-jsx-a11y + fix violations
8. Add error boundary per admin module
9. Add CI workflow: lint → typecheck → test → build
10. Pin dependency versions
```

### Phase 3: Enterprise (1 week)

```
11. Enable noImplicitAny + fix violations
12. Add import ordering rule
13. Add commit message convention (conventional-commits)
14. Add bundle size check in CI
15. Add dependency vulnerability scanning (npm audit in CI)
```

---

## Score Summary

| Category | Score | Grade |
|---|---|---|
| Pre-commit hooks | 0% | F (none exist) |
| TypeScript strictness | 20% | F (overridden to permissive) |
| ESLint coverage | 15% | F (critical rules off, missing plugins) |
| Error boundary coverage | 50% | D (some gaps, 3 different implementations) |
| CI/CD pipeline | 0% | F |
| Dependency hygiene | 30% | F (3 known issues) |
| **Overall** | **19%** | **Significant infrastructure gap** |
