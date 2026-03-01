import posthog from 'posthog-js';

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com';
const isConfigured = !!POSTHOG_KEY;

export function initAnalytics() {
  if (!isConfigured) {
    console.log('[Analytics] PostHog not configured, skipping initialization');
    return;
  }

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    capture_pageview: true,
    session_recording: {
      maskAllInputs: false,
    },
  });

  console.log('[Analytics] PostHog initialized');
}

export function identifyUser(id: string, properties?: Record<string, unknown>) {
  if (!isConfigured) return;
  
  posthog.identify(id, properties);
}

export function resetUser() {
  if (!isConfigured) return;
  
  posthog.reset();
}

export function trackEvent(event: string, properties?: Record<string, unknown>) {
  if (!isConfigured) {
    console.log(`[Analytics] Event: ${event}`, properties);
    return;
  }

  posthog.capture(event, properties);
}

export function trackGameStart(theme: string) {
  trackEvent('game_started', { theme });
}

export function trackGameOver(score: number, level: number, wordsCompleted: number, wordsMissed: number) {
  trackEvent('game_over', { score, level, wordsCompleted, wordsMissed });
}

export function trackLevelComplete(level: number, score: number, accuracy: number) {
  trackEvent('level_complete', { level, score, accuracy });
}

export function trackPowerUpUsed(powerType: string) {
  trackEvent('power_up_used', { type: powerType });
}

export function trackThemeChange(fromTheme: string, toTheme: string) {
  trackEvent('theme_changed', { from: fromTheme, to: toTheme });
}

export function trackAuthSignIn(method: 'google' | 'facebook' | 'guest') {
  trackEvent('sign_in', { method });
}

export function trackAuthSignOut() {
  trackEvent('sign_out');
}

export function trackLeaderboardView(isGlobal: boolean) {
  trackEvent('leaderboard_viewed', { type: isGlobal ? 'global' : 'local' });
}

export function trackTutorialView() {
  trackEvent('tutorial_viewed');
}

export function trackSettingsView() {
  trackEvent('settings_viewed');
}
