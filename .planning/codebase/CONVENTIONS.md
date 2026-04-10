# Coding Conventions

**Analysis Date:** 2026-04-10

## Naming Patterns

**Files:**
- PascalCase for class files: `GameScene.ts`, `AudioService.ts`, `WizardRenderer.ts`, `ProgressBar.ts`, `Button.ts`
- camelCase for config/data/utility files: `constants.ts`, `gameConfig.json`, `words.json`
- Type definition files: `index.ts` barrel exports within `src/types/` and `src/themes/`

**Classes:**
- PascalCase everywhere: `AuthServiceImpl`, `EffectManager`, `WizardRenderer`, `BackgroundRenderer`
- Scene classes extend `Phaser.Scene`: `GameScene`, `MenuScene`, `UIScene`, `AuthScene`, `CountdownScene`, `SettingsScene`

**Interfaces:**
- PascalCase, no `I` prefix: `AuthUser`, `GameData`, `ThemeColors`, `ButtonConfig`, `GameConfig`
- Implementation classes use `Impl` suffix: `AuthServiceImpl` implements `AuthService` (interface used as type)

**Type Aliases:**
- PascalCase: `PowerType`, `GameState`, `ThemeName`, `PowerEffect`

**Variables & Functions:**
- camelCase: `wordService`, `audioService`, `trackEvent`, `loginAsGuest`, `clickCenter`
- Boolean variables often prefixed with `is`/`has`/`should`: `isConfigured`, `hasData`, `shouldShake`

**Constants:**
- UPPER_SNAKE_CASE for true compile-time constants: `GAME_WIDTH`, `GAME_HEIGHT`, `FONT_FAMILY`, `POWER_COLORS`, `KEYBOARD_LAYOUT`
- camelCase for singleton service instances exported at module level: `audioService`, `wordService`, `themeService`

## Code Style

**Formatting:**
- ESLint with `typescript-eslint` recommended config
- `eslint-plugin-simple-import-sort` enforces import ordering
- Indentation: 2 spaces (TypeScript/JSON)
- Semicolons: used
- Trailing commas: used
- Single quotes for strings

**Linting:**
- Config: `eslint.config.js` (flat config format)
- TypeScript rules: `typescript-eslint` recommended
- Unused variables: allowed when prefixed with `_` (e.g., `_param`)
- Console statements: allowed (no `no-console` rule)
- Import sort: enforced via `eslint-plugin-simple-import-sort`

**TypeScript Strictness:**
- `strict: true` in `tsconfig.json`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `noFallthroughCasesInSwitch: true`
- `noUncheckedIndexedAccess: true`

## Import Organization

**Order (enforced by `simple-import-sort`):**

1. Third-party packages (e.g., `phaser`, `@supabase/supabase-js`)
2. Blank line separator
3. Local imports grouped by category:
   - Config/constants (`../config/constants`, `../data/words`)
   - Services (`../services/AudioService`, `../services/ThemeService`)
   - Managers (`../managers/EffectManager`)
   - Types (`../types`, `../themes/types`)
   - UI components (`../ui/Button`, `../ui/ProgressBar`)
   - Themes (`../themes`)

**Path Aliases:**
- None configured — all imports use relative paths (`../services/X`, `../../config/Y`)

**Example import block:**
```typescript
import Phaser from 'phaser';

import { GAME_WIDTH, GAME_HEIGHT } from '../config/constants';
import { audioService } from '../services/AudioService';
import { themeService } from '../services/ThemeService';
import { EffectManager } from '../managers/EffectManager';
import type { GameData, PowerType } from '../types';
import { Button } from '../ui/Button';
```

## Error Handling

**Patterns:**

- **Graceful degradation for storage**: Try/catch with empty catch for `localStorage` operations — failures silently ignored:
  ```typescript
  // src/services/StorageService.ts
  try {
      localStorage.setItem(key, JSON.stringify(value));
  } catch {
      // Silently fail - storage may be unavailable
  }
  ```

