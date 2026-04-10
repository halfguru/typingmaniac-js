# External Integrations

**Analysis Date:** 2026-04-10

## APIs & External Services

**Supabase (Auth + Database):**
- Purpose: User authentication (Google OAuth, Facebook OAuth, anonymous/guest) and global leaderboard
- SDK: `@supabase/supabase-js` ^2.100.0
- Client initialization: `src/services/AuthService.ts`
  - `createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)` with auto-refresh token, session persistence, URL session detection
- Auth methods:
  - `signInWithOAuth({ provider: 'google' })` with redirect callback
  - `signInWithOAuth({ provider: 'facebook' })` with redirect callback
  - `signInAnonymously()` for guest access
  - `signOut({ scope: 'global' })`
  - `exchangeCodeForSession()` for OAuth redirect handling
- Database operations:
  - `supabase.from('leaderboard').insert(...)` - Submit scores
  - `supabase.from('leaderboard').select('*')` - Fetch global leaderboard (top 20)
  - `supabase.from('leaderboard').select('user_id, score, level', { count: 'exact' })` - Get user rank
- Table schema inferred from code: `leaderboard` table with columns: `id`, `user_id`, `username`, `score`, `level`, `avatar_url`, `created_at`
- Auth state listener: `supabase.auth.onAuthStateChange()` events: `SIGNED_IN`, `INITIAL_SESSION`, `SIGNED_OUT`
- **Optional**: All Supabase calls are guarded by `isConfigured` check; if env vars missing, game runs with local-only leaderboard

**Sentry (Error Tracking & Performance):**
- Purpose: Runtime error capture, performance tracing, session replay
- SDK: `@sentry/browser` ^10.43.0
- Initialization: `src/services/ObservabilityService.ts`
  - `Sentry.init()` with DSN, environment, release version
  - Integrations: `browserTracingIntegration()`, `replayIntegration()` (no text masking)
  - Sample rates: traces 10%, session replay 10%, error replay 100%
- Exported functions:
  - `captureException(error, context)` - Error capture with extra context
  - `captureMessage(message, level)` - Info/warning/error messages
  - `setUser(id, username)` / `clearUser()` - User identity tracking
  - `addBreadcrumb(category, message, data)` - Audit trail breadcrumbs
  - `observeAsync(name, fn, context)` - Traced async operations with error capture
- Called from: `src/services/AuthService.ts` (auth errors, operation breadcrumbs)
- **Optional**: If `VITE_SENTRY_DSN` not set, all functions log to console instead

**PostHog (Product Analytics):**
- Purpose: Event tracking, user identification, session recording
- SDK: `posthog-js` ^1.360.2
- Initialization: `src/services/AnalyticsService.ts`
  - `posthog.init(key, { api_host, capture_pageview, session_recording })`
  - Default host: `https://us.i.posthog.com`
- Tracked events:
  - `game_started` - with `{ theme }`
  - `game_over` - with `{ score, level, wordsCompleted, wordsMissed }`
  - `level_complete` - with `{ level, score, accuracy }`
  - `power_up_used` - with `{ type }`
  - `theme_changed` - with `{ from, to }`
  - `sign_in` - with `{ method: 'google' | 'facebook' | 'guest' }`
  - `sign_out`
  - `leaderboard_viewed` - with `{ type: 'global' | 'local' }`
  - `tutorial_viewed`
  - `settings_viewed`
- User identity: `posthog.identify(id, properties)`, `posthog.reset()`
- Called from: `src/services/AuthService.ts` (auth events), game scenes (game events)
- **Optional**: If `VITE_POSTHOG_KEY` not set, events logged to console only

**Google Fonts (CDN):**
- Purpose: Web font loading for game UI
- Font: `Fredoka` (weights 400, 600)
- Loaded via `<link>` preconnect + CSS import in `index.html`
- Used by `ThemeService.fonts.primary` referenced in `src/config/constants.ts`

## Data Storage

**Databases:**
- Supabase PostgreSQL (remote, optional)
  - Connection: via `@supabase/supabase-js` client using `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`
  - Table: `leaderboard` - global high scores
  - Operations: INSERT (submit score), SELECT (fetch leaderboard, get user rank)

**Local Storage (Browser `localStorage`):**
- Implementation: `src/services/StorageService.ts`
  - `typingmaniac_highscore` - Single best score (number)
  - `typingmaniac_hasplayed` - First-play flag ("true"/null)
  - `typingmaniac_leaderboard` - Local leaderboard JSON array (top 5 entries with `score`, `level`, `date`)
- Implementation: `src/services/WordService.ts`
  - `recentWords` - JSON array of recently used words (max 50) to avoid repetition
- Implementation: `src/services/ThemeService.ts`
  - `typingmaniac-theme` - Selected theme name ("default" | "alchemist")
