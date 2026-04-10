# Technology Stack

**Analysis Date:** 2026-04-10

## Languages

**Primary:**
- TypeScript 5.3+ - All source code in `src/`; strict mode enabled (`"strict": true` in `tsconfig.json`)
- Target: ES2020 with DOM/DOM.Iterable libs

**Secondary:**
- JSON - Game configuration (`src/config/gameConfig.json`), word data (`src/data/words.json`)
- HTML - Single-page entry point (`index.html`)
- CSS (inline) - Minimal styles in `index.html` for game container layout
- YAML - GitHub Actions workflows (`.github/workflows/`)

## Runtime

**Environment:**
- Node.js 20 (specified in GitHub Actions: `actions/setup-node@v6` with `node-version: '20'`)
- Browser runtime only - no server-side execution; game runs entirely client-side

**Package Manager:**
- npm (lockfile: `package-lock.json` present)
- Module type: `"type": "module"` (ESM throughout)

## Frameworks

**Core:**
- Phaser 3.70+ - HTML5 game engine; handles rendering, scene management, scale, DOM integration
  - Configured in `src/main.ts` with `Phaser.AUTO` renderer, FIT scaling, CENTER_BOTH
  - Resolution: 1920×1080 virtual canvas (`GAME_WIDTH`/`GAME_HEIGHT` in `src/config/constants.ts`)
  - 6 scenes: AuthScene, MenuScene, CountdownScene, GameScene, UIScene, SettingsScene

**Build:**
- Vite 8.0+ - Dev server and production bundler
  - Config: `vite.config.ts`
  - Dev port: 3000 with auto-open browser
  - Output: `dist/` directory, Terser minification, no source maps
  - Injects `VITE_APP_VERSION` from `package.json` at build time

**Testing:**
- Playwright 1.58+ - End-to-end browser testing
  - Config: `playwright.config.ts`
  - Test directory: `tests/` (currently `game.spec.ts`)
  - Chromium only, single worker, 60s timeout
  - Starts Vite dev server automatically for tests

**Linting:**
- ESLint 10+ with `typescript-eslint` and `eslint-plugin-simple-import-sort`
  - Config: `eslint.config.js` (flat config format)
  - Enforces import/export sorting
  - Allows unused vars with `_` prefix (`argsIgnorePattern: '^_'`)
  - `no-console: off` (console logging used as fallback when services unconfigured)

## Key Dependencies

**Production Dependencies:**

| Package | Version | Purpose |
|---------|---------|---------|
| `phaser` | ^3.70.0 | Game engine - rendering, physics, scenes, input |
| `@supabase/supabase-js` | ^2.100.0 | Auth (Google, Facebook, Guest) + leaderboard DB |
| `@sentry/browser` | ^10.43.0 | Error tracking, performance tracing, session replay |
| `posthog-js` | ^1.360.2 | Product analytics, session recording |

**Dev Dependencies:**

| Package | Version | Purpose |
|---------|---------|---------|
| `typescript` | ^5.3.3 | Type checking (`tsc --noEmit`) |
| `vite` | ^8.0.2 | Build tool and dev server |
| `terser` | ^5.46.1 | JS minification for production builds |
| `eslint` | ^10.1.0 | Code quality enforcement |
| `typescript-eslint` | ^8.57.0 | TypeScript-aware ESLint rules |
| `@eslint/js` | ^10.0.1 | ESLint recommended JS rules |
| `eslint-plugin-simple-import-sort` | ^12.1.1 | Automatic import ordering |
| `@playwright/test` | ^1.58.2 | E2E test framework |
| `dotenv` | ^17.3.1 | Environment variable loading |

## Configuration

**TypeScript** (`tsconfig.json`):
- Module resolution: `bundler` (Vite-compatible)
- Strict mode enabled with `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`
- `isolatedModules: true` (required by Vite)
- `resolveJsonModule: true` (imports JSON configs)
- Includes `src/` only

**Vite** (`vite.config.ts`):
- Base path: `./` (relative, for GitHub Pages deployment)
- Build output: `dist/` with `assets/` subdirectory
- Source maps disabled
- Terser minification
- Dev server on port 3000

**ESLint** (`eslint.config.js`):
- Flat config format (ESLint 10+)
- Extends `js.configs.recommended` + `tseslint.configs.recommended`
- Custom rules: import sorting, unused vars with `_` prefix

**Playwright** (`playwright.config.ts`):
- Single worker, no parallelism
- HTML reporter
- Trace on first retry, screenshots on failure only
- Auto-starts dev server (`npm run dev`)

**Environment Variables** (typed in `src/vite-env.d.ts`):
- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` - Supabase (optional)
- `VITE_SENTRY_DSN` - Sentry (optional)
- `VITE_APP_VERSION` - App version, injected at build time (optional)
- `VITE_POSTHOG_KEY` / `VITE_POSTHOG_HOST` - PostHog analytics (optional)
- `MODE` - Vite mode string

**Game Configuration** (`src/config/gameConfig.json`):
- Level progression, scoring, combo multipliers
- Difficulty curve (fall speed, spawn rate, word length)
- Power-up parameters (drop rates, durations)

**External Fonts:**
- Google Fonts: `Fredoka` (weights 400, 600) loaded via `<link>` in `index.html`
- Preconnect to `fonts.googleapis.com` and `fonts.gstatic.com`

## Platform Requirements

**Development:**
- Node.js 20+
- npm (with lockfile)
- Modern browser (Chromium-based for Playwright tests)

**Production:**
- Static hosting only (GitHub Pages configured in `.github/workflows/deploy.yml`)
- No server-side runtime required
- All assets bundled into `dist/`

---

*Stack analysis: 2026-04-10*
