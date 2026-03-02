# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2026-03-02

### Fixed

- Restore words per level to 8 for levels 1-2 (was accidentally set to 1)

## [1.0.0] - 2026-03-01

### Added

- Phaser 3 + TypeScript browser game with Vite build system
- Two visual themes: Cyberpunk (default) and Alchemist
- Supabase authentication (Google, Facebook, Guest) - optional
- Global leaderboard with Supabase backend - optional
- Local leaderboard fallback when Supabase not configured
- Sentry error tracking - optional
- PostHog analytics - optional
- Audio system with typing sounds, power-ups, and music
- Settings scene with volume controls
- Interactive tutorial
- Power-ups: Fire, Ice, Slow, Wind
- Smooth scene transitions
- Footer with GitHub link in menu
- CI workflow for GitHub releases

### Fixed

- Black screen when restarting game after game over (corrupted UIScene.updatePowerBoxes)
