# Codebase Concerns

**Analysis Date:** 2026-04-10

## Tech Debt

### Giant Scene Files (God Objects)
- Issue: Three scene files are extremely large, combining UI rendering, game logic, state management, and animation in single classes. No separation of concerns.
- Files: `src/scenes/UIScene.ts` (1087 lines), `src/scenes/MenuScene.ts` (968 lines), `src/scenes/GameScene.ts` (837 lines)
- Impact: Hard to navigate, difficult to test, high cognitive load for any change. A UI text change requires scrolling past hundreds of unrelated lines.
- Fix approach: Extract UI building into dedicated builder classes. Separate game state logic from rendering in `GameScene`. Extract overlay creation (game-over, level-complete, tutorial, leaderboard) from `UIScene` and `MenuScene` into individual overlay components.

### Renderer Files Are Massive Static Classes
- Issue: `BackgroundRenderer` (835 lines) and `WizardRenderer` (818 lines) are huge files with deeply nested drawing code. `BackgroundRenderer` uses all static methods, making it impossible to hold per-scene state or dispose resources.
- Files: `src/services/BackgroundRenderer.ts`, `src/services/WizardRenderer.ts`
- Impact: Hard to modify individual visual elements. No way to clean up resources per-scene. Static methods can't be injected or mocked for testing.
- Fix approach: Convert to instance-based classes. Split into sub-renderers (e.g., `LibraryRenderer`, `CyberpunkRenderer`, `WizardBodyRenderer`, `WizardAnimationRenderer`).

### Duplicated UI Drawing Patterns
- Issue: Scroll/overlay drawing code is duplicated across `UIScene.showGameOver()` and `UIScene.showLevelComplete()`. Both build nearly identical scroll containers with corner decorations, golden borders, and parchment backgrounds. Similarly, "MISS" popup code exists in `GameScene.showWrongWordPopup()`, `GameScene.showMissPopup()`, and `EffectManager.showWrongWordPopup()`, and `EffectManager.showMissPopup()` — four near-identical implementations.
- Files: `src/scenes/UIScene.ts` (lines 444-759 vs 762-991), `src/scenes/GameScene.ts` (lines 312-346, 684-703), `src/managers/EffectManager.ts` (lines 309-327, 358-389)
- Impact: Visual inconsistency risk when updating one copy but not the other. Maintenance burden multiplied.
- Fix approach: Create a `ScrollOverlayBuilder` utility class for the scroll container pattern. Create a single `FloatingTextEffect` method for "MISS" popups.

### Duplicated Word Cleanup Logic
- Issue: The pattern of destroying word letters, container, and frozenIndicator, then filtering the array, is repeated in 4 places: `onWordComplete()`, `activatePower('fire')`, `checkMissedWords()`, `resetGame()`, and `continueAfterLevelComplete()`.
- Files: `src/scenes/GameScene.ts` (lines 379-384, 463-466, 672-677, 755-760, 795-800)
- Impact: Bug risk — if cleanup logic changes (e.g., adding a new word property to destroy), all 5 locations must be updated.
- Fix approach: Extract a `destroyWord(word: WordObject)` method and use `destroyAllWords()`.

### Duplicated State Reset Logic
- Issue: Game state reset is duplicated between `init()`, `resetGame()`, and `continueAfterLevelComplete()`. Each method manually resets 10+ properties. If a new state field is added, all three must be updated.
- Files: `src/scenes/GameScene.ts` (lines 62-81, 753-781, 784-812)
- Impact: High risk of inconsistent state after reset. A missed field could leak state between games.
- Fix approach: Create a `defaultGameState()` method that returns initial values for all fields. Call it from all three locations.

### Hardcoded Magic Numbers in UI Layout
- Issue: UI positions are scattered as raw numeric literals throughout scene code. The power box Y starts at 378, progress bars at Y=705, score box at Y=180, etc. No centralized layout constants.
- Files: `src/scenes/UIScene.ts` (lines 113, 253, 377), `src/scenes/GameScene.ts` (lines 118-168, 202-223)
- Impact: Layout adjustments require hunting through hundreds of lines. Inconsistent spacing. Theme changes nearly impossible.
- Fix approach: Create a `layout.ts` config with named layout positions and spacing constants.

## Known Bugs

