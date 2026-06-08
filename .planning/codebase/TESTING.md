# Testing Patterns

**Analysis Date:** 2026-06-08

## Test Framework

**Unit/Component Tests:**
- **Runner:** Vitest v4.1.5
- **Environment:** jsdom (web browser mockup environment)
- **Config:** `apps/web/vitest.config.ts`
- **Setup:** `apps/web/src/test/setup.ts` (cleans up DOM, mocks browser primitives)
- **Assertion:** Vitest built-in `expect` (matchers like `toBe`, `toEqual`, `toThrow`)

**E2E/Integration Tests:**
- **Runner:** Playwright v1.59.1
- **Config:** `playwright.config.ts` in root directory
- **Browser tests:** Chrome, Firefox, Safari

**Run Commands:**
```bash
# Inside apps/web workspace:
npm run test                   # Run all unit tests once
npm run test:watch             # Run unit tests in interactive watch mode
npm run test:coverage          # Run unit tests and generate coverage report

# From the project root:
npx playwright test            # Run all E2E integration tests
```

## Test File Organization

**Location:**
- Unit and component tests are located directly in `apps/web/src/test/` or alongside the files they test (e.g. `*.test.ts`).
- E2E tests are located in `e2e/` at the root or within `__checks__/`.

**Naming:**
- Unit/Component tests: `*.test.ts` or `*.test.tsx`
- Playwright E2E tests: `*.spec.ts`

## Test Structure

**Suite Organization:**
Tests use the standard BDD `describe` / `it` / `expect` blocks.
```typescript
import { describe, it, expect, beforeEach } from "vitest";

describe("ServiceOrComponent", () => {
  beforeEach(() => {
    // Shared setup, reset mocks
  });

  it("should perform action successfully", () => {
    // Arrange
    const input = { data: "test" };

    // Act
    const result = execute(input);

    // Assert
    expect(result).toBe("expected-value");
  });
});
```

## Mocking

- **Vitest Mocking:** Uses `vi.mock()` for module-level mocks and `vi.fn()` for function spys.
- **Supabase Mocking:** Mocks client fetch responses to isolate database testing from remote services.

## Coverage

- **Tool:** `@vitest/coverage-v8`
- **Exclusions:** Test files, dependencies, build bundles (`dist/`), and type declarations are excluded from coverage calculations.

---

*Testing analysis: 2026-06-08*
*Update when test patterns change*
