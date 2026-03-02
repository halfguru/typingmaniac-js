# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2025-03-01

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

### Fixed

- OAuth redirect URL for GitHub Pages subpath support