### `findTargetWord()` Called Twice Per Frame
- Symptoms: `highlightTargetWord()` iterates all words, and for each word that matches the typed prefix, calls `findTargetWord()` again to check identity. This is O(n²) per frame.
- Files: `src/scenes/GameScene.ts` (lines 705-722)
- Trigger: Occurs every frame during active gameplay when typing input is non-empty.
- Workaround: None — always occurs during gameplay.
- Fix approach: Call `findTargetWord()` once, store the result, then use it in the loop.

### `submitWord()` Calls Wrong Method on GameScene
- Symptoms: `GameScene.submitWord()` (line 286) calls `this.effects.showWrongWordPopup(targetWord)` at line 305, but `GameScene` also has its own `showWrongWordPopup()` method at line 312. The method on GameScene is never called externally — only the EffectManager version runs.
- Files: `src/scenes/GameScene.ts` (lines 305, 312-346)
- Trigger: Wrong word submission.
- Workaround: Works because EffectManager handles it.
- Fix approach: Remove the dead `showWrongWordPopup()` and `showComboPopup()` methods from `GameScene`.

### `submitScore` Rank Calculation Is Fragile
- Symptoms: After inserting a score, the method fetches ALL rows ordered by score, then iterates to find the user's position. It tries to deduplicate by filtering same-user entries, but the logic is incorrect — `sameScore` filters by `user_id` match AND `idx < i`, which counts the user's own previous entries, not ties with other users.
- Files: `src/services/AuthService.ts` (lines 221-242)
- Trigger: When a logged-in user finishes a game and their score is submitted.
- Workaround: Works for first-time scores. Subsequent scores may report incorrect rank.
- Fix approach: Use a database-side rank calculation (e.g., SQL `RANK()` window function) or fetch the rank directly from Supabase with an RPC call.

### `getUserRank` Fetches Entire Leaderboard
- Symptoms: To find one user's rank, the method downloads the entire leaderboard table with no limit.
- Files: `src/services/AuthService.ts` (lines 271-305)
- Trigger: When viewing user rank after game over.
- Workaround: Works for small leaderboards.
- Fix approach: Use an RPC or query with `COUNT` for rank: `SELECT COUNT(*) FROM leaderboard WHERE score > $userScore`.

### Power-up Cheat Keys Active During Gameplay
- Symptoms: Number keys 1-4 directly push power-ups into the stack regardless of game state (lines 244-263 in `handleKeyDown`). These are developer cheats that ship in production.
- Files: `src/scenes/GameScene.ts` (lines 244-263)
- Trigger: Pressing 1, 2, 3, or 4 during gameplay.
- Workaround: None.
- Fix approach: Guard behind a debug flag (e.g., `import.meta.env.DEV`) or remove entirely.

## Security Considerations

### Leaderboard Score Submission Has No Server-Side Validation
- Risk: The client directly inserts scores into the Supabase `leaderboard` table. A malicious user can submit arbitrary scores using the Supabase client or REST API with the anon key.
- Files: `src/services/AuthService.ts` (lines 207-214)
- Current mitigation: None — uses Supabase anon key with direct table insert.
- Recommendations: Add Row Level Security (RLS) policies on the `leaderboard` table. Create a Supabase Edge Function that validates the score against a server-computed expected range before insertion. Rate-limit submissions per user.

### External CDN Dependencies in AuthScene
- Risk: OAuth button icons are loaded from `cdn.jsdelivr.net` at runtime. If the CDN is compromised or unavailable, icons fail to load. No SRI (Subresource Integrity) hashes.
- Files: `src/scenes/AuthScene.ts` (lines 18-19)
- Current mitigation: Phaser handles image load failures gracefully.
- Recommendations: Bundle the icons locally in `public/` instead of loading from CDN.

### Supabase Anon Key Exposed Client-Side
- Risk: `VITE_SUPABASE_ANON_KEY` is embedded in the client bundle. This is expected for Supabase (anon key is designed for client use), but the key must be paired with strict RLS policies.
- Files: `src/services/AuthService.ts` (lines 7, 13)
- Current mitigation: Standard Supabase pattern — anon key is public by design.
- Recommendations: Ensure all Supabase tables have RLS enabled. Review policies regularly. Never use the service role key client-side.

## Performance Bottlenecks

