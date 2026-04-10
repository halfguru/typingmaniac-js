# Architecture

**Analysis Date:** 2026-04-10

## Pattern Overview

**Overall:** Phaser 3 scene-based game with singleton service layer and entity-component-lite architecture.

**Key Characteristics:**
- Phaser 3 manages the game loop, rendering, and scene lifecycle
- Cross-cutting concerns handled by exported singleton service instances
- Theme system decouples all visual configuration from rendering logic
- All audio is procedurally synthesized (no audio files)
- External services (Supabase, Sentry, PostHog) are fully optional — game runs without any env vars

## Layers

**Entry Point:**
- Purpose: Bootstrap Phaser game, register scenes, initialize optional services
- Location: `src/main.ts`
- Contains: Phaser.Game config object, scene registration, service init calls
- Depends on: All scenes, ObservabilityService, AnalyticsService
- Used by: Vite entry (`index.html` → `/src/main.ts`)

**Scene Layer:**
- Purpose: Game screens and gameplay logic — Phaser manages lifecycle (init, create, update)
- Location: `src/scenes/`
- Contains: 6 scene classes extending `Phaser.Scene`
- Depends on: Services, UI components, managers, themes
- Used by: Phaser scene manager (started by `main.ts`)
- Scene flow: `AuthScene` → `MenuScene` → `CountdownScene` → `GameScene` (+ `UIScene` overlay, `SettingsScene` overlay)

**Service Layer:**
- Purpose: Singleton modules for cross-cutting concerns — auth, audio, storage, config, themes, analytics, error tracking
- Location: `src/services/`
- Contains: 10 service modules, each exporting a singleton instance
- Depends on: External SDKs (Supabase, Sentry, PostHog), localStorage, Web Audio API, theme data, config JSON
- Used by: Scenes and other services

**Manager Layer:**
- Purpose: Encapsulate complex visual effect subsystems
- Location: `src/managers/`
- Contains: `EffectManager` — particle systems, screen overlays, flashes, burst effects
- Depends on: ThemeService, Phaser game objects
- Used by: `GameScene`, `UIScene`

**UI Component Layer:**
- Purpose: Reusable Phaser UI widgets extending `Phaser.GameObjects.Container`
- Location: `src/ui/`
- Contains: `Button`, `ProgressBar`, `GameOverOverlay`
- Depends on: ThemeService
- Used by: Scenes (MenuScene, UIScene, SettingsScene)

**Theme System:**
- Purpose: Decouple all visual tokens (colors, fonts, dimensions) from rendering code
- Location: `src/themes/`
- Contains: Theme type definitions, theme registry, 2 theme implementations (default/cyberpunk, alchemist/fantasy)
- Depends on: Nothing (pure data)
- Used by: ThemeService (which is used everywhere)

**Config Layer:**
- Purpose: Game parameters and constants
- Location: `src/config/`
- Contains: `constants.ts` (derived dimensions, power mappings, font config), `gameConfig.json` (tunable gameplay parameters)
- Depends on: ThemeService (for deriving colors)
- Used by: GameScene, UIScene, services

**Types:**
- Purpose: Shared TypeScript type definitions
- Location: `src/types/index.ts`
- Contains: `PowerType`, `GameState`, `GameData` interfaces
- Depends on: Nothing
- Used by: Scenes and services

## Data Flow

**Game Session Flow:**

1. `main.ts` creates Phaser.Game → starts `AuthScene`
2. `AuthScene` authenticates via `AuthService` (or guest) → transitions to `MenuScene`
3. `MenuScene` shows tutorial/leaderboard → player clicks play → transitions to `CountdownScene`
4. `CountdownScene` shows 3-2-1-GO → transitions to `GameScene`
5. `GameScene` runs gameplay loop: spawning words, tracking input, managing powers
6. `GameScene` emits `gameDataUpdate` events → `UIScene` (parallel overlay) listens and updates HUD
7. Game over / level complete → `UIScene` shows overlay → transitions back to `MenuScene`

**Keyboard Input Flow:**

1. Keyboard event → `GameScene.handleKeyDown()`
2. Character appended to `typedInput` string
3. All falling words checked for prefix match → matching word highlighted in yellow
4. On Enter: submit `typedInput` → find exact match → `onWordComplete()`
5. Wrong submission: target word speed increases by 50%
6. `onWordComplete()` → update score, combo, spawn effects, emit `gameDataUpdate`

**Word Generation Flow:**

1. `GameScene` timer spawns words at intervals from `gameConfig.json`
2. `WordService.getWord(length)` provides words, avoiding recent repeats
3. Words organized by length in `src/data/words.json`
4. `GameConfigService` provides length distribution and spawn timing based on level/difficulty