- Implementation: `src/services/AudioService.ts`
  - `typingmaniac_audiosettings` - JSON object with `masterVolume`, `sfxVolume`, `musicVolume`, `muted`
- Supabase Auth: Session persistence handled by Supabase SDK (likely uses localStorage internally)

**File Storage:**
- Local filesystem only - no cloud file storage
- Static assets: `public/favicon.svg`
- Game word data: bundled JSON (`src/data/words.json`)
- Game config: bundled JSON (`src/config/gameConfig.json`)
- All rendering is procedural (Phaser Graphics API) - no sprite/image assets

**Caching:**
- None (beyond localStorage persistence and browser caching of static assets)

## Authentication & Identity

**Auth Provider:**
- Supabase Auth (optional, graceful fallback)
  - Implementation: `src/services/AuthService.ts`
  - Methods:
    - Google OAuth via `signInWithOAuth({ provider: 'google' })` with redirect
    - Facebook OAuth via `signInWithOAuth({ provider: 'facebook' })` with redirect
    - Anonymous/guest via `signInAnonymously()`
  - Session: Auto-refresh token, persist session, detect session in URL
  - OAuth redirect: `window.location.origin + window.location.pathname`
  - Auth state changes propagated via callback pattern (`onAuthChange(callback)`)
  - User mapping: Extracts `full_name`, `name`, `email`, `avatar_url`, `picture` from user metadata
  - Guest names: `Guest_{userId_prefix}` if no `guest_name` in metadata
- Cross-service integration:
  - On sign in: Sets Sentry user (`setUser`), identifies PostHog user (`identifyUser`), tracks auth event
  - On sign out: Clears Sentry user, resets PostHog, tracks sign-out event

## Monitoring & Observability

**Error Tracking:**
- Sentry (`@sentry/browser`)
  - Error capture with context
  - Performance tracing (10% sample rate)
  - Session replay (10% sample, 100% on errors)
  - User identity association
  - Breadcrumb audit trail

**Analytics:**
- PostHog (`posthog-js`)
  - Event tracking for game lifecycle, auth, theme changes
  - User identification
  - Session recording (input not masked)
  - Page view capture enabled

**Logs:**
- `console.log` / `console.error` used as fallback when Sentry/PostHog not configured
- Prefixed log messages: `[Observability]`, `[Analytics]`

## CI/CD & Deployment

**Hosting:**
- GitHub Pages (static site hosting)
- Deployment: `.github/workflows/deploy.yml`
  - Triggered on push to `master`
  - Three-stage pipeline: release → build → deploy
  - Release job: Creates GitHub Release from `package.json` version with changelog from `CHANGELOG.md`
  - Build job: `npm ci` → `npm run build` with secrets injected as env vars
  - Deploy job: Uses `actions/deploy-pages@v5`

**CI Pipeline:**
- Four GitHub Actions workflows:
  1. **Lint** (`.github/workflows/lint.yml`): `tsc --noEmit` + `npm run lint` on push/PR to master
  2. **Build** (`.github/workflows/build.yml`): `tsc --noEmit` + `npm run build` on push/PR to master
  3. **Test** (`.github/workflows/test.yml`): Playwright tests on Chromium on push/PR to master
  4. **Deploy** (`.github/workflows/deploy.yml`): Build + deploy to GitHub Pages on master push only
- All workflows use Node.js 20, `npm ci`, `actions/checkout@v6`
- Dependabot: Weekly updates for npm and GitHub Actions (`.github/dependabot.yml`)

## Environment Configuration

**Required env vars:**
- None - all external services are optional

**Optional env vars:**
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key (public, safe for client-side)
- `VITE_SENTRY_DSN` - Sentry project DSN
- `VITE_POSTHOG_KEY` - PostHog API key
- `VITE_POSTHOG_HOST` - PostHog API host (default: `https://us.i.posthog.com`)
- `VITE_APP_VERSION` - App version (auto-injected from `package.json` via Vite config)

**Secrets location:**
- Local: `.env` file (git-ignored, template at `.env.example`)
- CI: GitHub Actions secrets (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SENTRY_DSN`, `VITE_POSTHOG_KEY`, `VITE_POSTHOG_HOST`)
- Build-time injection: Vite replaces `import.meta.env.VITE_*` at build time; values are embedded in the JavaScript bundle

## Webhooks & Callbacks

**Incoming:**
- OAuth redirects: Google/Facebook OAuth callbacks redirect back to `window.location.origin + window.location.pathname`
  - URL hash contains `access_token` parsed by `exchangeCodeForSession()` in `src/services/AuthService.ts`
  - Hash cleaned from URL after processing via `window.history.replaceState()`

**Outgoing:**
- None (no outgoing webhooks; all integrations are client-side SDK calls)

---

*Integration audit: 2026-04-10*