### Per-Frame Word Container Redraw
- Problem: `highlightTargetWord()` runs every frame and calls `redrawWordContainer()` for every active word, clearing and redrawing the entire graphics object each frame. Each redraw involves 5+ fill/stroke operations with rounded rectangles.
- Files: `src/scenes/GameScene.ts` (lines 705-751)
- Cause: No dirty-checking — containers are redrawn even when highlight state hasn't changed.
- Improvement path: Track previous highlight state per word. Only redraw when highlight state changes. Only redraw focused/unfocused container, not all containers.

### BackgroundRenderer Pixel-by-Pixel Gradient
- Problem: The alchemist background draws a gradient by iterating every pixel row (`for (let y = 0; y < GAME_HEIGHT; y++)`), creating 1080 individual fill operations.
- Files: `src/services/BackgroundRenderer.ts` (lines 44-51)
- Cause: No canvas gradient API usage — using Phaser graphics fill instead.
- Improvement path: Use a single `Phaser.GameObjects.Graphics` with a gradient texture, or create the gradient once as a `RenderTexture` and reuse it.

### Tween Accumulation in UIScene
- Problem: Power-up glow tweens are created every time `updatePowerBoxes()` is called but only tracked in `powerTweens[]` for the activation animation. The repeating glow tweens created at line 418-426 are pushed to `powerTweens[]` but never individually stopped during normal updates — they accumulate.
- Files: `src/scenes/UIScene.ts` (lines 418-426)
- Cause: Repeating tweens for glow effects are added each time power boxes update but old tweens are not stopped before creating new ones.
- Improvement path: Stop old glow tweens before creating new ones. Track glow tweens separately from activation tweens.

### Ember Particle Pool Never Cleans Up on Scene Stop
- Problem: The `emberPool` in `EffectManager` contains 15 circles with recursive animation callbacks. The `clearOverlays()` method destroys them, but if the scene is stopped without calling it, these orphaned tweens and callbacks persist.
- Files: `src/managers/EffectManager.ts` (lines 17, 34-73, 391-400)
- Cause: No scene lifecycle hook to guarantee cleanup.
- Improvement path: Implement a `destroy()` method on `EffectManager` and call it from `GameScene.shutdown()`.

## Fragile Areas

### Scene-to-Scene Coupling via String Keys
- Files: `src/scenes/GameScene.ts` (lines 91, 834), `src/scenes/UIScene.ts` (lines 75, 447, 838), `src/scenes/MenuScene.ts` (line 137)
- Why fragile: Scene references like `this.scene.get('GameScene') as GameScene` use magic strings. A typo causes a runtime crash with no compile-time warning. `UIScene` directly accesses `GameScene`'s public properties (`score`, `level`) bypassing the event system.
- Safe modification: Create a scene key enum/const object. Use the existing `gameDataUpdate` event consistently instead of direct property access.
- Test coverage: No unit tests for scene transitions.

### Theme Color Resolution at Module Load Time
- Files: `src/config/constants.ts` (lines 13-14, 34-57)
- Why fragile: `FONT_FAMILY`, `POWER_COLORS`, and `COLORS` are computed from `themeService` at import time. If the theme changes at runtime, these constants remain stale. `POWER_COLORS` is used for both initial rendering and per-frame redraws, meaning container colors won't match the active theme after a switch.
- Safe modification: Replace with getter functions or access `themeService` directly at usage sites instead of caching values in module-level constants.
- Test coverage: No tests for theme switching mid-game.

### Non-Null Assertions on `this.input.keyboard`
- Files: `src/scenes/GameScene.ts` (line 90), `src/scenes/MenuScene.ts` (lines 189, 194, 199, 207), `src/scenes/SettingsScene.ts` (lines 82-83)
- Why fragile: Using `!` operator assumes keyboard is always available. Phaser's keyboard manager can be null in certain configurations or during scene transitions.
- Safe modification: Add null checks: `this.input.keyboard?.on(...)`.
- Test coverage: Not tested.

### `AuthScene.onAuthSuccess` Fires Before UI Ready
- Files: `src/scenes/AuthScene.ts` (lines 280-283)
- Why fragile: The `console.log('Auth success:', user.name)` at line 281 is a debug log left in production code. More importantly, the auth callback and the `initialize()` promise can race — if the auth state change fires first, the `then()` block still runs and tries to draw UI on an already-transitioned scene.
- Safe modification: Remove the console.log. Add a guard in the `then()` block: `if (this.authHandled) return;`.
- Test coverage: No auth flow tests.

## Scaling Limits

