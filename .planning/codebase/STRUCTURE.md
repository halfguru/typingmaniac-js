# Codebase Structure

**Analysis Date:** 2026-04-10

## Directory Layout

```
typing-maniac-clone/
├── index.html              # Vite entry HTML, loads /src/main.ts, Google Fonts
├── package.json            # Dependencies and scripts
├── vite.config.ts          # Dev server (port 3000), terser minify, relative base
├── tsconfig.json           # ES2020, strict mode, bundler module resolution
├── tsconfig.app.json       # App-specific TS config (extends tsconfig.json)
├── tsconfig.node.json      # Node/Vite-specific TS config
├── playwright.config.ts    # Playwright E2E test config
├── eslint.config.js        # ESLint flat config
├── docs/
│   ├── DESIGN.md           # Game design document
│   └── screenshot.png      # Game screenshot
├── tests/
│   └── game.spec.ts        # Playwright E2E tests
├── public/
│   └── favicon.svg         # App favicon
├── src/
│   ├── main.ts             # Phaser game bootstrap (entry point)
│   ├── vite-env.d.ts       # Vite type declarations
│   ├── config/             # Game constants and tunable parameters
│   │   ├── constants.ts    # Dimensions, power mappings, font config
│   │   └── gameConfig.json # Tunable gameplay parameters (progression, scoring, etc.)
│   ├── data/
│   │   └── words.json      # Word bank organized by word length
│   ├── types/
│   │   ├── index.ts        # PowerType, GameState, GameData
│   │   └── json.d.ts       # JSON module declarations
│   ├── themes/             # Visual theme definitions
│   │   ├── types.ts        # ThemeColors, ThemeFonts, Theme interfaces
│   │   ├── index.ts        # Theme registry + default export
│   │   ├── default.ts      # Cyberpunk/neon theme colors
│   │   └── alchemist.ts    # Fantasy/alchemy theme colors
│   ├── services/           # Singleton service modules (10 files)
│   │   ├── ThemeService.ts       # Theme management, path-based color lookup
│   │   ├── GameConfigService.ts  # Static JSON config reader
│   │   ├── WordService.ts        # Word provider with dedup
│   │   ├── AudioService.ts       # Web Audio API synthesized sounds
│   │   ├── AuthService.ts        # Supabase OAuth + anonymous auth
│   │   ├── StorageService.ts     # localStorage persistence
│   │   ├── BackgroundRenderer.ts # Procedural background rendering
│   │   ├── WizardRenderer.ts     # Procedural wizard character rendering
│   │   ├── AnalyticsService.ts   # PostHog event tracking
│   │   └── ObservabilityService.ts # Sentry error tracking
│   ├── managers/
│   │   └── EffectManager.ts      # Visual effects (particles, overlays, flashes)
│   ├── scenes/             # Phaser scene classes (6 files)
│   │   ├── AuthScene.ts          # Login screen
│   │   ├── MenuScene.ts          # Main menu + tutorial + leaderboard
│   │   ├── CountdownScene.ts     # 3-2-1-GO countdown
│   │   ├── GameScene.ts          # Core gameplay loop
│   │   ├── UIScene.ts            # Sidebar HUD + game over/level complete overlays
│   │   └── SettingsScene.ts      # Audio settings
│   └── ui/                 # Reusable UI components
│       ├── Button.ts             # Interactive button widget
│       ├── ProgressBar.ts        # Animated progress bar widget
│       └── GameOverOverlay.ts    # Game over display (currently unused)
├── dist/                   # Build output (gitignored)
└── .planning/              # GSD planning documents
```

## Directory Purposes

**`src/config/`:**
- Purpose: Static game configuration — constants derived from themes, tunable JSON parameters
- Contains: TypeScript constants file, JSON config file
- Key files: `src/config/constants.ts` (57 lines), `src/config/gameConfig.json` (75 lines)
- Note: `constants.ts` derives some values from `ThemeService` at module load time

