# Phase 09: Developer Infrastructure - Plan

**Status:** Ready for execution
**Goal:** Eradicate 0-day configuration gaps, add CI/CD gating, TypeScript strictness, and Pre-commit hygiene.

## 1. Setup Pre-commit Hooks & Lint Scripts

- [ ] Install `husky` and `lint-staged`.
- [ ] Configure `husky` to run `lint-staged` on pre-commit.
- [ ] Configure `lint-staged` to run ESLint on all staged `.ts` and `.tsx` files.
- [ ] Add `npm run lint` and `npm run typecheck` scripts to `package.json` in both the workspace root and `apps/web/package.json`.

## 2. ESLint Configuration

- [ ] Enable `@typescript-eslint/no-unused-vars` rule.
- [ ] Install and configure `eslint-plugin-jsx-a11y` for basic accessibility checks on UI components.
- [ ] Run `npm run lint` and verify rules are active.

## 3. TypeScript Strictness

- [ ] Change `strictNullChecks: false` to `strictNullChecks: true` in `apps/web/tsconfig.json` and `tsconfig.base.json`.
- [ ] Change `noImplicitAny: false` to `noImplicitAny: true`.
- [ ] Run `npm run typecheck`. **Note**: Fix any remaining trivial type errors that pop up after enabling strictNullChecks. (The major ones in AdminBeforeAndAfter are already fixed).

## 4. Dependencies Hygiene

- [ ] Remove `three.js` from `package.json` if it's completely unused (~500KB dead weight).
- [ ] Ensure any newly added devDependencies are pinned securely.

## 5. CI/CD GitHub Actions

- [ ] Create `.github/workflows/ci.yml`.
- [ ] Configure a basic CI pipeline that triggers on `push` and `pull_request` to `main`.
- [ ] Add steps to: `npm install`, `npm run lint`, and `npm run typecheck`.

## Verification

- [ ] `npm run typecheck` passes with no errors.
- [ ] `npm run lint` passes with no errors.
- [ ] Committing a file with a deliberate syntax or type error is successfully blocked by husky.
- [ ] CI pipeline triggers correctly (can be tested by pushing).
