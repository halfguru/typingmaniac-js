# Testing Patterns

**Analysis Date:** 2026-04-10

## Test Framework

**Runner:**
- Playwright (`@playwright/test`) — E2E testing only
- Config: `playwright.config.ts`

**Assertion Library:**
- Playwright built-in assertions (`expect(page).toHaveTitle()`, `expect(locator).toBeVisible()`)

**No Unit Testing Framework:**
- No Jest, Vitest, or any unit test runner configured
- No `jest.config.*` or `vitest.config.*` files

**Run Commands:**
```bash
npm run test          # Run all Playwright E2E tests
npm run test:ui       # Run tests with interactive Playwright UI
npx playwright test   # Direct Playwright invocation
```

## Test Configuration

**`playwright.config.ts` settings:**
- **Browser:** Chromium only (single browser)
- **Workers:** 1 (sequential execution, `fullyParallel: false`)
- **Timeout:** 60 seconds per test
- **Base URL:** `http://localhost:3000`
- **Web server:** Auto-starts `npm run dev` (Vite dev server)
- **Reporter:** HTML reporter
- **Traces:** Captured on first retry
- **Screenshots:** Captured on failure

## Test File Organization

**Location:**
- Separate `tests/` directory at project root (not co-located with source)

**Naming:**
- `<feature>.spec.ts` pattern: `game.spec.ts`

**Structure:**
```
tests/
├── game.spec.ts          # Main E2E test file
└── screenshots/          # Visual verification captures
    └── *.png
```

## Test Structure

**Suite Organization:**
```typescript
// tests/game.spec.ts
import { test, expect } from '@playwright/test';

// Helper functions at module level
async function loginAsGuest(page: Page) {
    await page.click('text=Play as Guest');
    // ... wait for navigation
}

async function clickCenter(page: Page) {
    const canvas = page.locator('canvas');
    const box = await canvas.boundingBox();
    if (box) {
        await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    }
}

test.describe('Game Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should display menu on load', async ({ page }) => {
        // assertions
    });

    test('should start game after login', async ({ page }) => {
        await loginAsGuest(page);
        await clickCenter(page);
        // assertions
    });
});
```

**Patterns:**
- **Setup:** `test.beforeEach` navigates to root URL before each test
- **Teardown:** None needed — Playwright handles browser cleanup
- **Helpers:** Extracted as module-level async functions (not in a separate utils file)
- **Canvas interaction:** Uses `page.mouse.click()` with calculated coordinates from `boundingBox()` since game renders to `<canvas>` — no DOM selectors for game elements
- **Text input:** Uses `page.keyboard.type()` for typing words
- **Visual verification:** Screenshots saved to `tests/screenshots/`

## Mocking

**Framework:** None

**No mocking libraries exist in the project.** No MSW, no `vi.mock()`, no Sinon, no proxyquire.

**What this means:**
- E2E tests hit real services (or rely on services being unconfigured)
- No API mocking for Supabase, PostHog, or Sentry
- Tests work with the "optional services" pattern — if env vars aren't set, services silently no-op

**What to Mock (if unit tests are added):**
- External service calls (Supabase auth, PostHog analytics, Sentry)
- `localStorage` for `StorageService` tests
- `fetch`/network for `GameConfigService` and `WordService`
- Phaser scene lifecycle for scene unit tests

**What NOT to Mock:**
- Pure logic (word matching, score calculation, config parsing)
- Theme color resolution
- State transformations

## Fixtures and Factories

**Test Data:**
- No fixture files or factory functions
- Tests use the real game config and word lists from `src/data/`
- Test data is whatever the game naturally produces through interaction

**Location:**
- No dedicated test data directory

## Coverage

**Requirements:** None enforced

**Coverage Tooling:** Not configured — no `nyc`, `c8`, `istanbul`, or Playwright coverage

**Current Coverage:**
- E2E: Basic game flow (menu → login → game start) — minimal
- Unit: 0% — no unit tests exist

## Test Types

**E2E Tests:**
- Framework: Playwright
- Scope: Full game flow from page load through menu interaction and game start
- Approach: Canvas-based interaction (mouse coordinates, keyboard input), screenshot capture
- Limitations: Cannot easily inspect internal game state (Phaser scene data, score, word positions) — tests verify what's visible on screen

**Unit Tests:**
- Not used. No framework configured.
- Critical gap for: services (`AudioService`, `StorageService`, `WordService`, `ThemeService`, `AuthService`), managers (`EffectManager`), UI components (`Button`, `ProgressBar`, `GameOverOverlay`)

**Integration Tests:**
- Not used separately. E2E tests serve as integration tests.

**Visual Regression Tests:**
- Screenshots captured manually in tests but no automated visual comparison

## Common Patterns

**Canvas Interaction (the primary E2E pattern):**
```typescript
// Get canvas bounding box and calculate click position
const canvas = page.locator('canvas');
const box = await canvas.boundingBox();
if (box) {
    // Click center of canvas
    await page.mouse.click(
        box.x + box.width / 2,
        box.y + box.height / 2
    );
}
```

**Typing Words:**
```typescript
// Type a word via keyboard
await page.keyboard.type('hello');
await page.keyboard.press('Enter');
```

**Waiting for Game State:**
```typescript
// Wait for a specific visual element to appear
await page.waitForTimeout(1000); // Common — time-based waits
// or
await expect(page.locator('canvas')).toBeVisible();
```

**Error Testing:**
- Not currently tested — no error scenario E2E tests exist

## Adding New Tests

**New E2E test:**
1. Add test to `tests/game.spec.ts` (or create new `tests/<feature>.spec.ts`)
2. Use `loginAsGuest()` helper to get past auth
3. Interact via `page.mouse` and `page.keyboard` (canvas-based)
4. Assert via screenshots or visual state

**New unit test (recommended setup):**
- Recommended: Vitest (aligns with Vite build tooling)
- Config: Create `vitest.config.ts` extending `vite.config.ts`
- Location: Co-locate with source: `src/services/__tests__/AudioService.test.ts`
- Pattern:
  ```typescript
  import { describe, it, expect, vi } from 'vitest';
  import { audioService } from '../AudioService';

  describe('AudioService', () => {
      it('should ...', () => {
          expect(audioService).toBeDefined();
      });
  });
  ```

## Test Dependencies

**Current (`package.json`):**
- `@playwright/test`: E2E test runner

**Not present but recommended for unit testing:**
- `vitest`: Unit test runner (Vite-native)
- `@vitest/coverage-v8`: Code coverage
- `jsdom`: DOM environment for non-Phaser tests

---

*Testing analysis: 2026-04-10*