**`src/data/`:**
- Purpose: Static data files consumed at runtime
- Contains: JSON word bank
- Key files: `src/data/words.json`
- Note: Words organized by character length (keys are length numbers)

**`src/types/`:**
- Purpose: Shared TypeScript type definitions used across scenes and services
- Contains: Interface and type alias definitions
- Key files: `src/types/index.ts` (15 lines) — `PowerType`, `GameState`, `GameData`

**`src/themes/`:**
- Purpose: Visual theme definitions — pure data, no logic
- Contains: Type definitions, theme registry, theme implementations
- Key files: `src/themes/types.ts` (83 lines) — all theme interfaces; `src/themes/index.ts` (16 lines) — registry
- Note: Add new themes by creating a new file and registering it in `index.ts`

**`src/services/`:**
- Purpose: Singleton service instances for all cross-cutting concerns
- Contains: 10 service modules, each `export const xxxService = new XxxServiceImpl()`
- Key files: See directory layout above for all 10 files
- Note: Largest files are `BackgroundRenderer.ts` (835 lines) and `WizardRenderer.ts` (818 lines) — procedural rendering

**`src/managers/`:**
- Purpose: Complex subsystem managers that encapsulate multiple game object interactions
- Contains: EffectManager only currently
- Key files: `src/managers/EffectManager.ts` (401 lines)
- Note: Manager classes are instantiated in scenes, not singletons

**`src/scenes/`:**
- Purpose: Phaser scene classes — each represents a game screen/phase
- Contains: 6 scene classes extending `Phaser.Scene`
- Key files: `UIScene.ts` (1087 lines, largest file), `MenuScene.ts` (968 lines), `GameScene.ts` (837 lines)
- Note: Scenes are the primary place where game logic lives

**`src/ui/`:**
- Purpose: Reusable Phaser UI widgets extending `Phaser.GameObjects.Container`
- Contains: 3 component classes
- Key files: `ProgressBar.ts` (310 lines), `Button.ts` (95 lines), `GameOverOverlay.ts` (122 lines)
- Note: `GameOverOverlay.ts` exists but is not currently used — game over UI is built inline in `UIScene`

**`tests/`:**
- Purpose: Playwright end-to-end tests
- Contains: Single test spec file
- Key files: `tests/game.spec.ts`
- Note: Tests run against dev server; verify auth, menu, gameplay via screenshots

**`docs/`:**
- Purpose: Project documentation
- Contains: Design document and screenshot
- Key files: `docs/DESIGN.md`

## Key File Locations

**Entry Points:**
- `index.html`: Vite HTML entry, loads `/src/main.ts`
- `src/main.ts`: Phaser.Game creation, scene registration, optional service init (36 lines)

**Configuration:**
- `vite.config.ts`: Dev server port 3000, terser minification, relative base path
- `tsconfig.json`: ES2020 target, strict mode, bundler module resolution
- `playwright.config.ts`: E2E test configuration
- `eslint.config.js`: ESLint flat config
- `package.json`: Scripts and dependencies

**Core Logic:**
- `src/scenes/GameScene.ts`: Main gameplay loop — word spawning, keyboard input, power-ups, scoring (837 lines)
- `src/scenes/UIScene.ts`: HUD rendering, sidebar, game over/level complete overlays (1087 lines)
- `src/scenes/MenuScene.ts`: Main menu, tutorial, leaderboard display (968 lines)
- `src/config/gameConfig.json`: All tunable game parameters — progression, scoring, combo, difficulty, power-ups

**Theme/Visual:**
- `src/themes/default.ts`: Cyberpunk theme definition
- `src/themes/alchemist.ts`: Fantasy/alchemy theme definition
- `src/themes/types.ts`: Theme interface definitions
- `src/services/BackgroundRenderer.ts`: Procedural background drawing (835 lines)
- `src/services/WizardRenderer.ts`: Procedural wizard character drawing (818 lines)

**Audio:**
- `src/services/AudioService.ts`: All sound effects synthesized via Web Audio API oscillators (216 lines)