### Leaderboard Fetched Without Pagination
- Current capacity: 20 entries (hardcoded limit in `getLeaderboard`).
- Limit: As the leaderboard grows, fetching top 20 remains fine, but `getUserRank()` and `submitScore()` both download the entire table with no limit.
- Scaling path: Use Supabase RPC for rank calculation. Add pagination to leaderboard display. Add indices on `score` and `user_id` columns.

### Word Dictionary Is Static JSON
- Current capacity: `src/data/words.json` contains a fixed set of words.
- Limit: At higher levels, word variety diminishes as the same words repeat. The `recentWords` set (max 50) mitigates immediate repetition but doesn't prevent eventual loops.
- Scaling path: Add more words to the dictionary. Consider difficulty-tiered word lists. Eventually, a server-side word API could provide unlimited variety.

### No Object Pooling for Word Visual Elements
- Current capacity: Each word creates a `Graphics` container, multiple `Text` objects for individual letters, and optionally a `Text` for frozen indicator. All are destroyed and garbage collected when the word is removed.
- Limit: At high spawn rates with many words on screen, GC pressure from constant object creation/destruction can cause frame drops.
- Scaling path: Implement an object pool for word containers and letter text objects.

## Dependencies at Risk

### Phaser 3
- Risk: Phaser is a large, complex framework. The game uses imperative Graphics drawing instead of Phaser's built-in UI system, which means no access to Phaser's layout, accessibility, or responsive features.
- Impact: All UI is position-by-coordinate, making responsive design impossible without rewriting.
- Migration plan: Consider using Phaser's DOM UI layer for complex overlays (menus, settings) while keeping canvas rendering for gameplay.

### Supabase Client-Side Auth
- Risk: Auth logic runs entirely client-side. The `signInAnonymously` flow doesn't verify user identity, allowing unlimited guest accounts.
- Impact: Leaderboard can be spammed with anonymous scores.
- Migration plan: Implement CAPTCHA or rate limiting on anonymous sign-ups via Supabase Edge Functions.

## Missing Critical Features

### No Pause Functionality
- Problem: There is no way to pause the game during gameplay. The only options are to let words fall or restart. If a player needs to look away, they will lose.
- Blocks: Player quality of life. Expected feature in any game.

### No Responsive Design
- Problem: The game uses a fixed 1920×1080 virtual canvas with no scaling adaptation. On smaller screens or mobile devices, the game is either letterboxed or scaled down, making text unreadable.
- Blocks: Mobile play, different screen sizes.

### No Keyboard Accessibility
- Problem: All game interaction is keyboard-based for typing, but menus require mouse clicks. There's no tab navigation, focus indicators, or screen reader support.
- Blocks: Accessibility compliance (WCAG).

### SettingsScene Doesn't Include Theme Switcher
- Problem: The `ThemeService` supports theme switching and `SettingsScene` exists, but the settings panel only has audio controls. Theme selection is not exposed to the player.
- Blocks: Player customization.

## Test Coverage Gaps

### No Unit Tests
- What's not tested: All services (`AuthService`, `AudioService`, `WordService`, `StorageService`, `GameConfigService`, `ThemeService`), all managers (`EffectManager`), all UI components (`ProgressBar`, `Button`, `GameOverOverlay`), and all game logic (scoring, combos, power-ups, word matching).
- Files: `src/services/*.ts`, `src/managers/*.ts`, `src/ui/*.ts`, `src/scenes/*.ts`
- Risk: Any refactor or bug fix could introduce regressions without detection.
- Priority: High — services like `WordService`, `GameConfigService`, and `StorageService` are pure logic and trivially testable.

### E2E Tests Are Fragile Position-Based Clicks
- What's not tested: E2E tests click canvas at hardcoded percentage positions (e.g., 62% down for "Play as Guest"). Any UI layout change breaks all tests.
- Files: `tests/game.spec.ts`
- Risk: Tests give false confidence — they pass on current layout but fail on any change.
- Priority: Medium — use data-testid attributes or render overlay elements with DOM accessibility hints.

### No Test for Score Calculation
- What's not tested: The scoring system (combo multipliers, accuracy bonuses, fire power-up points, level total calculation) has complex logic with no automated verification.
- Files: `src/scenes/GameScene.ts` (lines 432-478, 814-831)
- Risk: Scoring bugs would go undetected and affect competitive play.
- Priority: High — extract scoring logic into a testable service.

---

*Concerns audit: 2026-04-10*