**Power-Up Flow:**

1. Powers spawn as falling items with key hints or as word-drop rewards
2. Player presses mapped key (Q/W/E/R) or types power name to collect
3. 4 types: fire (clear all), ice (freeze), wind (slow), slow (reduce speed)
4. Powers stored in `gameData.powers` array (max 3)
5. Activation triggers `EffectManager` visual effects + gameplay mutation

**State Management:**
- No global state store — state lives in scene instances (`GameScene.gameData`, `GameScene.typedInput`)
- Cross-scene data passed via Phaser's scene data or direct method calls
- `UIScene` receives state via `gameDataUpdate` custom event
- Persistent data (high scores, leaderboard) stored via `StorageService` (localStorage)
- Auth state managed by `AuthService` (Supabase session)

## Key Abstractions

**Singleton Service Pattern:**
- Purpose: Provide globally accessible, stateful service instances
- Examples: `src/services/ThemeService.ts`, `src/services/AudioService.ts`, `src/services/AuthService.ts`
- Pattern: `class XxxServiceImpl { ... }; export const xxxService = new XxxServiceImpl();`
- All 10 services follow this exact pattern

**Path-Based Theme Lookup:**
- Purpose: Access deeply nested theme colors/fonts with dot-notation paths
- Examples: `src/services/ThemeService.ts` methods `getNumber()`, `getText()`, `getHex()`
- Pattern: `themeService.getNumber('game.word.textColor')` traverses nested theme object
- Allows themes to have different structure depths while keeping call sites uniform

**Phaser Scene Lifecycle:**
- Purpose: Each game screen follows Phaser's init → create → update cycle
- Examples: All files in `src/scenes/`
- Pattern: `class XxxScene extends Phaser.Scene { init() { } create() { } update() { } }`

**UI Component Container:**
- Purpose: Compose Phaser game objects into reusable interactive widgets
- Examples: `src/ui/Button.ts`, `src/ui/ProgressBar.ts`
- Pattern: `class Widget extends Phaser.GameObjects.Container { constructor(scene, ...) { super(scene); ... } }`

**Procedural Rendering:**
- Purpose: Draw all graphics programmatically (no sprite assets needed)
- Examples: `src/services/BackgroundRenderer.ts` (835 lines), `src/services/WizardRenderer.ts` (818 lines)
- Pattern: Static class methods take a Phaser scene and draw shapes, gradients, particles using Phaser's graphics API

## Entry Points

**Application Entry:**
- Location: `src/main.ts`
- Triggers: Vite dev server or built HTML loads `/src/main.ts`
- Responsibilities: Create Phaser.Game with config, initialize Sentry/PostHog, register 6 scenes

**Scene Transitions:**
- Location: Each scene's transition logic (e.g., `AuthScene.ts` → `MenuScene.ts`)
- Triggers: User actions (button clicks) or game events (countdown complete)
- Pattern: `this.scene.start('SceneKey')` or `this.scene.launch('SceneKey')` (for parallel overlay scenes)

**Test Entry:**
- Location: `tests/game.spec.ts`
- Triggers: Playwright test runner (`npm run test`)
- Responsibilities: E2E tests for auth flow, menu navigation, gameplay screenshots

## Error Handling

**Strategy:** Layered — graceful degradation with fallbacks for all external services.

**Patterns:**
- External service init wrapped in try/catch with console fallback (`AuthService`, `ObservabilityService`, `AnalyticsService`)
- `ObservabilityService` catches errors via Sentry; falls back to `console.error` if Sentry not configured
- `AudioService` gracefully handles missing Web Audio API context
- `StorageService` wraps localStorage calls (handles quota/full errors)
- Phaser scene errors propagate to Sentry via global error handler in `main.ts`

## Cross-Cutting Concerns

**Logging:** `console.log` / `console.error` throughout; Sentry for production error tracking via `ObservabilityService`

**Validation:** No formal validation layer — input validated inline in scene handlers (e.g., word matching in `GameScene.handleKeyDown`)

**Authentication:** `AuthService` wraps Supabase OAuth (Google, Facebook) + anonymous guest; scenes check `authService.isAuthenticated()` before accessing global leaderboard

**Analytics:** `AnalyticsService` wraps PostHog — events tracked for game start, word complete, game over, power usage, level complete; falls back to `console.log` if PostHog not configured

**Theming:** `ThemeService` provides path-based color/font access to all layers; persists selected theme to localStorage; notifies listeners on theme change

---

*Architecture analysis: 2026-04-10*