**Auth/Backend:**
- `src/services/AuthService.ts`: Supabase integration — OAuth + anonymous + global leaderboard (308 lines)
- `src/services/StorageService.ts`: localStorage — high scores, local leaderboard, play history (82 lines)

**Testing:**
- `tests/game.spec.ts`: Playwright E2E tests — auth flow, menu, gameplay screenshots

## Naming Conventions

**Files:**
- PascalCase for classes: `GameScene.ts`, `EffectManager.ts`, `ProgressBar.ts`
- camelCase for JSON data: `gameConfig.json`, `words.json`
- All service files: `XxxService.ts` pattern
- All scene files: `XxxScene.ts` pattern
- All theme files: lowercase descriptive names: `default.ts`, `alchemist.ts`

**Exports:**
- Default exports for scenes: `export default class GameScene extends Phaser.Scene`
- Named singleton exports for services: `export const themeService = new ThemeServiceImpl()`
- Named type exports: `export type PowerType = 'fire' | 'ice' | 'wind' | 'slow'`
- Named interface exports: `export interface GameData { ... }`

**Variables:**
- camelCase everywhere: `typedInput`, `gameData`, `currentWord`
- Private members use no prefix (TypeScript `private` keyword used)
- Constants: UPPER_SNAKE_CASE for true constants, camelCase for config values

**Scene Keys:**
- String keys match class names without "Scene": `'Auth'`, `'Menu'`, `'Countdown'`, `'Game'`, `'UI'`, `'Settings'`

**Phaser Event Names:**
- camelCase strings: `'gameDataUpdate'`, `'wordComplete'`

## Where to Add New Code

**New Scene:**
- Create file: `src/scenes/NewScene.ts`
- Pattern: `export default class NewScene extends Phaser.Scene { constructor() { super('NewScene'); } }`
- Register in: `src/main.ts` — add to `scene` array in Phaser config
- Start from another scene: `this.scene.start('NewScene');`

**New Service:**
- Create file: `src/services/XxxService.ts`
- Pattern: `class XxxServiceImpl { ... }; export const xxxService = new XxxServiceImpl();`
- Import in scenes: `import { xxxService } from '../services/XxxService';`

**New Theme:**
- Create file: `src/themes/themeName.ts`
- Pattern: Define object conforming to `Theme` interface from `src/themes/types.ts`
- Register in: `src/themes/index.ts` — add to theme registry object

**New UI Component:**
- Create file: `src/ui/ComponentName.ts`
- Pattern: `export class ComponentName extends Phaser.GameObjects.Container { constructor(scene: Phaser.Scene, ...) { super(scene, ...); } }`
- Use in scenes: `const widget = new ComponentName(this, x, y, ...); this.add.existing(widget);`

**New Power-Up Type:**
- Add type to: `src/types/index.ts` — extend `PowerType` union
- Add mapping in: `src/config/constants.ts` — add to `POWERS` object
- Add logic in: `src/scenes/GameScene.ts` — handle activation in power-up handler
- Add effects in: `src/managers/EffectManager.ts` — add visual effect method

**New Game Config Parameter:**
- Add to: `src/config/gameConfig.json`
- Access via: `gameConfigService.getValue('path.to.param')` in any scene or service

**New Test:**
- Add to: `tests/game.spec.ts` (existing file)
- Pattern: Follow Playwright patterns already in the file

## Special Directories

**`dist/`:**
- Purpose: Vite build output
- Generated: Yes (by `npm run build`)
- Committed: No (gitignored)

**`src/data/`:**
- Purpose: Static JSON data loaded at runtime
- Generated: No
- Committed: Yes

**`.planning/`:**
- Purpose: GSD planning documents (codebase analysis, task plans)
- Generated: Yes (by GSD tools)
- Committed: Yes

**`node_modules/`:**
- Purpose: npm dependencies
- Generated: Yes (by `npm install`)
- Committed: No (gitignored)

---

*Structure analysis: 2026-04-10*
