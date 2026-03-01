# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2025-03-01

### Added

- **PostHog Analytics** - Optional privacy-friendly analytics
  - Track game events: starts, game overs, level completions, power-up usage
  - Track UI interactions: tutorial, settings, leaderboard views
  - Track authentication events: sign in, sign out
- **Sentry Error Tracking** - Optional production error monitoring
- **Local Leaderboard** - Fallback when Supabase not configured
- **ESC to Menu** - Return to main menu from game over screen
- **OAuth Logos** - Google (G) and Facebook (f) logos on sign-in buttons
- **Version Badge** - More visible version display in menu (top-left)

### Changed

- **License changed to CC BY-NC 4.0** - Non-commercial use only
- **Supabase is now optional** - Game works without any configuration
- **Improved observability** - All services now optional and configurable via environment variables
- **Improved countdown scene** - Ring animation with particles and burst effect
- **Improved UX** - Better button positioning and navigation

### Fixed

- Game state issues when exiting overlays

## [1.0.0] - 2025-02-28

### Added

- **Global Leaderboard** with Supabase backend
- **OAuth Authentication** - Google, Facebook, and Anonymous (guest)
- **User Avatars** - Display profile pictures in leaderboard
- **Audio System** - Typing sounds, power-ups, game events, ambient music
- **Settings Scene** - Volume sliders for master, SFX, and music
- **Tutorial System** - Interactive guide explaining game mechanics
- **Scene Transitions** - Smooth fade effects between scenes
- **High Score Display** - Celebration animation for new records
- **Alchemist Theme** - Wizard character with magical effects
- **Power-ups** - Fire, Ice, Slow, and Wind abilities
- **Multiple Themes** - Cyberpunk (default) and Alchemist

### Technical

- TypeScript + Phaser 3 + Vite
- Environment-based configuration
- Local storage for settings and scores