- **Optional services pattern**: Backend services (Sentry, PostHog, Supabase) use an `isConfigured` flag. When unconfigured, public methods silently no-op rather than throwing:
  ```typescript
  // src/services/ObservabilityService.ts
  captureException(error: unknown): void {
      if (!this.isConfigured) return;
      Sentry.captureException(error);
  }
  ```

- **Error return pattern for auth**: Operations return `{ success: boolean; error?: string }` instead of throwing:
  ```typescript
  // src/services/AuthService.ts
  async loginAsGuest(): Promise<{ success: boolean; error?: string }>
  ```

- **`@ts-expect-error` used sparingly** with explanatory comments for known Phaser typing gaps.

- **Console logging**: Always prefixed with `[ServiceName]` for traceability:
  ```typescript
  console.log('[GameConfigService]', 'Loading config...');
  console.error('[AuthService]', 'Login failed:', error);
  ```

## Logging

**Framework:** Console only (no structured logging library)

**Patterns:**
- Prefix all logs with `[ClassName]` in square brackets
- Use `console.error()` for failures, `console.log()` for info, `console.warn()` for degraded states
- Optional services log once on init if unconfigured: `"PostHog not configured. Analytics events will be logged to console only."`

## Comments

**When to Comment:**
- JSDoc comments on public service methods are minimal — most code is self-documenting
- Inline comments explain *why*, not *what*
- `@ts-expect-error` comments explain the typing workaround

**JSDoc/TSDoc:**
- Not consistently used across the codebase
- Some service methods have brief JSDoc, most do not
- Not enforced by linting

## Function Design

**Size:** Functions tend to be moderate (10-40 lines). Long functions appear in scene `create()` methods which handle full scene setup.

**Parameters:** Named parameters passed as individual args (not options objects), except for UI components which use config interfaces:
```typescript
// Direct args for simple functions
highlightWord(wordIndex: number): void

// Config object for complex UI
interface ButtonConfig {
    scene: Phaser.Scene;
    x: number;
    y: number;
    text: string;
    // ...
}
```

**Return Values:** Explicit return types on most functions. Void for side-effect-only methods. Typed objects for data-returning methods.

## Module Design

**Exports:**
- One primary export per file (class, service instance, or config object)
- Named exports only — no default exports
- Barrel files in `src/types/index.ts` and `src/themes/index.ts` re-export from sub-modules

**Singleton Services Pattern (most important pattern in codebase):**
```typescript
// Service file exports interface as type and instance as const
// src/services/AudioService.ts
class AudioServiceImpl {
    // ... implementation
}

export type AudioService = AudioServiceImpl;
export const audioService = new AudioServiceImpl();
```

Consumers import the singleton:
```typescript
import { audioService } from '../services/AudioService';
```

**Static Utility Pattern (less common):**
```typescript
// src/services/GameConfigService.ts — object literal with methods, no class
export const GameConfigService = {
    getConfig(): GameConfig { ... },
    loadConfig(): void { ... },
};
```

**Phaser Scene Pattern:**
```typescript
// src/scenes/GameScene.ts
export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    create(): void { /* scene setup */ }
    update(time: number, delta: number): void { /* game loop */ }
}
```

## Architecture Patterns

**Scene Communication:**
- Via Phaser event emitter: `this.events.emit('eventName', data)` and `this.events.on('eventName', handler)`
- Cross-scene access: `this.scene.get('GameScene').events.on(...)`

**Theme System:**
- Centralized `ThemeService` with dot-path access: `themeService.getColor('text.primary')`
- Observer pattern for theme changes: `themeService.onThemeChange((theme) => { ... })`

**Config System:**
- Game parameters externalized to `src/data/gameConfig.json`
- Words externalized to `src/data/words.json`
- Accessed through `GameConfigService` (not imported directly)

**UI Rendering:**
- All UI drawn programmatically via Phaser Graphics API — no sprite/asset files for UI
- `Phaser.GameObjects.Graphics` for rectangles, panels, containers
- `Phaser.GameObjects.Text` for labels
- Tweens for animations: `this.tweens.add({ targets: [...], ... })`

---

*Convention analysis: 2026-04-10*
