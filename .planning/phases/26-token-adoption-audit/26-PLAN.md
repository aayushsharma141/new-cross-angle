# Phase 26 — Plan: Token Adoption Audit
**Phase:** 26 — Token Adoption Audit
**Slug:** token-adoption-audit

This plan details the steps to build and execute the static analysis token adoption audit script, outputting structured metrics to verify adherence to the design token boundaries.

---

## Proposed Changes

### 1. Build Static Analysis Script
- Create `apps/web/scripts/audit-token-adoption.js` as an ESM Node script.
- The script will read files recursively in `apps/web/src/` (excluding `src/tokens/`, `node_modules/`, `dist/`).
- Scan for the following violation types:
  1. **Raw Hex Colors:** Regex like `/#(?:[0-9a-fA-F]{3,4}){1,2}\b/` but ignoring comment sections or variables definitions in `foundation/colors.css`.
  2. **Raw HSL/RGB Colors:** Regex like `/\b(?:hsl|hsla|rgb|rgba)\([^)]+\)/` ignoring CSS file variables.
  3. **Arbitrary border-radius:** Regex like `/\bborder-radius:\s*(?!\bvar\(--s-radius-|\bvar\(--p-radius-|0\b)[^;]+;?/` or Tailwind arbitrary classes like `rounded-\[[^\]]+\]` or hardcoded tailwind utility border-radius classes like `rounded-lg`, `rounded-md`, `rounded-sm` that bypass the token definitions.
  4. **Hardcoded spacing:** Regex matching standard margin/padding declarations in CSS that do not reference spacing variables, or Tailwind padding/margin utilities (`p-1`, `m-2`, `gap-3`, etc.) that are not bound to standard token classes.
- Log exact line numbers, file names, and matching snippets.

### 2. Output Markdown Report
- The script will output a comprehensive audit report `audit-reports/token-adoption-report.md`.
- Report will include a summary adoption matrix table (metrics requested by user).

---

## Verification Plan

### Automated Tests
- Run `node apps/web/scripts/audit-token-adoption.js` and verify it runs successfully.
- Verify `audit-reports/token-adoption-report.md` is populated with correct metrics.

### Manual Verification
- Check generated markdown file for layout and accuracy.
